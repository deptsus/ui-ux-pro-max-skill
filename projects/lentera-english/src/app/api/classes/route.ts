// The signed-in student's classes (Rilis 10, migration 0015).
//   GET → classes with assignments and the student's own results
//   POST { action: 'join', code }      → join with the teacher's 6-character class code
//   POST { action: 'leave', classId }  → leave a class
import { HttpError, json, readJson, requireUser, route } from '@/lib/server/api';
import { classError, cleanCode, isId, limitCodeGuesses } from '@/lib/server/classes';
import { notReady } from '@/lib/server/habits';
import { rateLimit } from '@/lib/server/security';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  return json({ classes: await db.rpc('my_classes', { p_user: userId }).catch(notReady) });
});

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  await rateLimit(db, 'classes', userId, 30, 3600);
  const b = await readJson<{ action?: string; code?: unknown; classId?: unknown }>(req, 1000);
  if (b.action === 'join') {
    const code = cleanCode(b.code, 6);
    if (code.length !== 6) throw new HttpError(400, 'Kode kelas terdiri dari 6 huruf dan angka.');
    await limitCodeGuesses(db, req);
    const r = await db.rpc<{ error?: string; name: string; school: string; teacher?: string; already?: boolean }>('join_class', { p_user: userId, p_code: code }).catch(notReady);
    classError(r);
    return json({ message: r.already ? `Kamu sudah ada di kelas ${r.name}.` : `Kamu bergabung ke kelas ${r.name} (${r.school}).`, classes: await db.rpc('my_classes', { p_user: userId }) });
  }
  if (b.action === 'leave') {
    if (!isId(b.classId)) throw new HttpError(400, 'Kelas tidak dikenal.');
    await db.rpc('leave_class', { p_user: userId, p_class: Number(b.classId) }).catch(notReady);
    return json({ message: 'Kamu keluar dari kelas.', classes: await db.rpc('my_classes', { p_user: userId }) });
  }
  throw new HttpError(400, 'Aksi tidak dikenal.');
});
