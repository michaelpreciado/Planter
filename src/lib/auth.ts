import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.DEVICE_SECRET || 'fallback-secret-change-me'
);

const STRICT_IP_BINDING = process.env.STRICT_IP_BINDING === 'true';

interface DevicePayload {
  deviceId: string;
  ip: string;
  pk: string;
}

export async function verifyDeviceToken(
  request: NextRequest
): Promise<{ deviceId: string; ip: string } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.slice(7);
    
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const devicePayload = payload as unknown as DevicePayload;
    
    if (!devicePayload.deviceId) {
      return null;
    }
    
    // Optionally check IP binding
    if (STRICT_IP_BINDING) {
      const clientIP = getClientIP(request);
      if (clientIP !== devicePayload.ip) {
        return null;
      }
    }
    
    return {
      deviceId: devicePayload.deviceId,
      ip: devicePayload.ip,
    };
  } catch (error) {
    return null;
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}
