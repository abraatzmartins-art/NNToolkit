// =============================================
// Memory-based store for cloud deployment (Vercel)
// Works without SQLite/Prisma
// API key can be set via UI (stored in memory)
// or via environment variable APIFY_API_KEY
// =============================================

// In-memory storage
let memoryApiKey: string | null = null;
const memoryHistory: Array<{
  id: string;
  actorId: string;
  actorName: string;
  inputParams: string;
  status: string;
  resultsCount: number;
  runId: string | null;
  createdAt: string;
  completedAt: string | null;
}> = [];

const memoryCustomActors: Array<{
  id: string;
  actorId: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  inputSchema: string;
  outputFields: string;
  pricingInfo: string;
  isActive: boolean;
  createdAt: string;
}> = [];

// Get API key: environment variable takes priority, then memory
export function getApiKey(): string | null {
  return process.env.APIFY_API_KEY || memoryApiKey;
}

// Set API key in memory
export function setApiKey(key: string): void {
  memoryApiKey = key;
}

// Check if API key is configured
export function isApiKeyConfigured(): boolean {
  return !!(process.env.APIFY_API_KEY || memoryApiKey);
}

// History functions
export function getHistory(limit = 50) {
  return [...memoryHistory].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, limit);
}

export function addToHistory(data: {
  actorId: string;
  actorName?: string;
  inputParams: string;
  status: string;
  runId: string | null;
}) {
  const item = {
    id: crypto.randomUUID(),
    actorId: data.actorId,
    actorName: data.actorName || data.actorId,
    inputParams: data.inputParams,
    status: data.status,
    resultsCount: 0,
    runId: data.runId,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  memoryHistory.push(item);
  return item;
}

export function updateHistoryRunId(oldRunId: string | null, newRunId: string) {
  const item = memoryHistory.find(h => h.runId === oldRunId);
  if (item) item.runId = newRunId;
}

export function updateHistoryResults(runId: string, count: number) {
  const item = memoryHistory.find(h => h.runId === runId);
  if (item) {
    item.resultsCount = count;
    item.status = 'completed';
    item.completedAt = new Date().toISOString();
  }
}

export function deleteHistoryItem(id: string) {
  const idx = memoryHistory.findIndex(h => h.id === id);
  if (idx !== -1) memoryHistory.splice(idx, 1);
}

export function clearHistory() {
  memoryHistory.length = 0;
}

// Custom actors functions
export function getCustomActors() {
  return memoryCustomActors.filter(a => a.isActive);
}

export function getCustomActorById(actorId: string) {
  return memoryCustomActors.find(a => a.actorId === actorId);
}

export function addCustomActor(data: {
  actorId: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  inputSchema: string;
  outputFields?: string;
  pricingInfo?: string;
}) {
  const existing = getCustomActorById(data.actorId);
  if (existing) return null;

  const item = {
    id: crypto.randomUUID(),
    actorId: data.actorId,
    name: data.name,
    description: data.description || '',
    category: data.category || 'custom',
    icon: data.icon || 'Globe',
    color: data.color || '#6366f1',
    inputSchema: data.inputSchema,
    outputFields: data.outputFields || '[]',
    pricingInfo: data.pricingInfo || '',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  memoryCustomActors.push(item);
  return item;
}

export function deleteCustomActor(id: string) {
  const idx = memoryCustomActors.findIndex(a => a.id === id);
  if (idx !== -1) memoryCustomActors.splice(idx, 1);
}
