export type PlantStatus = 'thriving' | 'watch' | 'urgent';

export type PlantPhoto = {
  id: string;
  dataUrl: string;
  note: string;
  createdAt: string;
  aiSummary?: string;
};

export type PlantEntry = {
  id: string;
  name: string;
  type: string;
  location: string;
  careGoal: string;
  status: PlantStatus;
  important: boolean;
  reminderDays?: number;
  lastCareAt?: string;
  createdAt: string;
  updatedAt: string;
  photos: PlantPhoto[];
  notes: string[];
};

export type AiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  plantId?: string;
  important?: boolean;
};

export type OfflineModel = {
  id: string;
  name: string;
  size: string;
  status: 'not-installed' | 'queued' | 'ready';
};

export type PlanterBackup = {
  schema: 'planter.local.v2';
  exportedAt: string;
  plants: PlantEntry[];
  messages: AiMessage[];
  model: OfflineModel;
};
