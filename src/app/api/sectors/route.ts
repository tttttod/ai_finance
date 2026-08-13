import { NextResponse } from 'next/server';
import { getAllSectors } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sectors = getAllSectors();
  return NextResponse.json({ success: true, data: sectors });
}
