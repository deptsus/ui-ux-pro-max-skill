// Rilis 10 "Kelas": school licenses issued by the owner, teachers, classes
// with join codes, assignments and results, Premium for licensed classes, and
// the parent view (migration 0015).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { CLASS_ERRORS, classError, cleanCode } from '@/lib/server/classes';
import { assignmentHref, rosterCsv, type ClassDetail } from '@/lib/client/classes';
import { newUser } from './helpers';

const ROOT = path.resolve(__dirname, '..');
let db: RawDb;
let admin: string;
let guru: string;
let guru2: string;
let siti: string;
let budi: string;
let ibu: string;

/** A WIB calendar date `days` from today, as the license columns store it. */
const day = (days: number) => new Date(Date.now() + 7 * 3600_000 + days * 86_400_000).toISOString().slice(0, 10);
type Lic = { id: number; code: string; school: string; ends_on: string; revoked: boolean };
const license = (over: Partial<{ school: string; teachers: number; classes: number; seats: number; starts: string; ends: string }> = {}) =>
  db.rpc<Lic>('admin_create_license', {
    p_actor: admin, p_school: over.school ?? 'SMP Pelita', p_contact: 'Bu Rina', p_max_teachers: over.teachers ?? 2, p_max_classes: over.classes ?? 2,
    p_seats: over.seats ?? 2, p_starts: over.starts ?? day(-1), p_ends: over.ends ?? day(90), p_note: 'Lunas Rp1.000.000',
  });
const ent = (u: string) => db.rpc<{ premium: boolean; plan: string; expires_at: string | null }>('get_entitlement', { p_user: u });
const lesson = (u: string, ref: string, at: string, id = Math.random().toString(36).slice(2)) =>
  db.query("insert into learning_history (user_id, client_event_id, event_type, ref_id, score, passed, occurred_at) values ($1, $2, 'lesson', $3, 88, true, $4)", [u, id, ref, at]);

beforeAll(async () => {
  db = await openEmbedded(undefined, ROOT);
  admin = await newUser(db, 'Admin R10', 'admin');
  guru = await newUser(db, 'Pak Guru');
  guru2 = await newUser(db, 'Bu Guru Lain');
  siti = await newUser(db, 'Siti');
  budi = await newUser(db, 'Budi');
  ibu = await newUser(db, 'Ibu Siti');
});
afterAll(async () => {
  await db.close();
});

