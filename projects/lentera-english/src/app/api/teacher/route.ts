// Teachers (Rilis 10, migration 0015). Every action is re-checked in SQL:
// only a teacher of a license can make classes in it, and only a class's own
// teacher can see its students or give it work.
//   GET → { licenses, classes }
//   POST { action: 'activate', code }                                  → become a teacher with the school's 8-character license code
//   POST { action: 'create-class', licenseId, name, level }
//   POST { action: 'update-class', classId, name?, level?, archived?, newCode? }
//   POST { action: 'class', classId }                                  → roster with progress and assignments
//   POST { action: 'assign', classId, kind, refId, title, note, dueAt }
//   POST { action: 'unassign', assignmentId }
//   POST { action: 'remove-student', classId, studentId }
import { HttpError, json, readJson, requireUser, route } from '@/lib/server/api';
import { classError, cleanCode, isId, isUuid, limitCodeGuesses } from '@/lib/server/classes';
import { notReady } from '@/lib/server/habits';
import { rateLimit } from '@/lib/server/security';
import { CEFR_ORDER } from '@/lib/content/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  return json(await db.rpc('teacher_overview', { p_user: userId }).catch(notReady));
});

interface Body { action?: string; code?: unknown; licenseId?: unknown; classId?: unknown; name?: unknown; level?: unknown; archived?: unknown; newCode?: unknown; kind?: unknown; refId?: unknown; title?: unknown; note?: unknown; dueAt?: unknown; assignmentId?: unknown; studentId?: unknown }
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const level = (v: unknown) => (typeof v === 'string' && (CEFR_ORDER as string[]).includes(v) ? v : null);

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  await rateLimit(db, 'teacher', userId, 300, 3600);
  const b = await readJson<Body>(req, 4000);
  const classId = Number(b.classId);
  switch (b.action) {
    case 'activate': {
      const code = cleanCode(b.code, 8);
      if (code.length !== 8) throw new HttpError(400, 'Kode lisensi terdiri dari 8 huruf dan angka.');
      await rateLimit(db, 'license-code', userId, 10, 3600);
      await limitCodeGuesses(db, req);
      const r = await db.rpc<{ error?: string; school: string; already?: boolean }>('teacher_activate', { p_user: userId, p_code: code }).catch(notReady);
      classError(r);
      return json({ message: r.already ? `Kamu sudah terdaftar sebagai guru di ${r.school}.` : `Akun guru aktif untuk ${r.school}. Buat kelas pertamamu.` });
    }
    case 'create-class': {
      const name = text(b.name, 80);
      if (!name || !isId(b.licenseId)) throw new HttpError(400, 'Isi nama kelas dan pilih lisensi.');
      const r = await db.rpc<{ error?: string; id: number; join_code: string }>('create_class', { p_user: userId, p_license: Number(b.licenseId), p_name: name, p_level: level(b.level) }).catch(notReady);
      classError(r);
      return json({ message: `Kelas ${name} dibuat. Bagikan kode ${r.join_code} ke siswa.`, id: r.id, join_code: r.join_code });
    }
    case 'update-class': {
      if (!isId(classId)) throw new HttpError(400, 'Kelas tidak dikenal.');
      const patch: Record<string, unknown> = {};
      if (typeof b.name === 'string' && b.name.trim()) patch.name = text(b.name, 80);
      if ('level' in b) patch.level = level(b.level);
      if (typeof b.archived === 'boolean') patch.archived = b.archived;
      if (b.newCode === true) patch.new_code = true;
      classError(await db.rpc<{ error?: string }>('update_class', { p_user: userId, p_class: classId, p_patch: patch }).catch(notReady));
      return json({ message: b.newCode ? 'Kode kelas baru dibuat. Kode lama tidak berlaku lagi.' : b.archived === true ? 'Kelas diarsipkan.' : b.archived === false ? 'Kelas dibuka lagi.' : 'Kelas disimpan.' });
    }
    case 'class':
      if (!isId(classId)) throw new HttpError(400, 'Kelas tidak dikenal.');
      return json(await db.rpc('class_detail', { p_user: userId, p_class: classId }).catch(notReady));
    case 'assign': {
      const kind = ['lesson', 'homework', 'exam'].includes(String(b.kind)) ? String(b.kind) : '';
      const refId = text(b.refId, 120);
      const title = text(b.title, 160);
      const due = new Date(String(b.dueAt));
      if (!isId(classId) || !kind || !refId || !title || Number.isNaN(due.getTime())) throw new HttpError(400, 'Pilih materi dan tenggatnya.');
      const r = await db.rpc<{ error?: string; id: number }>('add_assignment', { p_user: userId, p_class: classId, p_kind: kind, p_ref: refId, p_title: title, p_note: text(b.note, 500), p_due: due.toISOString() }).catch(notReady);
      classError(r);
      return json({ message: `Tugas "${title}" diberikan.`, id: r.id });
    }
    case 'unassign':
      if (!isId(b.assignmentId)) throw new HttpError(400, 'Tugas tidak dikenal.');
      await db.rpc('delete_assignment', { p_user: userId, p_id: Number(b.assignmentId) }).catch(notReady);
      return json({ message: 'Tugas dihapus.' });
    case 'remove-student':
      if (!isId(classId) || !isUuid(b.studentId)) throw new HttpError(400, 'Siswa tidak dikenal.');
      classError(await db.rpc<{ error?: string }>('remove_student', { p_user: userId, p_class: classId, p_student: b.studentId }).catch(notReady));
      return json({ message: 'Siswa dikeluarkan dari kelas.' });
    default:
      throw new HttpError(400, 'Aksi tidak dikenal.');
  }
});
