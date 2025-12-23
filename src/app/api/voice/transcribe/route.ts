import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Parse FormData with audio file
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB for Whisper)
    const maxSize = 25 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: "Audio file too large. Maximum size is 25MB." },
        { status: 400 }
      );
    }

    // Check minimum duration (roughly estimate from file size)
    // Very short recordings (<2 seconds) typically < 50KB
    const minSize = 10 * 1024; // 10KB minimum
    if (audioFile.size < minSize) {
      return NextResponse.json(
        { error: "Recording too short. Please speak for at least 2 seconds." },
        { status: 400 }
      );
    }

    // Call Whisper API for transcription
    const openai = getOpenAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "json",
    });

    const transcript = transcription.text.trim();

    if (!transcript) {
      return NextResponse.json(
        { error: "Could not transcribe audio. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Transcription error:", error);

    // Handle missing API key
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "Voice transcription is not configured" },
        { status: 503 }
      );
    }

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 400) {
        return NextResponse.json(
          { error: "Invalid audio format. Please try recording again." },
          { status: 400 }
        );
      }
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Transcription service unavailable" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to transcribe audio. Please try again." },
      { status: 500 }
    );
  }
}
