// =============================================
// API Key helper for cloud (Vercel) deployment
// Priority: request header > environment variable > memory
// =============================================

let memoryApiKey: string | null = null;

// History (in-memory, resets on serverless cold start)
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

/**
 * Get API key from request.
 * Priority: x-apify-key header > APIFY_API_KEY env var > memory
 */
export function getApiKeyFromRequest(request?: Request): string | null {
  // 1. Check header (sent from frontend localStorage)
  if (request) {
    const headerKey = request.headers.get('x-apify-key');
    if (headerKey && headerKey.startsWith('apify_api_')) {
      return headerKey;
    }
  }
  // 2. Check environment variable
  if (process.env.APIFY_API_KEY) {
    return process.env.APIFY_API_KEY;
  }
  // 3. Check memory (last resort, only works in long-running server)
  return memoryApiKey;
}

export function setApiKeyInMemory(key: string): void {
  memoryApiKey = key;
}

export function isEnvVarConfigured(): boolean {
  return !!process.env.APIFY_API_KEY;
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
