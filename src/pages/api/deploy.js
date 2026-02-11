export const prerender = false;

export async function POST() {
  const hook = import.meta.env.VERCEL_DEPLOY_HOOK;

  if (!hook) {
    return new Response(JSON.stringify({ error: "Deploy hook not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await fetch(hook, { method: "POST" });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Deploy failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
