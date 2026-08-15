import { NextResponse } from "next/server";
import { saveUserFeedback } from "@/lib/data/feedback-store";
import type { UserFeedbackPayload } from "@/lib/feedback-types";

export const dynamic = "force-dynamic";

/**
 * Test endpoint for verifying feedback pipeline.
 * Only accessible with admin secret.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("x-admin-secret");
  const expectedSecret = process.env.ADMIN_REFRESH_SECRET;

  if (!expectedSecret || authHeader !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { rating, comment, page } = body;

    // Create a test payload
    const testPayload: UserFeedbackPayload = {
      rating: rating ?? 5,
      dimensionScores: {
        timeliness: 5,
        recommendation: 5,
        ai_clarity: 5,
        risk_warning: 5,
        ux_smooth: 5,
        retention: 5,
      },
      comment: comment ?? `[TEST] Feedback pipeline test at ${new Date().toISOString()}`,
      page: page ?? "admin-test",
      createdAt: new Date().toISOString(),
      userAgent: "admin-test-client",
    };

    const result = await saveUserFeedback(testPayload);

    return NextResponse.json({
      success: true,
      message: "Test feedback submitted successfully",
      savedTo: result.savedTo,
      payload: testPayload,
      supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Feedback test endpoint. POST to submit a test feedback.",
    requiredHeaders: {
      "x-admin-secret": "ADMIN_REFRESH_SECRET from .env",
    },
    exampleBody: {
      rating: 5,
      comment: "Test feedback",
      page: "admin-test",
    },
  });
}
