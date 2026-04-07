module.exports=[93695,(e,T,E)=>{T.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,T,E)=>{T.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,T,E)=>{T.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,T,E)=>{T.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,T,E)=>{T.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,T,E)=>{T.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18520,e=>e.a(async(T,E)=>{try{let T=await e.y("@libsql/client-6da938047d5fc1cd");e.n(T),E()}catch(e){E(e)}},!0),97809,e=>e.a(async(T,E)=>{try{var r=e.i(18520),s=T([r]);[r]=s.then?(await s)():s;let N=null;function t(){if(N)return N;let e=process.env.TURSO_DATABASE_URL,T=process.env.TURSO_AUTH_TOKEN;if(!e)throw Error("TURSO_DATABASE_URL não configurada. Adicione a env var no Vercel.");return N=(0,r.createClient)({url:e,authToken:T})}let i=!1;async function a(){if(i)return;let e=t();await e.batch([`CREATE TABLE IF NOT EXISTS search_runs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL DEFAULT '',
      input_params TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      result_count INTEGER NOT NULL DEFAULT 0,
      run_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    )`,`CREATE TABLE IF NOT EXISTS saved_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL,
      item_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      fields_hash TEXT,
      FOREIGN KEY (run_id) REFERENCES search_runs(run_id)
    )`,`CREATE TABLE IF NOT EXISTS custom_actors (
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
    )`,`CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,`CREATE TABLE IF NOT EXISTS saved_queries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      input_params TEXT NOT NULL DEFAULT '{}',
      output_format TEXT NOT NULL DEFAULT 'json',
      selected_fields TEXT NOT NULL DEFAULT '[]',
      max_results INTEGER NOT NULL DEFAULT 20,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT
    )`,`CREATE TABLE IF NOT EXISTS discovered_actors (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      search_term TEXT NOT NULL DEFAULT '',
      discovered_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(actor_id, search_term)
    )`,`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,`CREATE TABLE IF NOT EXISTS registration_requests (
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
    )`,`CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,`CREATE TABLE IF NOT EXISTS ai_searches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      query TEXT NOT NULL,
      actor_id TEXT,
      input_params TEXT NOT NULL DEFAULT '{}',
      executed INTEGER NOT NULL DEFAULT 0,
      run_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,"CREATE INDEX IF NOT EXISTS idx_search_runs_created ON search_runs(created_at DESC)","CREATE INDEX IF NOT EXISTS idx_saved_results_run ON saved_results(run_id)","CREATE INDEX IF NOT EXISTS idx_custom_actors_active ON custom_actors(is_active)","CREATE INDEX IF NOT EXISTS idx_saved_queries_actor ON saved_queries(actor_id)","CREATE INDEX IF NOT EXISTS idx_discovered_search ON discovered_actors(search_term)","CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)","CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)","CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)","CREATE INDEX IF NOT EXISTS idx_reg_requests_status ON registration_requests(status)","CREATE INDEX IF NOT EXISTS idx_ai_searches_user ON ai_searches(user_id)"],"write"),i=!0,console.log("[Turso] Database initialized successfully")}e.s(["getTursoClient",0,t,"initDatabase",0,a]),E()}catch(e){E(e)}},!1),85589,e=>{e.v(T=>Promise.all(["server/chunks/[root-of-the-server]__035b1.6._.js"].map(T=>e.l(T))).then(()=>T(41095)))},35914,e=>{e.v(T=>Promise.all(["server/chunks/lib_db_ts_0~m90w7._.js"].map(T=>e.l(T))).then(()=>T(62294)))},20939,e=>{e.v(e=>Promise.resolve().then(()=>e(97809)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0dk_lkc._.js.map