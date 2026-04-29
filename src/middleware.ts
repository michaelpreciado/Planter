import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyDeviceToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow /api/pair endpoints (no auth required)
  if (pathname.startsWith('/api/pair')) {
    return NextResponse.next();
  }
  
  // Protect all other /api/* routes
  if (pathname.startsWith('/api/')) {
    const authResult = await verifyDeviceToken(request);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Add device info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-device-id', authResult.deviceId);
    requestHeaders.set('x-device-ip', authResult.ip);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
