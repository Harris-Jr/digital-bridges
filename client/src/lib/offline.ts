// Offline course packs + progress sync.
//
// A "pack" pre-warms the two runtime caches the service worker already reads
// from (see vite.config.ts): "db-api" for the content API and "db-media" for
// images and audio. Downloading a course fetches everything a learner needs —
// the course detail, each lesson's quiz, and all media — and stores it in
// those caches, so the course and its lessons open with no connection.
//
// Lesson completions made while offline are queued in localStorage and
// replayed when the connection returns; the server upsert is idempotent, so a
// replay is always safe.
import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";

const API_CACHE = "db-api";
const MEDIA_CACHE = "db-media";
const PACKS_KEY = "db_offline_packs_v1";
const QUEUE_KEY = "db_progress_queue_v1";

export type Pack = { slug: string; title: string; lessons: number; savedAt: string };
export type PackMap = Record<string, Pack>;

type LessonLike = { id: string; image_url?: string | null; audio_url?: string | null };
type CourseLike = { slug: string; title: string; image_url?: string | null; lessons: LessonLike[] };

/** True when the browser can store packs (a service worker controls the page). */
export function offlineSupported(): boolean {
  return typeof caches !== "undefined" && "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
}

/* -------------------------------------------------------------- pack store */

export function getPacks(): PackMap {
  try { return JSON.parse(localStorage.getItem(PACKS_KEY) || "{}") as PackMap; } catch { return {}; }
}
function setPacks(p: PackMap) {
  try { localStorage.setItem(PACKS_KEY, JSON.stringify(p)); } catch { /* storage may be unavailable */ }
}
export function isDownloaded(slug: string): boolean {
  return !!getPacks()[slug];
}

/** Absolute URLs this course needs cached, split by which cache they belong in. */
function packUrls(course: CourseLike): { api: string[]; media: string[] } {
  const origin = location.origin;
  const api = [`${origin}/api/courses/${course.slug}`];
  const media: string[] = [];
  if (course.image_url) media.push(course.image_url);
  for (const l of course.lessons) {
    api.push(`${origin}/api/lessons/${l.id}/quiz`);
    if (l.image_url) media.push(l.image_url);
    if (l.audio_url) media.push(l.audio_url);
  }
  return { api, media };
}

/**
 * Download a course for offline use. Reports progress (0..1) via onProgress.
 * Resolves true on success. Cross-origin media is fetched no-cors and stored
 * as an opaque response, which the CacheFirst media handler still serves.
 */
export async function downloadPack(course: CourseLike, onProgress?: (done: number, total: number) => void): Promise<boolean> {
  if (!offlineSupported()) return false;
  const { api, media } = packUrls(course);
  const total = api.length + media.length;
  let done = 0;
  const tick = () => { done += 1; onProgress?.(done, total); };

  const apiCache = await caches.open(API_CACHE);
  const mediaCache = await caches.open(MEDIA_CACHE);

  await Promise.all([
    ...api.map(async (url) => {
      try {
        const res = await fetch(url, { credentials: "same-origin" });
        if (res.ok) await apiCache.put(url, res.clone());
      } catch { /* a missing entry just means that part is not available offline */ }
      finally { tick(); }
    }),
    ...media.map(async (url) => {
      try {
        const sameOrigin = url.startsWith("/") || url.startsWith(location.origin);
        const res = await fetch(url, sameOrigin ? {} : { mode: "no-cors" });
        if (res.ok || res.type === "opaque") await mediaCache.put(url, res.clone());
      } catch { /* media may be unreachable; skip it */ }
      finally { tick(); }
    }),
  ]);

  const packs = getPacks();
  packs[course.slug] = { slug: course.slug, title: course.title, lessons: course.lessons.length, savedAt: new Date().toISOString() };
  setPacks(packs);
  return true;
}

/** Remove a course pack: forget it and best-effort delete its cached entries. */
export async function removePack(course: CourseLike): Promise<void> {
  const packs = getPacks();
  delete packs[course.slug];
  setPacks(packs);
  if (typeof caches === "undefined") return;
  const { api, media } = packUrls(course);
  try {
    const apiCache = await caches.open(API_CACHE);
    const mediaCache = await caches.open(MEDIA_CACHE);
    await Promise.all([...api.map((u) => apiCache.delete(u)), ...media.map((u) => mediaCache.delete(u))]);
  } catch { /* nothing to clean up */ }
}

/* ------------------------------------------------------ progress sync queue */

function readQueue(): string[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") as string[]; } catch { return []; }
}
function writeQueue(ids: string[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(ids)); } catch { /* storage may be unavailable */ }
}

/** Remember a completion that could not reach the server, to send later. */
export function queueProgress(lessonId: string) {
  const ids = readQueue();
  if (!ids.includes(lessonId)) { ids.push(lessonId); writeQueue(ids); }
}

export function queuedCount(): number {
  return readQueue().length;
}

/**
 * Replay queued completions. Returns how many synced. A completion that still
 * fails (e.g. still offline) stays queued for the next attempt.
 */
export async function flushProgress(): Promise<number> {
  const ids = readQueue();
  if (ids.length === 0) return 0;
  const remaining: string[] = [];
  let synced = 0;
  for (const lessonId of ids) {
    try { await apiPost("/me/progress", { lesson_id: lessonId }); synced += 1; }
    catch { remaining.push(lessonId); }
  }
  writeQueue(remaining);
  return synced;
}

/* --------------------------------------------------------------- online hook */

/** Reactive online/offline state. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);
  return online;
}
