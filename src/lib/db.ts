import Dexie, { Table } from 'dexie';
import type { Plant, NoteEntry } from './schemas';

export class PlanterDatabase extends Dexie {
  plants!: Table<Plant, string>;
  notes!: Table<NoteEntry, string>;

  constructor() {
    super('PlanterDB');
    
    this.version(1).stores({
      plants: 'id, priority, lastWatered, updatedAt',
      notes: 'id, plantId, createdAt',
    });
  }
}

export const db = new PlanterDatabase();
