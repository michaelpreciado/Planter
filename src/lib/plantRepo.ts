import { db } from './db';
import type { Plant, NoteEntry } from './schemas';
import { v4 as uuidv4 } from 'uuid';

export async function listPlants(): Promise<Plant[]> {
  return db.plants.orderBy('createdAt').reverse().toArray();
}

export async function getPlant(id: string): Promise<Plant | undefined> {
  return db.plants.get(id);
}

export async function upsertPlant(plant: Plant): Promise<void> {
  const now = new Date().toISOString();
  await db.plants.put({
    ...plant,
    updatedAt: now,
    createdAt: plant.createdAt || now,
  });
}

export async function deletePlant(id: string): Promise<void> {
  await db.plants.delete(id);
  // Also delete associated notes
  await db.notes.where('plantId').equals(id).delete();
}

export async function addNote(plantId: string, body: string): Promise<NoteEntry> {
  const note: NoteEntry = {
    id: uuidv4(),
    plantId,
    createdAt: new Date().toISOString(),
    body,
  };
  
  await db.notes.add(note);
  
  // Update plant's notes array
  const plant = await db.plants.get(plantId);
  if (plant) {
    await db.plants.update(plantId, {
      notes: [...plant.notes, note],
      updatedAt: new Date().toISOString(),
    });
  }
  
  return note;
}

export async function waterPlant(id: string): Promise<void> {
  const plant = await db.plants.get(id);
  if (!plant) return;
  
  const now = new Date().toISOString();
  
  // Add auto-note for watering
  const note: NoteEntry = {
    id: uuidv4(),
    plantId: id,
    createdAt: now,
    body: 'Watered',
  };
  
  await db.notes.add(note);
  
  // Update plant
  await db.plants.update(id, {
    lastWatered: now,
    notes: [...plant.notes, note],
    updatedAt: now,
  });
}

export async function overdueHighPriority(): Promise<Plant[]> {
  const now = new Date().getTime();
  
  const allPlants = await db.plants
    .where('priority')
    .equals('high')
    .toArray();
  
  return allPlants.filter(plant => {
    const lastWatered = new Date(plant.lastWatered).getTime();
    const intervalMs = plant.wateringIntervalDays * 24 * 60 * 60 * 1000;
    return (now - lastWatered) > intervalMs;
  });
}
