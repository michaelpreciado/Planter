import { NextRequest, NextResponse } from 'next/server';
import { verifyDeviceToken } from '@/lib/auth';

// DELETE /api/plants/[id] - Delete a specific plant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyDeviceToken(request);
  
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  // In a full implementation, we'd delete from Supabase here
  
  return NextResponse.json({ success: true, id });
}
