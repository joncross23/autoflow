/**
 * Voice Capture Types
 * V1.7: Voice capture feature for quick idea creation
 */

/**
 * Generated idea from voice input
 */
export interface GeneratedIdea {
  title: string;
  description: string;
}

/**
 * State machine for voice capture flow
 */
export type VoiceCaptureState =
  | { status: "idle" }
  | { status: "requesting_permission" }
  | { status: "permission_denied"; error: string }
  | { status: "recording"; duration: number }
  | { status: "processing" }
  | { status: "review"; idea: GeneratedIdea }
  | { status: "saving" }
  | { status: "success" }
  | { status: "error"; error: string };

/**
 * Audio recorder state
 */
export interface AudioRecorderState {
  isRecording: boolean;
  duration: number;
  error: string | null;
  permissionDenied: boolean;
}

/**
 * Transcription response from Whisper API
 */
export interface TranscriptionResponse {
  transcript: string;
}

/**
 * Idea generation response from Claude API
 */
export interface IdeaGenerationResponse {
  title: string;
  description: string;
}
