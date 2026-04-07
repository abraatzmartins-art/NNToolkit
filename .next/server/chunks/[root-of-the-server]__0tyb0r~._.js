module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18520,e=>e.a(async(t,r)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),r()}catch(e){r(e)}},!0),97809,e=>e.a(async(t,r)=>{try{var s=e.i(18520),a=t([s]);[s]=a.then?(await a)():a;let o=null;function n(){if(o)return o;let e=process.env.TURSO_DATABASE_URL,t=process.env.TURSO_AUTH_TOKEN;if(!e)throw Error("TURSO_DATABASE_URL não configurada. Adicione a env var no Vercel.");return o=(0,s.createClient)({url:e,authToken:t})}let T=!1;async function i(){if(T)return;let e=n();await e.batch([`CREATE TABLE IF NOT EXISTS search_runs (
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
    )`,"CREATE INDEX IF NOT EXISTS idx_search_runs_created ON search_runs(created_at DESC)","CREATE INDEX IF NOT EXISTS idx_saved_results_run ON saved_results(run_id)","CREATE INDEX IF NOT EXISTS idx_custom_actors_active ON custom_actors(is_active)","CREATE INDEX IF NOT EXISTS idx_saved_queries_actor ON saved_queries(actor_id)","CREATE INDEX IF NOT EXISTS idx_discovered_search ON discovered_actors(search_term)","CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)","CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)","CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)","CREATE INDEX IF NOT EXISTS idx_reg_requests_status ON registration_requests(status)","CREATE INDEX IF NOT EXISTS idx_ai_searches_user ON ai_searches(user_id)"],"write"),T=!0,console.log("[Turso] Database initialized successfully")}e.s(["getTursoClient",0,n,"initDatabase",0,i]),r()}catch(e){r(e)}},!1),90595,e=>e.a(async(t,r)=>{try{var s=e.i(89171),a=e.i(68105),n=t([a]);async function i(e){try{await (0,a.seedAdmin)();let t=(0,a.getTokenFromRequest)(e);if(!t)return s.NextResponse.json({error:"Não autenticado."},{status:401});let r=await (0,a.getSession)(t);if(!r||"admin"!==r.role)return s.NextResponse.json({error:"Acesso negado."},{status:403});let n=await (0,a.getAllUsers)();return s.NextResponse.json({users:n})}catch(e){return console.error("[Auth] Users error:",e),s.NextResponse.json({error:"Erro interno."},{status:500})}}async function o(e){try{let t=(0,a.getTokenFromRequest)(e);if(!t)return s.NextResponse.json({error:"Não autenticado."},{status:401});let r=await (0,a.getSession)(t);if(!r||"admin"!==r.role)return s.NextResponse.json({error:"Acesso negado."},{status:403});let{userId:n,action:i}=await e.json();if(!n||!i)return s.NextResponse.json({error:"userId e action são obrigatórios."},{status:400});if("toggle_active"===i){if(n===r.id)return s.NextResponse.json({error:"Você não pode desativar a si mesmo."},{status:400});return await (0,a.toggleUserActive)(n),s.NextResponse.json({success:!0})}if("delete"===i){if(n===r.id)return s.NextResponse.json({error:"Você não pode deletar a si mesmo."},{status:400});return await (0,a.deleteUser)(n),s.NextResponse.json({success:!0})}return s.NextResponse.json({error:"Ação inválida."},{status:400})}catch(e){return console.error("[Auth] Users PATCH error:",e),s.NextResponse.json({error:"Erro interno."},{status:500})}}[a]=n.then?(await n)():n,e.s(["GET",0,i,"PATCH",0,o]),r()}catch(e){r(e)}},!1),77196,e=>e.a(async(t,r)=>{try{var s=e.i(47909),a=e.i(74017),n=e.i(96250),i=e.i(59756),o=e.i(61916),T=e.i(74677),E=e.i(69741),d=e.i(16795),u=e.i(87718),l=e.i(95169),c=e.i(47587),N=e.i(66012),p=e.i(70101),L=e.i(26937),R=e.i(10372),_=e.i(93695);e.i(52474);var U=e.i(220),A=e.i(90595),O=t([A]);[A]=O.then?(await O)():O;let X=new s.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/auth/users/route",pathname:"/api/auth/users",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/auth/users/route.ts",nextConfigOutput:"",userland:A,...{}}),{workAsyncStorage:x,workUnitAsyncStorage:I,serverHooks:m}=X;async function h(e,t,r){r.requestMeta&&(0,i.setRequestMeta)(e,r.requestMeta),X.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let s="/api/auth/users/route";s=s.replace(/\/index$/,"")||"/";let n=await X.prepare(e,t,{srcPage:s,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:A,params:O,nextConfig:h,parsedUrl:x,isDraftMode:I,prerenderManifest:m,routerServerContext:v,isOnDemandRevalidate:S,revalidateOnlyGenerated:g,resolvedPathname:w,clientReferenceManifest:F,serverActionsManifest:f}=n,C=(0,E.normalizeAppPath)(s),D=!!(m.dynamicRoutes[C]||m.routes[w]),y=async()=>((null==v?void 0:v.render404)?await v.render404(e,t,x,!1):t.end("This page could not be found"),null);if(D&&!I){let e=!!m.routes[w],t=m.dynamicRoutes[C];if(t&&!1===t.fallback&&!e){if(h.adapterPath)return await y();throw new _.NoFallbackError}}let b=null;!D||X.isDev||I||(b=w,b="/index"===b?"/":b);let P=!0===X.isDev||!D,q=D&&!P;f&&F&&(0,T.setManifestsSingleton)({page:s,clientReferenceManifest:F,serverActionsManifest:f});let j=e.method||"GET",k=(0,o.getTracer)(),M=k.getActiveScopeSpan(),Y=!!(null==v?void 0:v.isWrappedByNextServer),K=!!(0,i.getRequestMeta)(e,"minimalMode"),H=(0,i.getRequestMeta)(e,"incrementalCache")||await X.getIncrementalCache(e,h,m,K);null==H||H.resetRequestCache(),globalThis.__incrementalCache=H;let B={params:O,previewProps:m.preview,renderOpts:{experimental:{authInterrupts:!!h.experimental.authInterrupts},cacheComponents:!!h.cacheComponents,supportsDynamicResponse:P,incrementalCache:H,cacheLifeProfiles:h.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,s,a)=>X.onRequestError(e,t,s,a,v)},sharedContext:{buildId:A}},G=new d.NodeNextRequest(e),$=new d.NodeNextResponse(t),V=u.NextRequestAdapter.fromNodeNextRequest(G,(0,u.signalFromNodeResponse)(t));try{let n,i=async e=>X.handle(V,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${j} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${j} ${s}`)}),T=async n=>{var o,T;let E=async({previousCacheEntry:a})=>{try{if(!K&&S&&g&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let T=B.renderOpts.collectedTags;if(!D)return await (0,N.sendResponse)(G,$,s,B.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(s.headers);T&&(t[R.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,a=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:U.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==a?void 0:a.isStale)&&await X.onRequestError(e,t,{routerKind:"App Router",routePath:s,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:S})},!1,v),t}},d=await X.handleResponse({req:e,nextConfig:h,cacheKey:b,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:m,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:g,responseGenerator:E,waitUntil:r.waitUntil,isMinimalMode:K});if(!D)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==U.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(T=d.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",S?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),I&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);return K&&D||u.delete(R.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,L.getCacheControlHeader)(d.cacheControl)),await (0,N.sendResponse)(G,$,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};Y&&M?await T(M):(n=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(l.BaseServerSpan.handleRequest,{spanName:`${j} ${s}`,kind:o.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},T),void 0,!Y))}catch(t){if(t instanceof _.NoFallbackError||await X.onRequestError(e,t,{routerKind:"App Router",routePath:C,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:S})},!1,v),D)throw t;return await (0,N.sendResponse)(G,$,new Response(null,{status:500})),null}}e.s(["handler",0,h,"patchFetch",0,function(){return(0,n.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:I})},"routeModule",0,X,"serverHooks",0,m,"workAsyncStorage",0,x,"workUnitAsyncStorage",0,I]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0tyb0r~._.js.map