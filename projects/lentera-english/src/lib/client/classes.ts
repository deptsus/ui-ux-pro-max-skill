'use client';
// Rilis 10 "Kelas" on the client: student classes, teacher tools and parent
// view (/api/classes, /api/teacher, /api/parent; migration 0015).
import { api } from './api';

export interface AssignmentResult { at: string; score: number | null; late: boolean }
export interface Assignment { id: number; kind: 'lesson' | 'homework' | 'exam'; ref_id: string; title: string; note: string | null; due_at: string; result?: AssignmentResult | null }
export interface MyClass { id: number; name: string; level: string | null; school: string; teacher: string; active: boolean; assignments: Assignment[] }

export interface TeacherLicense { id: number; school: string; ends_on: string; active: boolean; max_classes: number; seats_per_class: number; classes_used: number }
export interface TeacherClass { id: number; name: string; level: string | null; join_code: string; archived: boolean; license_id: number; school: string; license_active: boolean; students: number; open_assignments: number }
export interface TeacherOverview { licenses: TeacherLicense[]; classes: TeacherClass[] }
export interface Student {
  id: string; name: string; avatar: number; level: string | null; joined_at: string;
  xp_week: number; xp_total: number; lessons: number; mastery: number | null; streak: number; last_active: string | null;
  results: Record<string, AssignmentResult | null>;
}
export interface ClassDetail {
  class: { id: number; name: string; level: string | null; join_code: string; archived: boolean; school: string; seats: number; license_active: boolean; ends_on: string };
  assignments: (Assignment & { created_at: string; done: number })[];
  students: Student[];
}

export interface Child {
  id: string; name: string; avatar: number; level: string | null; streak: number; xp_week: number; last_active: string | null;
  lessons: number; lessons_week: number; days_active_week: number;
  homework: { open: number; overdue: number };
  certificates: { level: string; code: string; issued_at: string }[];
  classes: MyClass[];
}
export interface ParentLink { id: string; name: string; since: string }

export const myClasses = () => api<{ classes: MyClass[] }>('/api/classes');
export const classAction = (body: { action: 'join'; code: string } | { action: 'leave'; classId: number }) => api<{ message: string; classes: MyClass[] }>('/api/classes', { body });

export const teacherOverview = () => api<TeacherOverview>('/api/teacher');
export const teacherAction = <T = { message: string }>(body: Record<string, unknown>) => api<T>('/api/teacher', { body });

export const parentData = () => api<{ children: Child[]; parents: ParentLink[] }>('/api/parent');
export const parentAction = <T = { message: string }>(body: Record<string, unknown>) => api<T>('/api/parent', { body });

export const KIND_LABEL: Record<Assignment['kind'], string> = { lesson: 'Pelajaran', homework: 'PR', exam: 'Ujian unit' };
/** Where a student opens an assignment in the app. */
export const assignmentHref = (a: Pick<Assignment, 'kind' | 'ref_id'>) =>
  a.kind === 'lesson' ? `/app/lesson?id=${encodeURIComponent(a.ref_id)}` : a.kind === 'homework' ? `/app/homework?id=${encodeURIComponent(a.ref_id)}` : `/app/exams?id=${encodeURIComponent(a.ref_id)}`;

/** "Kam, 20 Nov · 23.59" in the learner's time. */
export function dueText(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
}

/** CSV for spreadsheets (Excel, Google Sheets), one row per student. */
export function rosterCsv(d: ClassDetail): string {
  const head = ['Nama', 'Level', 'XP minggu ini', 'XP total', 'Pelajaran tuntas', 'Rata-rata penguasaan', 'Beruntun', 'Terakhir aktif', ...d.assignments.map((a) => `${a.title} (tenggat ${a.due_at.slice(0, 10)})`)];
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    // Spreadsheets run cells starting with = + - @ as formulas; prefix them.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const rows = d.students.map((s) => [s.name, s.level ?? '', s.xp_week, s.xp_total, s.lessons, s.mastery ?? '', s.streak, s.last_active ? s.last_active.slice(0, 10) : '',
    ...d.assignments.map((a) => { const r = s.results[String(a.id)]; return r ? `${r.score ?? 'selesai'}${r.late ? ' (terlambat)' : ''}` : new Date(a.due_at) < new Date() ? 'belum' : ''; })]);
  return [head, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}
