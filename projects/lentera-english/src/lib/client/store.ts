'use client';
// Offline-first learner store. The state lives on the device; when the user
// is signed in, an outbox of events and a snapshot are synced to the server.
import { useSyncExternalStore } from 'react';
import { createState, finalize } from '@/lib/engine/state';
import { FREE, type Entitlement, type LearnerState } from '@/lib/engine/types';
import { api } from './api';
import { currentSession } from './session';

/** Default profile name of a fresh state (see createState). */
const GUEST_NAME = 'Pelajar';
const stateKey = (uid: string) => `lentera.state.${uid}`;
const entKey = (uid: string) => `lentera.ent.${uid}`;

let state: LearnerState | null = null;
let ent: Entitlement = FREE;
let syncState: 'idle' | 'syncing' | 'offline' | 'error' = 'idle';
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));
const entListeners = new Set<(premium: boolean) => void>();
export const onPremiumChange = (l: (premium: boolean) => void) => (entListeners.add(l), () => void entListeners.delete(l));

function read(uid: string): LearnerState | null {
  try {
    const raw = localStorage.getItem(stateKey(uid));
    return raw ? hydrate(JSON.parse(raw), uid) : null;
  } catch {
    return null;
  }
}
/** Fills in fields added by newer app versions. */
function hydrate(raw: Partial<LearnerState>, uid: string): LearnerState {
  const base = createState(uid, raw.createdAt ?? Date.now());
  return { ...base, ...raw, userId: uid, profile: { ...base.profile, ...raw.profile }, streak: { ...base.streak, ...raw.streak }, hearts: { ...base.hearts, ...raw.hearts }, outbox: raw.outbox ?? [] };
}
function persist() {
  if (!state) return;
  try {
    localStorage.setItem(stateKey(state.userId), JSON.stringify(state));
  } catch {
    // Storage full: drop the oldest logs and retry once.
    state.attempts = state.attempts.slice(-100);
    state.xpLog = state.xpLog.slice(-50);
    try {
      localStorage.setItem(stateKey(state.userId), JSON.stringify(state));
    } catch {
      /* give up silently; state stays in memory */
    }
  }
}
const hasProgress = (s: LearnerState | null) => !!s && (s.xp > 0 || s.profile.placementDone || Object.keys(s.lessons).length > 0);

function setEntitlement(raw: { premium?: boolean; plan?: string; expires_at?: string | null } | undefined, uid: string) {
  const before = ent.premium;
  ent = raw?.premium && raw.expires_at ? { premium: true, plan: raw.plan, expiresAt: new Date(raw.expires_at).getTime() } : FREE;
  localStorage.setItem(entKey(uid), JSON.stringify(ent));
  if (before !== ent.premium) entListeners.forEach((l) => l(ent.premium));
}

/** Loads the right state for the signed-in user (or the guest). */
export async function loadLearner(): Promise<void> {
  const session = currentSession();
  const now = Date.now();
  if (!session) {
    state = read('guest') ?? createState('guest', now);
    ent = FREE;
    persist();
    emit();
    return;
  }
  const uid = session.userId;
  let local = read(uid);
  try {
    ent = JSON.parse(localStorage.getItem(entKey(uid)) ?? 'null') ?? FREE;
  } catch {
    ent = FREE;
  }
  const guest = read('guest');
  let accountName: string | undefined;
  try {
    const { snapshot } = await api<{ snapshot: { state: Partial<LearnerState>; client_updated_at: number } | null }>('/api/sync');
    if (snapshot && (!local || snapshot.client_updated_at > local.updatedAt)) local = hydrate({ ...snapshot.state, outbox: [] }, uid);
    const me = await api<{ user: { profile?: { display_name?: string }; entitlement: { premium: boolean; plan: string; expires_at: string | null } } | null }>('/api/me');
    setEntitlement(me.user?.entitlement, uid);
    accountName = me.user?.profile?.display_name || undefined;
  } catch {
    syncState = 'offline';
  }
  if (!local && hasProgress(guest)) {
    // First sign-in on this device: keep what the learner did as a guest,
    // including the unsent events, so the XP earned before signing up reaches
    // the server ledger (leaderboard) and the attempt history. Events are
    // idempotent and the server still applies its XP caps. A guest who never
    // chose a name takes the one given at sign-up.
    const name = guest!.profile.name !== GUEST_NAME ? guest!.profile.name : accountName ?? guest!.profile.name;
    local = { ...guest!, userId: uid, profile: { ...guest!.profile, name } };
    localStorage.removeItem(stateKey('guest'));
  }
  state = local ?? createState(uid, now, accountName ?? session.email.split('@')[0]);
  persist();
  emit();
  scheduleSync(500);
}

export function scheduleSync(delay = 4000) {
  if (!currentSession()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void syncNow(), delay);
}

export async function syncNow(): Promise<void> {
  const session = currentSession();
  if (!session || !state || state.userId !== session.userId || syncState === 'syncing') return;
  syncState = 'syncing';
  emit();
  try {
    const batch = state.outbox.slice(0, 400);
    const snapshot = { ...state, outbox: [] };
    const res = await api<{ entitlement: { premium: boolean; plan: string; expires_at: string | null } }>('/api/sync', { body: { events: batch, snapshot, updatedAt: state.updatedAt } });
    const sent = new Set(batch.map((e) => e.id));
    state = { ...state, outbox: state.outbox.filter((e) => !sent.has(e.id)) };
    persist();
    setEntitlement(res.entitlement, session.userId);
    syncState = 'idle';
    if (state.outbox.length) scheduleSync(200);
  } catch (e) {
    syncState = (e as { status?: number }).status === 0 ? 'offline' : 'error';
  }
  emit();
}

/** Applies a state transition. The callback mutates a private copy. */
export function act(fn: (draft: LearnerState, now: number) => void): void {
  if (!state) return;
  const draft = structuredClone(state);
  const now = Date.now();
  fn(draft, now);
  finalize(draft, now);
  state = draft;
  persist();
  emit();
  scheduleSync();
}

export function resetLearner() {
  if (!state) return;
  state = createState(state.userId, Date.now(), state.profile.name);
  persist();
  emit();
}

const serverState = createState('guest', 0);
export const useLearner = (): LearnerState => useSyncExternalStore(subscribe, () => state ?? serverState, () => serverState);
export const useEntitlement = (): Entitlement => useSyncExternalStore(subscribe, () => ent, () => FREE);
export const useSyncStatus = () => useSyncExternalStore(subscribe, () => syncState, () => 'idle' as const);
export const getLearner = () => state;
export const getEntitlement = () => ent;
