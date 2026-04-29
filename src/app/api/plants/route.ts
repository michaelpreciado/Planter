import { NextRequest, NextResponse } from 'next/server';
import { verifyDeviceToken } from '@/lib/auth';
import { PlantSchema, type Plant } from '@/lib/schemas';

// GET /api/plants - Get all plants for the authenticated device
export async function GET(request: NextRequest) {
  const authResult = await verifyDeviceToken(request);
  
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // In a full implementation, we'd query Supabase here
  // For now, return empty array (local-first means local is source of truth)
  // The client will sync local data up
  
  return NextResponse.json({ plants: [] });
}

// POST /api/plants - Upsert plants for the authenticated device
export async function POST(request: NextRequest) {
  const authResult = await verifyDeviceToken(request);
  
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const plants = body.plants;
    
    if (!Array.isArray(plants)) {
      return NextResponse.json({ error: 'Plants must be an array' }, { status: 400 });
    }
    
    // Validate each plant
    const validatedPlants: Plant[] = plants.map((plant: unknown) => 
      PlantSchema.parse(plant)
    );
    
    // In a full implementation, we'd upsert to Supabase here
    // Using jsonb payload column for the entire plant blob
    
    return NextResponse.json({ 
      success: true, 
      count: validatedPlants.length 
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
