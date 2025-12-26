/**
 * Password Hashing API Route
 * Provides secure bcrypt-based password hashing and verification
 *
 * Security: Uses bcrypt with cost factor 12 for proper password hashing
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Cost factor for bcrypt - 12 provides good security without excessive delay
const BCRYPT_COST_FACTOR = 12;

interface HashRequest {
  password: string;
  action: "hash" | "verify";
  hash?: string;
}

interface HashResponse {
  hash?: string;
  valid?: boolean;
  error?: string;
}

/**
 * POST /api/views/hash-password
 *
 * Actions:
 * - hash: Generate a bcrypt hash for the provided password
 * - verify: Compare a password against an existing hash
 */
export async function POST(request: NextRequest): Promise<NextResponse<HashResponse>> {
  try {
    const body = await request.json() as HashRequest;
    const { password, action, hash } = body;

    // Validate required fields
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required and must be a string" },
        { status: 400 }
      );
    }

    if (!action || !["hash", "verify"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be either 'hash' or 'verify'" },
        { status: 400 }
      );
    }

    // Enforce reasonable password length limits to prevent DoS
    if (password.length > 72) {
      // bcrypt truncates passwords at 72 bytes
      return NextResponse.json(
        { error: "Password exceeds maximum length of 72 characters" },
        { status: 400 }
      );
    }

    if (password.length < 1) {
      return NextResponse.json(
        { error: "Password cannot be empty" },
        { status: 400 }
      );
    }

    if (action === "hash") {
      // Generate salt and hash the password
      const salt = await bcrypt.genSalt(BCRYPT_COST_FACTOR);
      const hashedPassword = await bcrypt.hash(password, salt);

      return NextResponse.json({ hash: hashedPassword });
    }

    if (action === "verify") {
      if (!hash || typeof hash !== "string") {
        return NextResponse.json(
          { error: "Hash is required for verification" },
          { status: 400 }
        );
      }

      // Verify the password against the stored hash
      const isValid = await bcrypt.compare(password, hash);

      return NextResponse.json({ valid: isValid });
    }

    // This should never be reached due to validation above
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Password hashing error:", error);
    return NextResponse.json(
      { error: "Password operation failed" },
      { status: 500 }
    );
  }
}
