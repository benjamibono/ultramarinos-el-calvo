import { createClient } from "@supabase/supabase-js";

export const prerender = false;

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

// Only a signed-in admin may trigger a rebuild. ADMIN_EMAILS is a server-only env var
// (comma separated); without it nobody can deploy, which is the safe default.
export async function POST({ request }) {
  const hook = import.meta.env.VERCEL_DEPLOY_HOOK;
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const admins = (import.meta.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!hook || !url || !anon || admins.length === 0) return json({ error: "Deploy not configured" }, 503);

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Sign in required" }, 401);

  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email || !admins.includes(email)) return json({ error: "Not allowed" }, 403);

  const res = await fetch(hook, { method: "POST" }).catch(() => null);
  if (!res || !res.ok) return json({ error: "Deploy hook failed" }, 502);
  return json({ ok: true }, 200);
}

export function ALL() {
  return json({ error: "Method not allowed" }, 405);
}
