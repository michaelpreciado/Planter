'use client';

import { PairRequestSchema, type PairResponse } from '@/lib/schemas';

const TOKEN_KEY = 'planter.device.token';

interface DeviceInfo {
  deviceId: string;
  ip: string;
  deviceName: string;
}

// Generate a friendly device name
function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device';
  
  const ua = navigator.userAgent;
  const isMac = ua.includes('Mac');
  const isIPhone = ua.includes('iPhone');
  const isIPad = ua.includes('iPad');
  const isAndroid = ua.includes('Android');
  
  if (isIPhone) return "Michael's iPhone";
  if (isIPad) return "Michael's iPad";
  if (isMac) return "Michael's Mac";
  if (isAndroid) return "Michael's Android";
  return "Michael's Device";
}

// Generate a keypair (simple version - in production use Web Crypto API)
function generateKeypair(): { publicKey: string; privateKey: string } {
  // For simplicity, we'll generate a random keypair
  // In production, use Web Crypto API's generateKey with Ed25519
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let publicKey = '';
  let privateKey = '';
  
  for (let i = 0; i < 32; i++) {
    publicKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 64; i++) {
    privateKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return { publicKey, privateKey };
}

// Get stored token
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Store token
export function storeToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

// Ensure device is paired
export async function ensureDevice(): Promise<DeviceInfo | null> {
  if (typeof window === 'undefined') return null;
  
  // Check if already paired
  const existingToken = getStoredToken();
  if (existingToken) {
    // Decode token to get device info (without verification - verification is server job)
    try {
      const parts = existingToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return {
          deviceId: payload.deviceId,
          ip: payload.ip || 'unknown',
          deviceName: getDeviceName(),
        };
      }
    } catch (e) {
      // Invalid token, re-pair
      localStorage.removeItem(TOKEN_KEY);
    }
  }
  
  // Generate keypair and pair device
  const { publicKey } = generateKeypair();
  const deviceName = getDeviceName();
  
  try {
    const response = await fetch('/api/pair', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey,
        deviceName,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Pairing failed');
    }
    
    const data: PairResponse = await response.json();
    storeToken(data.token);
    
    return {
      deviceId: data.deviceId,
      ip: data.boundIp,
      deviceName,
    };
  } catch (error) {
    console.error('Device pairing failed:', error);
    return null;
  }
}

// Authed fetch - adds Authorization header
export async function authedFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = getStoredToken();
  
  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...init,
    headers,
  });
}

// Generate a 6-digit pair code
export function generatePairCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
