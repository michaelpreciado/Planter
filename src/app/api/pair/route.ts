import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { PairRequestSchema, type PairResponse } from '@/lib/schemas';

export const runtime = 'edge';

const JWT_SECRET = new TextEncoder().encode(
  process.env.DEVICE_SECRET || 'fallback-secret-change-me'
);
const TOKEN_EXPIRY = '180d';

// Get client IP from headers
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

// Initialize devices table (create if not exists)
async function ensureDevicesTable(supabase: any) {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS devices (
        id uuid PRIMARY KEY,
        name text NOT NULL,
        public_key text NOT NULL,
        bound_ip text NOT NULL,
        created_at timestamptz DEFAULT now(),
        last_seen_at timestamptz DEFAULT now()
      );
    `
  });
  // Ignore errors - table might already exist
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Parse and validate request
    const pairRequest = PairRequestSchema.parse(body);
    
    const deviceId = uuidv4();
    const boundIp = getClientIP(request);
    
    // In a real implementation, we'd insert into Supabase here
    // For now, we'll simulate it and return a JWT
    
    // Create JWT token
    const token = await new SignJWT({
      deviceId,
      ip: boundIp,
      pk: pairRequest.publicKey,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(JWT_SECRET);
    
    const response: PairResponse = {
      token,
      deviceId,
      boundIp,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
