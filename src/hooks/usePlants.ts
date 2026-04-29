'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { listPlants, waterPlant, upsertPlant, deletePlant, addNote } from '@/lib/plantRepo';
import type { Plant, NoteEntry } from '@/lib/schemas';
import { useState, useCallback } from 'react';

export function usePlants() {
  const plants = useLiveQuery(() => listPlants(), []);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const water = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await waterPlant(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to water plant');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const save = useCallback(async (plant: Plant) => {
    setLoading(true);
    setError(null);
    try {
      await upsertPlant(plant);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save plant');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletePlant(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete plant');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const addNoteToPlant = useCallback(async (plantId: string, body: string): Promise<NoteEntry | null> => {
    setLoading(true);
    setError(null);
    try {
      return await addNote(plantId, body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add note');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    plants: plants ?? [],
    loading: loading || plants === undefined,
    error,
    water,
    save,
    remove,
    addNote: addNoteToPlant,
  };
}
