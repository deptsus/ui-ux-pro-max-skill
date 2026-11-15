// Friends and friend challenges for the signed-in learner (Rilis 8, migration 0013).
//   GET → { code, week_start, friends[], challenges[], record }
//   POST { action: 'add', code }                    → add a friend by invite code
//   POST { action: 'remove', code }                 → remove a friend
//   POST { action: 'challenge', code, days: 3|7 }   → challenge a friend (they get a notification)
//   POST { action: 'respond', id, accept }          → accept or decline a challenge
//   POST { action: 'cancel', id }                   → withdraw a challenge not answered yet
// Every POST answers { message, social } with the refreshed GET data.
import { HttpError, json, readJson, requireUser, route } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/security';
import { normalizeCode, notReady, socialError } from '@/lib/server/habits';
import { notifyLearner } from '@/lib/server/push';
import type { ServerDb } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

const social = (db: ServerDb, userId: string) => db.rpc('get_social', { p_user: userId }).catch(notReady);

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  return json(await social(db, userId));
});

interface Body { action?: string; code?: unknown; days?: unknown; id?: unknown; accept?: unknown }

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  await rateLimit(db, 'friends', userId, 60, 3600);
  const origin = new URL(req.url).origin;
  const b = await readJson<Body>(req, 2000);
  const code = normalizeCode(b.code);
  const id = Number(b.id);
  let message: string;
  switch (b.action) {
    case 'add': {
      if (!code) throw new HttpError(400, 'Masukkan kode teman.');
      const r = await db.rpc<{ error?: string; added?: boolean; already?: boolean; name?: string }>('add_friend', { p_user: userId, p_code: code }).catch(notReady);
      socialError(r);
      message = r.already ? `${r.name} sudah ada di daftar temanmu.` : `${r.name} sekarang temanmu.`;
      break;
    }
    case 'remove': {
      await db.rpc('remove_friend', { p_user: userId, p_code: code }).catch(notReady);
      message = 'Teman dihapus.';
      break;
    }
    case 'challenge': {
      const days = Number(b.days);
      const r = await db.rpc<{ error?: string; id: number; days: number; opponent_id: string; name: string; from_name: string }>('create_challenge', { p_user: userId, p_code: code, p_days: days }).catch(notReady);
      socialError(r);
      await notifyLearner(db, r.opponent_id, {
        title: `${r.from_name} menantangmu!`,
        body: `Siapa yang mengumpulkan XP terbanyak dalam ${r.days} hari? Buka Lentera untuk menerima tantangannya.`,
        url: '/app/leaderboard?tab=teman',
        tag: `challenge-${r.id}`,
      }, { origin, timeoutMs: 4000 });
      message = `Tantangan dikirim ke ${r.name}. Tantangan dimulai begitu ${r.name} menerimanya.`;
      break;
    }
    case 'respond': {
      if (!Number.isSafeInteger(id)) throw new HttpError(400, 'Tantangan tidak dikenal.');
      const accept = b.accept === true;
      const r = await db.rpc<{ error?: string; status: string; challenger_id: string; days: number; name: string }>('respond_challenge', { p_user: userId, p_id: id, p_accept: accept }).catch(notReady);
      socialError(r);
      if (accept) {
        await notifyLearner(db, r.challenger_id, {
          title: `${r.name} menerima tantanganmu`,
          body: `Tantangan XP ${r.days} hari dimulai sekarang. Semangat!`,
          url: '/app/leaderboard?tab=teman',
          tag: `challenge-${id}`,
        }, { origin, timeoutMs: 4000 });
      }
      message = accept ? `Tantangan dimulai! Kumpulkan XP sebanyak-banyaknya dalam ${r.days} hari.` : 'Tantangan ditolak.';
      break;
    }
    case 'cancel': {
      if (!Number.isSafeInteger(id)) throw new HttpError(400, 'Tantangan tidak dikenal.');
      await db.rpc('cancel_challenge', { p_user: userId, p_id: id }).catch(notReady);
      message = 'Tantangan dibatalkan.';
      break;
    }
    default:
      throw new HttpError(400, 'Aksi tidak dikenal.');
  }
  return json({ message, social: await social(db, userId) });
});
