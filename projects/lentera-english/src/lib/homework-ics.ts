// Homework deadlines as an iCalendar file (Rilis 4), so learners can put them in
// their phone's own calendar, with an alarm, without any notification permission.
import { dayKey } from '@/lib/engine/mastery';

export interface CalendarItem {
  id: string;
  title: string;
  dueAt: number;
  status: 'done' | 'pending' | 'overdue';
}

const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
const icsDate = (ms: number) => dayKey(ms).replace(/-/g, '');

/** An iCalendar file with one all-day event per pending PR, each with an alarm at 18:00 the day before. */
export function homeworkIcs(items: CalendarItem[], origin: string, now: number): string {
  const stamp = new Date(now).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const events = items.filter((i) => i.status !== 'done').map((i) => {
    const end = new Date(i.dueAt);
    end.setDate(end.getDate() + 1);
    return [
      'BEGIN:VEVENT',
      `UID:${i.id}@lentera-english`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(i.dueAt)}`,
      `DTEND;VALUE=DATE:${icsDate(end.getTime())}`,
      `SUMMARY:${icsText(`Tenggat PR: ${i.title}`)}`,
      `DESCRIPTION:${icsText(`Kerjakan di ${origin}/app/homework?id=${i.id}`)}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT6H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsText(`Besok tenggat PR: ${i.title}`)}`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lentera English//Pusat PR//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR', ''].join('\r\n');
}

