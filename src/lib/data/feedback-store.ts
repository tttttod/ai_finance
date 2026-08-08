/**
 * Feedback persistence layer.
 * Priority: Supabase. Fallback: .cache/user-feedback.jsonl
 */

import type { UserFeedbackPayload } from "../feedback-types";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const FEEDBACK_FILE = path.join(CACHE_DIR, "user-feedback.jsonl");

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export async function saveUserFeedback(
  payload: UserFeedbackPayload,
): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("user_feedback").insert({
        rating: payload.rating,
        selected_issues: payload.selectedIssues,
        comment: payload.comment,
        page: payload.page,
        user_agent: payload.userAgent || null,
      });
      return;
    } catch {
      // fall through to file
    }
  }

  // File fallback: append JSONL
  ensureCacheDir();
  const line = JSON.stringify(payload) + "\n";
  fs.appendFileSync(FEEDBACK_FILE, line, "utf-8");
}
