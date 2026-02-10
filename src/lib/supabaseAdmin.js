import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const DEFAULT_MAX_VIDEOS = 10;

// ─── Settings ─────────────────────────────────────────────

export async function getMaxVideos() {
  if (!supabase) return DEFAULT_MAX_VIDEOS;
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "max_videos")
      .single();
    if (error || !data) return DEFAULT_MAX_VIDEOS;
    return parseInt(data.value, 10) || DEFAULT_MAX_VIDEOS;
  } catch {
    return DEFAULT_MAX_VIDEOS;
  }
}

export async function setMaxVideos(n) {
  if (!supabase) throw new Error("Supabase no configurado");
  const value = String(Math.max(1, Math.min(50, n)));
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "max_videos", value }, { onConflict: "key" });
  if (error) throw error;
}

// ─── Auth ────────────────────────────────────────────────

export async function adminSignIn(email, password) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function adminSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getAdminSession() {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export function onAuthChange(callback) {
  if (!supabase) return { unsubscribe: () => {} };
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
}

// ─── Video Metadata ──────────────────────────────────────

export async function getVideoMetadata() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── Upload Video ────────────────────────────────────────

export async function uploadVideo(file, title) {
  if (!supabase) throw new Error("Supabase no configurado");

  const timestamp = Date.now();
  const ext = file.name.split(".").pop().toLowerCase();
  const filename = `video_${timestamp}.${ext}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(filename, file, { cacheControl: "3600", upsert: false });
  if (uploadError) throw uploadError;

  // Insert metadata
  const { error: insertError } = await supabase
    .from("videos")
    .insert({ filename, title: title || "" });
  if (insertError) {
    // Rollback: remove uploaded file
    await supabase.storage.from("videos").remove([filename]);
    throw insertError;
  }

  // Log event
  await logVideoEvent("upload", filename, title);

  // Auto-delete oldest if over limit
  await enforceVideoLimit();

  return { filename, title };
}

// ─── Delete Video ────────────────────────────────────────

export async function deleteVideo(id, filename) {
  if (!supabase) throw new Error("Supabase no configurado");

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("videos")
    .remove([filename]);
  if (storageError) throw storageError;

  // Delete metadata
  const { error: dbError } = await supabase
    .from("videos")
    .delete()
    .eq("id", id);
  if (dbError) throw dbError;

  await logVideoEvent("delete", filename);
}

// ─── Enforce video limit ─────────────────────────────────

async function enforceVideoLimit() {
  const maxVideos = await getMaxVideos();
  const videos = await getVideoMetadata();
  if (videos.length <= maxVideos) return [];

  // Videos are already sorted newest-first; take excess from the end
  const toRemove = videos.slice(maxVideos);
  const removed = [];

  for (const video of toRemove) {
    await supabase.storage.from("videos").remove([video.filename]);
    await supabase.from("videos").delete().eq("id", video.id);
    await logVideoEvent("auto_delete", video.filename, video.title);
    removed.push(video);
  }

  return removed;
}

// ─── Event Log ───────────────────────────────────────────

export async function logVideoEvent(eventType, filename, title = "") {
  if (!supabase) return;
  await supabase
    .from("video_events")
    .insert({ event_type: eventType, filename, title });
}

export async function getVideoEvents() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("video_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

// ─── Public: Latest videos with URLs (for InstagramStories) ──

export async function getLatestVideosWithUrls() {
  if (!supabase) return [];

  const maxVideos = await getMaxVideos();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(maxVideos);

  if (error || !data || data.length === 0) return [];

  return data.map((video) => {
    const { data: urlData } = supabase.storage
      .from("videos")
      .getPublicUrl(video.filename);
    return {
      name: video.filename,
      url: urlData.publicUrl,
      title: video.title,
    };
  });
}

export function getSupabaseClient() {
  return supabase;
}
