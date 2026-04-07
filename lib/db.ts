// =============================================
// Database Layer — Turso (libSQL) Backend
// Replaces in-memory Map storage with persistent SQLite
// =============================================
import { getTursoClient, initDatabase } from './turso';

// ---- Lazy initialization ----
async function ensureDb() {
  await initDatabase();
}

// ============================================
// API KEY MANAGEMENT
// ============================================

/**
 * Get API key from request or env var.
 * Priority: x-apify-key header > process.env.APIFY_API_KEY > DB setting
 */
export function getApiKeyFromRequest(request?: Request): string | null {
  // 1. Check header (sent from frontend localStorage)
  if (request) {
    const headerKey = request.headers.get('x-apify-key');
    if (headerKey && headerKey.trim().startsWith('apify_api_')) {
      return headerKey.trim();
    }
  }
  // 2. Check environment variable (Vercel env, .env.local, etc.)
  if (process.env.APIFY_API_KEY) {
    return process.env.APIFY_API_KEY;
  }
  // 3. DB is checked via async getApiKeyFromDb() in routes
  return null;
}

/** Check if env var APIFY_API_KEY is set */
export function isEnvVarConfigured(): boolean {
  return !!process.env.APIFY_API_KEY;
}

/** Check if DB has an API key stored */
export async function getApiKeyFromDb(): Promise<string | null> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const result = await client.execute({
      sql: 'SELECT value FROM user_settings WHERE key = ?',
      args: ['api_key'],
    });
    if (result.rows.length > 0) {
      const val = result.rows[0].value as string;
      if (val && val.startsWith('apify_api_')) return val;
    }
  } catch (err) {
    console.error('[DB] Error reading API key:', err);
  }
  return null;
}

/** Save API key to DB */
export async function setApiKeyInDb(key: string): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({
      sql: `INSERT INTO user_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      args: ['api_key', key],
    });
    return true;
  } catch (err) {
    console.error('[DB] Error saving API key:', err);
    return false;
  }
}

/** Check all sources for API key availability */
export async function checkApiKeyStatus(): Promise<{ envVar: boolean; db: boolean; header: boolean }> {
  return {
    envVar: !!process.env.APIFY_API_KEY,
    db: !!(await getApiKeyFromDb()),
    header: false, // checked per-request
  };
}

// ============================================
// HISTORY (search_runs)
// ============================================

export async function getHistory(limit = 50): Promise<any[]> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const result = await client.execute({
      sql: `SELECT * FROM search_runs ORDER BY created_at DESC LIMIT ?`,
      args: [limit],
    });
    return result.rows.map(row => ({
      id: row.id as string,
      actorId: row.actor_id as string,
      actorName: row.actor_name as string,
      inputParams: row.input_params as string,
      status: row.status as string,
      resultsCount: row.result_count as number,
      runId: row.run_id as string | null,
      createdAt: row.created_at as string,
      completedAt: row.completed_at as string | null,
    }));
  } catch (err) {
    console.error('[DB] Error fetching history:', err);
    return [];
  }
}

export async function addToHistory(data: {
  actorId: string;
  actorName?: string;
  inputParams: string;
  status: string;
  runId: string | null;
}) {
  try {
    await ensureDb();
    const client = getTursoClient();
    const id = crypto.randomUUID();
    await client.execute({
      sql: `INSERT INTO search_runs (id, actor_id, actor_name, input_params, status, run_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, data.actorId, data.actorName || data.actorId, data.inputParams, data.status, data.runId],
    });
    return { id, ...data, resultsCount: 0, createdAt: new Date().toISOString(), completedAt: null };
  } catch (err) {
    console.error('[DB] Error adding to history:', err);
    return null;
  }
}

export async function updateHistoryResults(runId: string, count: number): Promise<void> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({
      sql: `UPDATE search_runs SET result_count = ?, status = 'completed', completed_at = datetime('now') WHERE run_id = ?`,
      args: [count, runId],
    });
  } catch (err) {
    console.error('[DB] Error updating history results:', err);
  }
}

export async function deleteHistoryItem(id: string): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({
      sql: 'DELETE FROM saved_results WHERE run_id IN (SELECT run_id FROM search_runs WHERE id = ?)',
      args: [id],
    });
    await client.execute({
      sql: 'DELETE FROM search_runs WHERE id = ?',
      args: [id],
    });
    return true;
  } catch (err) {
    console.error('[DB] Error deleting history item:', err);
    return false;
  }
}

export async function clearHistory(): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute('DELETE FROM saved_results');
    await client.execute('DELETE FROM search_runs');
    return true;
  } catch (err) {
    console.error('[DB] Error clearing history:', err);
    return false;
  }
}

