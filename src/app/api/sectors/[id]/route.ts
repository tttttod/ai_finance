import { NextResponse } from 'next/server';
import { getSectorById, getAllSectors } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sector = getSectorById(id);
  if (!sector) {
    return NextResponse.json(
      { success: false, error: '板块不存在' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: sector });
}

export async function generateStaticParams() {
  return getAllSectors().map((s) => ({ id: s.id }));
}
