module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18520,e=>e.a(async(t,r)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),r()}catch(e){r(e)}},!0),97809,e=>e.a(async(t,r)=>{try{var a=e.i(18520),s=t([a]);[a]=s.then?(await s)():s;let T=null;function n(){if(T)return T;let e=process.env.TURSO_DATABASE_URL,t=process.env.TURSO_AUTH_TOKEN;if(!e)throw Error("TURSO_DATABASE_URL não configurada. Adicione a env var no Vercel.");return T=(0,a.createClient)({url:e,authToken:t})}let o=!1;async function i(){if(o)return;let e=n();await e.batch([`CREATE TABLE IF NOT EXISTS search_runs (
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
    )`,"CREATE INDEX IF NOT EXISTS idx_search_runs_created ON search_runs(created_at DESC)","CREATE INDEX IF NOT EXISTS idx_saved_results_run ON saved_results(run_id)","CREATE INDEX IF NOT EXISTS idx_custom_actors_active ON custom_actors(is_active)","CREATE INDEX IF NOT EXISTS idx_saved_queries_actor ON saved_queries(actor_id)","CREATE INDEX IF NOT EXISTS idx_discovered_search ON discovered_actors(search_term)","CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)","CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)","CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)","CREATE INDEX IF NOT EXISTS idx_reg_requests_status ON registration_requests(status)","CREATE INDEX IF NOT EXISTS idx_ai_searches_user ON ai_searches(user_id)"],"write"),o=!0,console.log("[Turso] Database initialized successfully")}e.s(["getTursoClient",0,n,"initDatabase",0,i]),r()}catch(e){r(e)}},!1),79499,e=>e.a(async(t,r)=>{try{var a=e.i(89171),s=e.i(68105),n=t([s]);async function i(){try{return await (0,s.seedAdmin)(),a.NextResponse.json({success:!0,message:"Admin seed executado."})}catch(e){return a.NextResponse.json({error:e.message},{status:500})}}[s]=n.then?(await n)():n,e.s(["POST",0,i]),r()}catch(e){r(e)}},!1),12168,e=>e.a(async(t,r)=>{try{var a=e.i(47909),s=e.i(74017),n=e.i(96250),i=e.i(59756),T=e.i(61916),o=e.i(74677),E=e.i(69741),d=e.i(16795),u=e.i(87718),l=e.i(95169),c=e.i(47587),N=e.i(66012),p=e.i(70101),L=e.i(26937),_=e.i(10372),R=e.i(93695);e.i(52474);var U=e.i(220),A=e.i(79499),O=t([A]);[A]=O.then?(await O)():O;let X=new a.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/auth/seed/route",pathname:"/api/auth/seed",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/auth/seed/route.ts",nextConfigOutput:"",userland:A,...{}}),{workAsyncStorage:I,workUnitAsyncStorage:m,serverHooks:x}=X;async function h(e,t,r){r.requestMeta&&(0,i.setRequestMeta)(e,r.requestMeta),X.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/auth/seed/route";a=a.replace(/\/index$/,"")||"/";let n=await X.prepare(e,t,{srcPage:a,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:A,params:O,nextConfig:h,parsedUrl:I,isDraftMode:m,prerenderManifest:x,routerServerContext:v,isOnDemandRevalidate:S,revalidateOnlyGenerated:F,resolvedPathname:w,clientReferenceManifest:C,serverActionsManifest:g}=n,D=(0,E.normalizeAppPath)(a),f=!!(x.dynamicRoutes[D]||x.routes[w]),y=async()=>((null==v?void 0:v.render404)?await v.render404(e,t,I,!1):t.end("This page could not be found"),null);if(f&&!m){let e=!!x.routes[w],t=x.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(h.adapterPath)return await y();throw new R.NoFallbackError}}let b=null;!f||X.isDev||m||(b=w,b="/index"===b?"/":b);let P=!0===X.isDev||!f,q=f&&!P;g&&C&&(0,o.setManifestsSingleton)({page:a,clientReferenceManifest:C,serverActionsManifest:g});let k=e.method||"GET",M=(0,T.getTracer)(),Y=M.getActiveScopeSpan(),K=!!(null==v?void 0:v.isWrappedByNextServer),j=!!(0,i.getRequestMeta)(e,"minimalMode"),B=(0,i.getRequestMeta)(e,"incrementalCache")||await X.getIncrementalCache(e,h,x,j);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let H={params:O,previewProps:x.preview,renderOpts:{experimental:{authInterrupts:!!h.experimental.authInterrupts},cacheComponents:!!h.cacheComponents,supportsDynamicResponse:P,incrementalCache:B,cacheLifeProfiles:h.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,s)=>X.onRequestError(e,t,a,s,v)},sharedContext:{buildId:A}},G=new d.NodeNextRequest(e),$=new d.NodeNextResponse(t),Q=u.NextRequestAdapter.fromNodeNextRequest(G,(0,u.signalFromNodeResponse)(t));try{let n,i=async e=>X.handle(Q,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=r.get("next.route");if(s){let t=`${k} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",s),n.updateName(t))}else e.updateName(`${k} ${a}`)}),o=async n=>{var T,o;let E=async({previousCacheEntry:s})=>{try{if(!j&&S&&F&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await i(n);e.fetchMetrics=H.renderOpts.fetchMetrics;let T=H.renderOpts.pendingWaitUntil;T&&r.waitUntil&&(r.waitUntil(T),T=void 0);let o=H.renderOpts.collectedTags;if(!f)return await (0,N.sendResponse)(G,$,a,H.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(a.headers);o&&(t[_.NEXT_CACHE_TAGS_HEADER]=o),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=_.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,s=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=_.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:U.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await X.onRequestError(e,t,{routerKind:"App Router",routePath:a,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:S})},!1,v),t}},d=await X.handleResponse({req:e,nextConfig:h,cacheKey:b,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:x,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:F,responseGenerator:E,waitUntil:r.waitUntil,isMinimalMode:j});if(!f)return null;if((null==d||null==(T=d.value)?void 0:T.kind)!==U.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});j||t.setHeader("x-nextjs-cache",S?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),m&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);return j&&f||u.delete(_.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,L.getCacheControlHeader)(d.cacheControl)),await (0,N.sendResponse)(G,$,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};K&&Y?await o(Y):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(l.BaseServerSpan.handleRequest,{spanName:`${k} ${a}`,kind:T.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!K))}catch(t){if(t instanceof R.NoFallbackError||await X.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:S})},!1,v),f)throw t;return await (0,N.sendResponse)(G,$,new Response(null,{status:500})),null}}e.s(["handler",0,h,"patchFetch",0,function(){return(0,n.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:m})},"routeModule",0,X,"serverHooks",0,x,"workAsyncStorage",0,I,"workUnitAsyncStorage",0,m]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__00bg-51._.js.map