// ============================================
// SAVED RESULTS
// ============================================

export async function saveResults(runId: string, items: any[]): Promise<number> {
  try {
    await ensureDb();
    const client = getTursoClient();

    // Delete old results for this run
    await client.execute({ sql: 'DELETE FROM saved_results WHERE run_id = ?', args: [runId] });

    // Insert new results
    for (const item of items) {
      await client.execute({
        sql: 'INSERT INTO saved_results (run_id, item_json) VALUES (?, ?)',
        args: [runId, JSON.stringify(item)],
      });
    }

    // Update history
    await updateHistoryResults(runId, items.length);

    return items.length;
  } catch (err) {
    console.error('[DB] Error saving results:', err);
    return 0;
  }
}

export async function getSavedResults(runId: string, limit = 200, offset = 0): Promise<any[]> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const result = await client.execute({
      sql: 'SELECT item_json FROM saved_results WHERE run_id = ? LIMIT ? OFFSET ?',
      args: [runId, limit, offset],
    });
    return result.rows.map(row => {
      try { return JSON.parse(row.item_json as string); } catch { return null; }
    }).filter(Boolean);
  } catch (err) {
    console.error('[DB] Error fetching saved results:', err);
    return [];
  }
}

export async function getResultsCount(runId: string): Promise<number> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const result = await client.execute({
      sql: 'SELECT COUNT(*) as cnt FROM saved_results WHERE run_id = ?',
      args: [runId],
    });
    return (result.rows[0].cnt as number) || 0;
  } catch (err) {
    return 0;
  }
}

// ============================================
// CUSTOM ACTORS
// ============================================

export async function getCustomActors(): Promise<any[]> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const result = await client.execute({
      sql: 'SELECT * FROM custom_actors WHERE is_active = 1 ORDER BY created_at DESC',
      args: [],
    });
    return result.rows.map(row => ({
      id: row.id as string,
      actorId: row.actor_id as string,
      name: row.name as string,
      description: row.description as string,
      category: row.category as string,
      icon: row.icon as string,
      color: row.color as string,
      inputSchema: row.input_schema as string,
      outputFields: row.output_fields as string,
      pricingInfo: row.pricing_info as string,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at as string,
    }));
  } catch (err) {
    console.error('[DB] Error fetching custom actors:', err);
    return [];
  }
}

export async function getCustomActorById(actorId: string): Promise<any | null> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const result = await client.execute({
      sql: 'SELECT * FROM custom_actors WHERE actor_id = ? AND is_active = 1',
      args: [actorId],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id as string,
      actorId: row.actor_id as string,
      name: row.name as string,
      description: row.description as string,
      category: row.category as string,
      icon: row.icon as string,
      color: row.color as string,
      inputSchema: row.input_schema as string,
      outputFields: row.output_fields as string,
      pricingInfo: row.pricing_info as string,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at as string,
    };
  } catch (err) {
    console.error('[DB] Error fetching custom actor:', err);
    return null;
  }
}

export async function addCustomActor(data: {
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
  try {
    await ensureDb();
    const client = getTursoClient();

    // Check if already exists
    const existing = await client.execute({
      sql: 'SELECT id FROM custom_actors WHERE actor_id = ?',
      args: [data.actorId],
    });
    if (existing.rows.length > 0) return null;

    const id = crypto.randomUUID();
    await client.execute({
      sql: `INSERT INTO custom_actors (id, actor_id, name, description, category, icon, color, input_schema, output_fields, pricing_info)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        data.actorId,
        data.name,
        data.description || '',
        data.category || 'custom',
        data.icon || 'Globe',
        data.color || '#6366f1',
        typeof data.inputSchema === 'string' ? data.inputSchema : JSON.stringify(data.inputSchema || []),
        typeof data.outputFields === 'string' ? data.outputFields : JSON.stringify(data.outputFields || []),
        data.pricingInfo || '',
      ],
    });

    return { id, ...data };
  } catch (err) {
    console.error('[DB] Error adding custom actor:', err);
    return null;
  }
}

export async function deleteCustomActor(id: string): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({
      sql: 'UPDATE custom_actors SET is_active = 0 WHERE id = ?',
      args: [id],
    });
    return true;
  } catch (err) {
    console.error('[DB] Error deleting custom actor:', err);
    return false;
  }
}

// ============================================
// SAVED QUERY TEMPLATES
// ============================================

export async function getSavedQueries(): Promise<any[]> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const result = await client.execute({
      sql: 'SELECT * FROM saved_queries ORDER BY created_at DESC',
      args: [],
    });
    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      actorId: row.actor_id as string,
      inputParams: row.input_params as string,
      outputFormat: row.output_format as string,
      selectedFields: row.selected_fields as string,
      maxResults: row.max_results as number,
      createdAt: row.created_at as string,
      lastUsedAt: row.last_used_at as string | null,
    }));
  } catch (err) {
    console.error('[DB] Error fetching saved queries:', err);
    return [];
  }
}

export async function saveQuery(data: {
  name: string;
  actorId: string;
  inputParams: Record<string, any>;
  outputFormat: string;
  selectedFields: string[];
  maxResults: number;
}): Promise<any> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const id = crypto.randomUUID();
    await client.execute({
      sql: `INSERT INTO saved_queries (id, name, actor_id, input_params, output_format, selected_fields, max_results)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        data.name,
        data.actorId,
        JSON.stringify(data.inputParams),
        data.outputFormat,
        JSON.stringify(data.selectedFields),
        data.maxResults,
      ],
    });
    return { id, ...data, createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('[DB] Error saving query:', err);
    return null;
  }
}

export async function deleteQuery(id: string): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({ sql: 'DELETE FROM saved_queries WHERE id = ?', args: [id] });
    return true;
  } catch (err) {
    console.error('[DB] Error deleting query:', err);
    return false;
  }
}

