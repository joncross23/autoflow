"use client";

import { useState, useCallback } from "react";
import { useAudioRecorder } from "./useAudioRecorder";
import type { VoiceCaptureState, GeneratedIdea } from "@/types/voice";

interface UseVoiceCaptureReturn {
  state: VoiceCaptureState;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  reset: () => void;
}

/**
 * Orchestration hook for the complete voice capture flow
 * Manages recording → transcription → idea generation → review
 */
export function useVoiceCapture(): UseVoiceCaptureReturn {
  const [state, setState] = useState<VoiceCaptureState>({ status: "idle" });

  const handleMaxDuration = useCallback(() => {
    // Will be called when max duration (60s) is reached
    // The stopRecording flow will handle the rest
  }, []);

  const {
    isRecording,
    duration,
    error: recorderError,
    permissionDenied,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    cancelRecording,
  } = useAudioRecorder({
    maxDuration: 60,
    onMaxDurationReached: handleMaxDuration,
  });

  const startRecording = useCallback(async () => {
    setState({ status: "requesting_permission" });

    try {
      await startAudioRecording();
      // If successful, recorder will set isRecording to true
      // We'll update state based on that
    } catch {
      // Error is handled by the recorder hook
    }
  }, [startAudioRecording]);

  // Sync state with recorder
  // Update state based on recorder state changes
  const syncState = useCallback(() => {
    if (permissionDenied) {
      setState({
        status: "permission_denied",
        error:
          recorderError || "Microphone access denied. Please allow access.",
      });
    } else if (recorderError && !isRecording) {
      setState({ status: "error", error: recorderError });
    } else if (isRecording) {
      setState({ status: "recording", duration });
    }
  }, [permissionDenied, recorderError, isRecording, duration]);

  // Call syncState when relevant states change
  if (
    state.status === "requesting_permission" &&
    (isRecording || permissionDenied || recorderError)
  ) {
    syncState();
  }

  // Keep recording state duration updated
  if (state.status === "recording" && state.duration !== duration) {
    setState({ status: "recording", duration });
  }

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;

    setState({ status: "processing" });

    try {
      const audioBlob = await stopAudioRecording();

      if (!audioBlob) {
        setState({ status: "error", error: "No audio recorded" });
        return;
      }

      // Check if recording is too short
      if (audioBlob.size < 10 * 1024) {
        setState({
          status: "error",
          error: "Recording too short. Please speak for at least 2 seconds.",
        });
        return;
      }

      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeResponse = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        setState({
          status: "error",
          error: errorData.error || "Failed to transcribe audio",
        });
        return;
      }

      const { transcript } = await transcribeResponse.json();

      if (!transcript) {
        setState({
          status: "error",
          error: "Could not understand audio. Please try again.",
        });
        return;
      }

      // Step 2: Generate idea from transcript
      const createResponse = await fetch("/api/voice/create-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        setState({
          status: "error",
          error: errorData.error || "Failed to generate idea",
        });
        return;
      }

      const idea: GeneratedIdea = await createResponse.json();

      // Step 3: Present for review
      setState({ status: "review", idea });
    } catch (error) {
      console.error("Voice capture error:", error);
      setState({
        status: "error",
        error: "Connection error. Please check your internet and try again.",
      });
    }
  }, [isRecording, stopAudioRecording]);

  const reset = useCallback(() => {
    cancelRecording();
    setState({ status: "idle" });
  }, [cancelRecording]);

  return {
    state,
    duration,
    startRecording,
    stopRecording,
    reset,
  };
}
