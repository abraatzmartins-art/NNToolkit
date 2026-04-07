// =============================================
// Turso (libSQL) Database Client
// =============================================
import { createClient, type Client } from '@libsql/client';

let _client: Client | null = null;

export function getTursoClient(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL não configurada. Adicione a env var no Vercel.');
  }

  _client = createClient({
    url,
    authToken: token,
  });

  return _client;
}

// Initialize tables on first use
let _initialized = false;

export async function initDatabase(): Promise<void> {
  if (_initialized) return;

  const client = getTursoClient();

  await client.batch([
    // Search runs - execution history
    `CREATE TABLE IF NOT EXISTS search_runs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL DEFAULT '',
      input_params TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      result_count INTEGER NOT NULL DEFAULT 0,
      run_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    )`,

    // Saved results - cached Apify results
    `CREATE TABLE IF NOT EXISTS saved_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL,
      item_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      fields_hash TEXT,
      FOREIGN KEY (run_id) REFERENCES search_runs(run_id)
    )`,

    // Custom actors installed from marketplace
    `CREATE TABLE IF NOT EXISTS custom_actors (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'custom',
      icon TEXT NOT NULL DEFAULT 'Globe',
      color TEXT NOT NULL DEFAULT '#6366f1',
      input_schema TEXT NOT NULL DEFAULT '[]',
      output_fields TEXT NOT NULL DEFAULT '[]',
      pricing_info TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    // User settings (API key, preferences)
    `CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    // Saved query templates
    `CREATE TABLE IF NOT EXISTS saved_queries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      input_params TEXT NOT NULL DEFAULT '{}',
      output_format TEXT NOT NULL DEFAULT 'json',
      selected_fields TEXT NOT NULL DEFAULT '[]',
      max_results INTEGER NOT NULL DEFAULT 20,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT
    )`,

    // Discovered actors cache from Apify Store
    `CREATE TABLE IF NOT EXISTS discovered_actors (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      search_term TEXT NOT NULL DEFAULT '',
      discovered_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(actor_id, search_term)
    )`,

    // Users table - authentication
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    // Registration requests - pending approval
    `CREATE TABLE IF NOT EXISTS registration_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT,
      reviewed_by TEXT,
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    )`,

    // Sessions table
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // AI search history
    `CREATE TABLE IF NOT EXISTS ai_searches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      query TEXT NOT NULL,
      actor_id TEXT,
      input_params TEXT NOT NULL DEFAULT '{}',
      executed INTEGER NOT NULL DEFAULT 0,
      run_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Indexes for performance
    `CREATE INDEX IF NOT EXISTS idx_search_runs_created ON search_runs(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_saved_results_run ON saved_results(run_id)`,
    `CREATE INDEX IF NOT EXISTS idx_custom_actors_active ON custom_actors(is_active)`,
    `CREATE INDEX IF NOT EXISTS idx_saved_queries_actor ON saved_queries(actor_id)`,
    `CREATE INDEX IF NOT EXISTS idx_discovered_search ON discovered_actors(search_term)`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`,
    `CREATE INDEX IF NOT EXISTS idx_reg_requests_status ON registration_requests(status)`,
    `CREATE INDEX IF NOT EXISTS idx_ai_searches_user ON ai_searches(user_id)`,
  ], 'write');

  _initialized = true;
  console.log('[Turso] Database initialized successfully');
}