export async function touchQueryLastUsed(id: string): Promise<void> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({
      sql: "UPDATE saved_queries SET last_used_at = datetime('now') WHERE id = ?",
      args: [id],
    });
  } catch (err) {
    // silent
  }
}

// ============================================
// DISCOVERED ACTORS CACHE
// ============================================

export async function getCachedDiscoveredActors(searchTerm: string): Promise<any[] | null> {
  try {
    await ensureDb();
    const client = getTursoClient();
    // Cache valid for 24 hours
    const result = await client.execute({
      sql: `SELECT * FROM discovered_actors 
            WHERE search_term = ? AND discovered_at > datetime('now', '-24 hours')
            ORDER BY discovered_at DESC LIMIT 50`,
      args: [searchTerm],
    });
    if (result.rows.length === 0) return null;
    return result.rows.map(row => ({
      id: row.id as string,
      actorId: row.actor_id as string,
      name: row.name as string,
      description: row.description as string,
      searchTerm: row.search_term as string,
      discoveredAt: row.discovered_at as string,
    }));
  } catch (err) {
    return null;
  }
}

export async function cacheDiscoveredActors(searchTerm: string, actors: any[]): Promise<void> {
  try {
    await ensureDb();
    const client = getTursoClient();

    // Delete old cache for this term
    await client.execute({ sql: 'DELETE FROM discovered_actors WHERE search_term = ?', args: [searchTerm] });

    // Insert new actors
    for (const actor of actors.slice(0, 50)) {
      await client.execute({
        sql: `INSERT OR IGNORE INTO discovered_actors (id, actor_id, name, description, search_term)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          actor.actorId || actor.id,
          actor.name,
          actor.description || '',
          searchTerm,
        ],
      });
    }
  } catch (err) {
    console.error('[DB] Error caching discovered actors:', err);
  }
}

// ============================================
// STATISTICS
// ============================================

export async function getStats(): Promise<{
  totalRuns: number;
  completedRuns: number;
  totalResults: number;
  customActors: number;
  savedQueries: number;
  totalStorage: string;
}> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const runs = await client.execute('SELECT COUNT(*) as cnt FROM search_runs');
    const completed = await client.execute("SELECT COUNT(*) as cnt FROM search_runs WHERE status = 'completed'");
    const results = await client.execute('SELECT COUNT(*) as cnt FROM saved_results');
    const actors = await client.execute('SELECT COUNT(*) as cnt FROM custom_actors WHERE is_active = 1');
    const queries = await client.execute('SELECT COUNT(*) as cnt FROM saved_queries');

    // Estimate storage (rough)
    const resultsSize = await client.execute('SELECT SUM(LENGTH(item_json)) as total FROM saved_results');
    const totalBytes = (resultsSize.rows[0].total as number) || 0;
    const storageStr = totalBytes > 1024 * 1024
      ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(totalBytes / 1024).toFixed(1)} KB`;

    return {
      totalRuns: runs.rows[0].cnt as number,
      completedRuns: completed.rows[0].cnt as number,
      totalResults: results.rows[0].cnt as number,
      customActors: actors.rows[0].cnt as number,
      savedQueries: queries.rows[0].cnt as number,
      totalStorage: storageStr,
    };
  } catch (err) {
    return { totalRuns: 0, completedRuns: 0, totalResults: 0, customActors: 0, savedQueries: 0, totalStorage: '0 KB' };
  }
}
