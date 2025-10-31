import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
	interface Window {
		__SUPABASE_URL?: string;
		__SUPABASE_ANON_KEY?: string;
		__ENV?: Record<string, string>;
	}
}

// Cached client
let client: SupabaseClient | null = null;

// Helper to create the client given raw values
const makeClient = (url: string, anonKey: string) => createClient(url, anonKey);

// Try build-time envs first (Vite inlines these at build time)
const buildMeta = import.meta.env as unknown as { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
const buildUrl = buildMeta.VITE_SUPABASE_URL;
const buildAnon = buildMeta.VITE_SUPABASE_ANON_KEY;

if (buildUrl && buildAnon) {
	// If build-time envs exist, create the client immediately and export a getter that resolves instantly
	client = makeClient(buildUrl, buildAnon);
}

/**
 * Get (or initialize) the Supabase client.
 * Behavior:
 * - If Vite build-time envs exist, returns a ready client.
 * - Otherwise, attempts to fetch '/env.json' at runtime (JSON: { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY })
 * - Caches the client after creation.
 */
export async function getSupabase(): Promise<SupabaseClient> {
	if (client) return client;

	// Try runtime globals (in case host injects them on window)
		const runtimeUrl = window.__SUPABASE_URL || window.__ENV?.VITE_SUPABASE_URL;
		const runtimeAnon = window.__SUPABASE_ANON_KEY || window.__ENV?.VITE_SUPABASE_ANON_KEY;
	if (runtimeUrl && runtimeAnon) {
		client = makeClient(runtimeUrl, runtimeAnon);
		return client;
	}

	// Try fetching /env.json
	try {
		const res = await fetch('/env.json', { cache: 'no-store' });
		if (!res.ok) throw new Error('Failed to fetch /env.json');
		const json = await res.json();
		const url = json?.VITE_SUPABASE_URL;
		const anon = json?.VITE_SUPABASE_ANON_KEY;
		if (!url || !anon) throw new Error('env.json missing required keys VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
		client = makeClient(url, anon);
		return client;
	} catch (err) {
		const msg =
			'Supabase credentials not found: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time, or provide /env.json at runtime, or set window.__SUPABASE_URL / window.__SUPABASE_ANON_KEY.';
		console.error(msg, err);
		throw new Error(msg);
	}
}

// Also export a convenience promise-based client for callers that prefer to await a variable
export const supabasePromise: Promise<SupabaseClient> = getSupabase();

// Export a synchronous `supabase` binding so existing imports (e.g. `import { supabase } from './lib/supabase'`)
// continue to work. If the real client is available at module initialization (build-time envs),
// the proxy will forward calls to it. Otherwise the proxy throws a clear error explaining how
// to provide credentials (build-time VITE_* envs or runtime /env.json or window globals).
export const supabase: SupabaseClient = ((): SupabaseClient => {
	if (client) return client;

		const handler: ProxyHandler<object> = {
			get(_, prop) {
				if (client) return Reflect.get(client as unknown as object, prop as PropertyKey);
				throw new Error(
					'Supabase client not initialized. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time, or use runtime /env.json or window.__SUPABASE_URL / window.__SUPABASE_ANON_KEY.'
				);
			},
		};

	// Return a proxy that matches the SupabaseClient surface
	return new Proxy({}, handler) as unknown as SupabaseClient;
})();
