import { NextResponse } from 'next/server';
import { getDailyReport } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const report = getDailyReport();
  return NextResponse.json({ success: true, data: report });
}
