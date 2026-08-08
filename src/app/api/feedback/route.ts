import { NextRequest, NextResponse } from "next/server";
import { saveUserFeedback } from "@/lib/data/feedback-store";
import type { UserFeedbackPayload } from "@/lib/feedback-types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, selectedIssues, dimensionScores, comment, page } = body;

    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "rating must be a number between 1 and 5" },
        { status: 400 },
      );
    }

    // Validate dimensionScores (new format) or selectedIssues (legacy)
    if (dimensionScores !== undefined) {
      if (typeof dimensionScores !== "object" || dimensionScores === null || Array.isArray(dimensionScores)) {
        return NextResponse.json(
          { success: false, error: "dimensionScores must be an object" },
          { status: 400 },
        );
      }
    } else if (selectedIssues !== undefined) {
      if (!Array.isArray(selectedIssues) || !selectedIssues.every((i: unknown) => typeof i === "string")) {
        return NextResponse.json(
          { success: false, error: "selectedIssues must be a string array" },
          { status: 400 },
        );
      }
    }

    // Validate comment length
    if (comment && typeof comment === "string" && comment.length > 1000) {
      return NextResponse.json(
        { success: false, error: "comment must be at most 1000 characters" },
        { status: 400 },
      );
    }

    const payload: UserFeedbackPayload = {
      rating,
      ...(dimensionScores ? { dimensionScores } : {}),
      ...(selectedIssues ? { selectedIssues } : {}),
      comment: comment || "",
      page: page || "unknown",
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || undefined,
    };

    await saveUserFeedback(payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 },
  );
}