describe('lisensi sekolah (pemilik)', () => {
  it('hanya admin yang bisa membuat lisensi; kodenya 8 karakter tanpa huruf yang mirip', async () => {
    await expect(db.rpc('admin_create_license', { p_actor: guru, p_school: 'X', p_contact: null, p_max_teachers: 1, p_max_classes: 1, p_seats: 1, p_starts: day(0), p_ends: day(1), p_note: null })).rejects.toThrow();
    const l = await license();
    expect(l.code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    const list = await db.rpc<{ code: string; active: boolean; teachers: number; classes: number; students: number }[]>('admin_licenses', { p_actor: admin });
    expect(list.find((x) => x.code === l.code)).toMatchObject({ active: true, teachers: 0, classes: 0, students: 0 });
    await expect(db.rpc('admin_licenses', { p_actor: guru })).rejects.toThrow();
  });

  it('tanggal berakhir tidak boleh sebelum tanggal mulai', async () => {
    await expect(license({ starts: day(5), ends: day(1) })).rejects.toThrow();
  });
});

describe('guru, kelas, siswa, dan Premium kelas', () => {
  let lic: Lic;
  let classId: number;
  let joinCode: string;

  it('guru mengaktifkan kode lisensi dan langsung Premium sampai lisensi berakhir', async () => {
    lic = await license({ school: 'SMA Lentera', teachers: 1, classes: 1, seats: 2 });
    expect(await db.rpc('teacher_activate', { p_user: guru, p_code: 'ZZZZZZZZ' })).toEqual({ error: 'code_not_found' });
    expect(await db.rpc('teacher_activate', { p_user: guru, p_code: lic.code.toLowerCase().replace(/(.{4})/, '$1-') })).toEqual({ school: 'SMA Lentera' });
    expect(await db.rpc('teacher_activate', { p_user: guru, p_code: lic.code })).toMatchObject({ already: true });
    expect(await db.rpc('teacher_activate', { p_user: guru2, p_code: lic.code })).toEqual({ error: 'teacher_limit' });
    const e = await ent(guru);
    expect(e).toMatchObject({ premium: true, plan: 'teacher' });
    // Premium runs through the license's last day (midnight WIB after it).
    expect(new Date(e.expires_at!).toISOString()).toBe(new Date(`${day(91)}T00:00:00+07:00`).toISOString());
  });

  it('lisensi yang belum mulai tidak bisa diaktifkan', async () => {
    const later = await license({ school: 'SD Nanti', starts: day(3), ends: day(30) });
    expect(await db.rpc('teacher_activate', { p_user: guru2, p_code: later.code })).toEqual({ error: 'license_inactive' });
  });

  it('guru membuat kelas sebatas kuota; guru lain tidak bisa memakai lisensi itu', async () => {
    expect(await db.rpc('create_class', { p_user: guru2, p_license: lic.id, p_name: 'Kelas curian', p_level: 'A1' })).toEqual({ error: 'not_teacher' });
    const c = await db.rpc<{ id: number; join_code: string }>('create_class', { p_user: guru, p_license: lic.id, p_name: '7A Bahasa Inggris', p_level: 'A2' });
    expect(c.join_code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    classId = c.id;
    joinCode = c.join_code;
    expect(await db.rpc('create_class', { p_user: guru, p_license: lic.id, p_name: '7B', p_level: 'ZZ' })).toEqual({ error: 'class_limit' });
    const o = await db.rpc<{ licenses: { classes_used: number }[]; classes: { join_code: string; students: number }[] }>('teacher_overview', { p_user: guru });
    expect(o.licenses[0].classes_used).toBe(1);
    expect(o.classes).toEqual([expect.objectContaining({ join_code: joinCode, students: 0 })]);
  });

  it('siswa bergabung dengan kode, mendapat Premium kelas, dan kelas penuh menolak siswa ketiga', async () => {
    expect(await ent(siti)).toMatchObject({ premium: false, plan: 'free' });
    expect(await db.rpc('join_class', { p_user: siti, p_code: joinCode.toLowerCase() })).toEqual({ name: '7A Bahasa Inggris', school: 'SMA Lentera', teacher: 'Pak Guru' });
    expect(await db.rpc('join_class', { p_user: siti, p_code: joinCode })).toMatchObject({ already: true });
    expect(await ent(siti)).toMatchObject({ premium: true, plan: 'class' });
    await db.rpc('join_class', { p_user: budi, p_code: joinCode });
    const third = await newUser(db, 'Ketiga');
    expect(await db.rpc('join_class', { p_user: third, p_code: joinCode })).toEqual({ error: 'class_full' });
    expect(await db.rpc('join_class', { p_user: third, p_code: 'AAAAAA' })).toEqual({ error: 'code_not_found' });
  });

  it('langganan berbayar yang lebih lama tetap menang atas Premium kelas', async () => {
    const [tx] = await db.query<{ id: string }>(`insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel, status, paid_at)
      values ($1, 'premium_yearly', 'r10-ref-1', 468000, 'QRIS', 'SUCCEEDED', now()) returning id`, [budi]);
    await db.query("insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id) values ($1, 'premium_yearly', now(), now() + interval '365 days', $2)", [budi, tx.id]);
    expect(await ent(budi)).toMatchObject({ premium: true, plan: 'premium_yearly' });
  });

  it('tugas: tenggat harus di masa depan, hasil dihitung dari riwayat belajar sesudah tugas diberikan', async () => {
    const due = new Date(Date.now() + 3 * 86_400_000).toISOString();
    expect(await db.rpc('add_assignment', { p_user: guru, p_class: classId, p_kind: 'lesson', p_ref: 'a1-greetings', p_title: 'Salam', p_note: null, p_due: new Date(Date.now() - 1000).toISOString() })).toEqual({ error: 'past_due' });
    expect(await db.rpc('add_assignment', { p_user: guru2, p_class: classId, p_kind: 'lesson', p_ref: 'a1-greetings', p_title: 'Salam', p_note: null, p_due: due })).toEqual({ error: 'not_teacher' });
    const a = await db.rpc<{ id: number }>('add_assignment', { p_user: guru, p_class: classId, p_kind: 'lesson', p_ref: 'a1-greetings', p_title: 'Salam', p_note: 'Kerjakan dua kali', p_due: due });
    // An old attempt (before the assignment) does not count; a new one does.
    await lesson(siti, 'a1-greetings', new Date(Date.now() - 5 * 86_400_000).toISOString());
    let mine = await db.rpc<{ assignments: { id: number; result: unknown }[] }[]>('my_classes', { p_user: siti });
    expect(mine[0].assignments.find((x) => x.id === a.id)?.result).toBeNull();
    await lesson(siti, 'a1-greetings', new Date().toISOString());
    mine = await db.rpc('my_classes', { p_user: siti });
    expect(mine[0]).toMatchObject({ name: '7A Bahasa Inggris', teacher: 'Pak Guru', active: true });
    expect(mine[0].assignments.find((x) => x.id === a.id)?.result).toMatchObject({ score: 88, late: false });

    const d = await db.rpc<ClassDetail>('class_detail', { p_user: guru, p_class: classId });
    expect(d.assignments[0]).toMatchObject({ id: a.id, done: 1 });
    expect(d.students.map((s) => s.name)).toEqual(['Budi', 'Siti']);
    expect(d.students.find((s) => s.name === 'Siti')!.results[String(a.id)]).toMatchObject({ score: 88 });
    expect(d.students.find((s) => s.name === 'Budi')!.results[String(a.id)]).toBeNull();
    await expect(db.rpc('class_detail', { p_user: guru2, p_class: classId })).rejects.toThrow(/forbidden/);

    expect(await db.rpc('delete_assignment', { p_user: guru2, p_id: a.id })).toEqual({ deleted: false });
    expect(await db.rpc('delete_assignment', { p_user: guru, p_id: a.id })).toEqual({ deleted: true });
  });

  it('kode kelas baru membuat kode lama tidak berlaku; kelas diarsipkan menutup Premium', async () => {
    await db.rpc('update_class', { p_user: guru, p_class: classId, p_patch: { new_code: true, name: '7A (baru)' } });
    const [c] = await db.query<{ join_code: string; name: string }>('select join_code, name from classes where id = $1', [classId]);
    expect(c.join_code).not.toBe(joinCode);
    expect(c.name).toBe('7A (baru)');
    const late = await newUser(db, 'Terlambat');
    expect(await db.rpc('join_class', { p_user: late, p_code: joinCode })).toEqual({ error: 'code_not_found' });
    expect(await db.rpc('update_class', { p_user: guru2, p_class: classId, p_patch: { archived: true } })).toEqual({ error: 'not_teacher' });
    await db.rpc('update_class', { p_user: guru, p_class: classId, p_patch: { archived: true } });
    expect(await ent(siti)).toMatchObject({ premium: false });
    expect(await db.rpc('join_class', { p_user: late, p_code: c.join_code })).toEqual({ error: 'class_closed' });
    await db.rpc('update_class', { p_user: guru, p_class: classId, p_patch: { archived: false } });
    expect(await ent(siti)).toMatchObject({ premium: true, plan: 'class' });
  });

  it('pemilik memperpanjang atau menghentikan lisensi; Premium guru dan siswa ikut berubah', async () => {
    await db.rpc('admin_update_license', { p_actor: admin, p_id: lic.id, p_patch: { ends_on: day(200) } });
    expect(new Date((await ent(siti)).expires_at!).toISOString()).toBe(new Date(`${day(201)}T00:00:00+07:00`).toISOString());
    await db.rpc('admin_update_license', { p_actor: admin, p_id: lic.id, p_patch: { revoked: true } });
    expect(await ent(siti)).toMatchObject({ premium: false });
    expect(await ent(guru)).toMatchObject({ premium: false });
    expect(await db.rpc('create_class', { p_user: guru, p_license: lic.id, p_name: '8A', p_level: null })).toMatchObject({ error: expect.any(String) });
    await db.rpc('admin_update_license', { p_actor: admin, p_id: lic.id, p_patch: { revoked: false } });
    expect(await ent(siti)).toMatchObject({ premium: true });
    await expect(db.rpc('admin_update_license', { p_actor: admin, p_id: 999999, p_patch: { revoked: true } })).rejects.toThrow(/not_found/);
    await expect(db.rpc('admin_update_license', { p_actor: guru, p_id: lic.id, p_patch: { revoked: true } })).rejects.toThrow();
  });

  it('guru mengeluarkan siswa; siswa bisa keluar sendiri', async () => {
    expect(await db.rpc('remove_student', { p_user: guru2, p_class: classId, p_student: budi })).toEqual({ error: 'not_teacher' });
    expect(await db.rpc('remove_student', { p_user: guru, p_class: classId, p_student: budi })).toEqual({ removed: true });
    expect(await db.rpc('leave_class', { p_user: siti, p_class: classId })).toEqual({ left: true });
    expect(await db.rpc('my_classes', { p_user: siti })).toEqual([]);
    expect(await ent(siti)).toMatchObject({ premium: false });
  });
});

describe('dasbor orang tua', () => {
  it('anak membuat kode sekali pakai; orang tua menautkan dan melihat ringkasan tanpa jawaban', async () => {
    const { code } = await db.rpc<{ code: string }>('parent_code', { p_child: siti });
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(await db.rpc('link_parent', { p_parent: siti, p_code: code })).toEqual({ error: 'own_code' });
    expect(await db.rpc('link_parent', { p_parent: ibu, p_code: code })).toEqual({ name: 'Siti' });
    // Used once: the same code no longer works.
    expect(await db.rpc('link_parent', { p_parent: budi, p_code: code })).toEqual({ error: 'code_not_found' });
    const [child] = await db.rpc<Record<string, unknown>[]>('parent_overview', { p_parent: ibu });
    expect(child).toMatchObject({ id: siti, name: 'Siti', lessons: 1, lessons_week: 2, homework: { open: 0, overdue: 0 }, certificates: [] });
    expect(Object.keys(child).sort()).toEqual(['avatar', 'certificates', 'classes', 'days_active_week', 'homework', 'id', 'last_active', 'lessons', 'lessons_week', 'level', 'name', 'streak', 'xp_week']);
    expect(await db.rpc('my_parents', { p_child: siti })).toEqual([expect.objectContaining({ id: ibu, name: 'Ibu Siti' })]);
    expect(await db.rpc('parent_overview', { p_parent: budi })).toEqual([]);
  });

  it('kode kedaluwarsa ditolak; anak bisa memutus tautan', async () => {
    const { code } = await db.rpc<{ code: string }>('parent_code', { p_child: budi });
    await db.query("update parent_codes set expires_at = now() - interval '1 minute' where child_id = $1", [budi]);
    expect(await db.rpc('link_parent', { p_parent: ibu, p_code: code })).toEqual({ error: 'code_not_found' });
    expect(await db.rpc('unlink_parent', { p_user: siti, p_other: ibu })).toEqual({ removed: true });
    expect(await db.rpc('parent_overview', { p_parent: ibu })).toEqual([]);
  });

  it('paling banyak 3 orang tua per anak', async () => {
    for (let i = 0; i < 3; i++) {
      const p = await newUser(db, `Wali ${i}`);
      const { code } = await db.rpc<{ code: string }>('parent_code', { p_child: siti });
      expect(await db.rpc('link_parent', { p_parent: p, p_code: code })).toEqual({ name: 'Siti' });
    }
    const { code } = await db.rpc<{ code: string }>('parent_code', { p_child: siti });
    expect(await db.rpc('link_parent', { p_parent: ibu, p_code: code })).toEqual({ error: 'parent_limit' });
  });
});

describe('keamanan dan cadangan', () => {
  it('tabel kelas tertutup bagi klien; semua fungsi hanya untuk server', async () => {
    const rows = await db.query<{ relname: string; relrowsecurity: boolean }>("select relname, relrowsecurity from pg_class where relname in ('school_licenses','license_teachers','classes','class_members','class_assignments','parent_links','parent_codes') order by relname");
    expect(rows).toHaveLength(7);
    expect(rows.every((r) => r.relrowsecurity)).toBe(true);
    const open = await db.query("select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('join_class','teacher_activate','link_parent','admin_create_license','parent_overview') and has_function_privilege('anon', p.oid, 'execute')");
    expect(open).toEqual([]);
  });

  it('cadangan memuat data kelas tetapi tidak memuat kode orang tua yang masih berlaku', async () => {
    const tables = await db.rpc<string[]>('backup_tables');
    for (const t of ['school_licenses', 'license_teachers', 'classes', 'class_members', 'class_assignments', 'parent_links']) expect(tables).toContain(t);
    expect(tables).not.toContain('parent_codes');
  });

  it('pesan error ramah dan kode dibersihkan sebelum dikirim ke basis data', () => {
    expect(cleanCode(' ab-c 2x9 ', 6)).toBe('ABC2X9');
    expect(cleanCode(42, 6)).toBe('');
    expect(() => classError({ error: 'class_full' })).toThrow(CLASS_ERRORS.class_full[1]);
    expect(() => classError({ error: 'something_new' })).toThrow('Permintaan tidak bisa diproses.');
    expect(() => classError({})).not.toThrow();
  });

  it('rekap CSV aman dibuka di Excel (tanpa formula) dan tautan tugas menuju halaman yang benar', () => {
    const csv = rosterCsv({
      class: { id: 1, name: '7A', level: 'A2', join_code: 'ABC234', archived: false, school: 'S', seats: 40, license_active: true, ends_on: day(10) },
      assignments: [{ id: 5, kind: 'lesson', ref_id: 'a1-greetings', title: 'Salam, "halo"', note: null, due_at: '2026-11-20T16:59:00Z', created_at: '2026-11-15T00:00:00Z', done: 1 }],
      students: [{ id: 'u', name: '=HYPERLINK("x")', avatar: 0, level: 'A2', joined_at: '', xp_week: 10, xp_total: 50, lessons: 2, mastery: 80, streak: 3, last_active: '2026-11-15T03:00:00Z', results: { 5: { at: '', score: 88, late: true } } }],
    });
    const [head, row] = csv.split('\n');
    expect(head).toContain('"Salam, ""halo"" (tenggat 2026-11-20)"');
    expect(row.startsWith(`"'=HYPERLINK(""x"")"`)).toBe(true);
    expect(row.endsWith('88 (terlambat)')).toBe(true);
    expect(assignmentHref({ kind: 'lesson', ref_id: 'a1-greetings' })).toBe('/app/lesson?id=a1-greetings');
    expect(assignmentHref({ kind: 'homework', ref_id: 'hw a' })).toBe('/app/homework?id=hw%20a');
    expect(assignmentHref({ kind: 'exam', ref_id: 'exam.a1-c1-u1' })).toBe('/app/exams?id=exam.a1-c1-u1');
  });
});
