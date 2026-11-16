package id.lenteraenglish.app;

import java.util.Calendar;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Pure reminder rules (no Android classes), mirroring the server in
 * src/lib/server/reminders.ts so the app and the web send the same messages.
 * Unit-tested in ReminderLogicTest.
 */
public final class ReminderLogic {
    private ReminderLogic() {}

    public static final long HOUR = 3_600_000L;
    public static final long DAY = 24 * HOUR;
    /** Homework reminders only between 07.00 and 20.00 local time, like the server. */
    public static final int FIRST_HOUR = 7;
    public static final int LAST_HOUR = 20;

    /** "2026-11-15" for the local calendar day of {@code ms}. */
    public static String dayKey(long ms, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(ms);
        return String.format(Locale.ROOT, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    private static long atHour(long ms, int hour, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(ms);
        c.set(Calendar.HOUR_OF_DAY, hour);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis();
    }

    /** Next time the daily reminder at {@code hour}:00 should fire, strictly after now. */
    public static long nextDaily(long now, int hour, TimeZone tz) {
        long today = atHour(now, hour, tz);
        if (today > now + 30_000) return today;
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(today);
        c.add(Calendar.DAY_OF_MONTH, 1);
        return c.getTimeInMillis();
    }

    /**
     * When to remind about homework due at {@code dueAt}: about a day before,
     * moved into 07.00–20.00. Returns -1 when there is no sensible moment left.
     */
    public static long homeworkTrigger(long dueAt, long now, TimeZone tz) {
        if (dueAt <= now + HOUR) return -1;
        long t = Math.max(dueAt - DAY, now + 60_000);
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(t);
        int h = c.get(Calendar.HOUR_OF_DAY);
        if (h < FIRST_HOUR) t = atHour(t, FIRST_HOUR, tz);
        else if (h >= LAST_HOUR) {
            c.add(Calendar.DAY_OF_MONTH, 1);
            t = atHour(c.getTimeInMillis(), FIRST_HOUR, tz);
        }
        return t < dueAt - 30 * 60_000 ? t : -1;
    }

    /** What the streak looks like at fire time: [studiedToday(0/1), streakAtStake, freeze(0/1)]. */
    public static int[] streakState(String lastDate, int current, int freezes, long now, TimeZone tz) {
        String today = dayKey(now, tz);
        if (today.equals(lastDate)) return new int[] {1, current, 0};
        if (dayKey(now - DAY, tz).equals(lastDate)) return new int[] {0, current, 0};
        if (dayKey(now - 2 * DAY, tz).equals(lastDate) && freezes > 0 && current > 0) return new int[] {0, current, 1};
        return new int[] {0, 0, 0};
    }

    /** Title and body, word for word as dailyMessage() on the server. */
    public static String[] dailyMessage(int streak, boolean freeze) {
        if (freeze && streak > 0) return new String[] {"Selamatkan " + streak + " hari beruntunmu", "Kemarin terlewat, tapi pelindung beruntun masih ada. Belajar hari ini agar beruntunmu tetap menyala."};
        if (streak > 0) return new String[] {"Jaga " + streak + " hari beruntunmu", "Kamu belum belajar hari ini. Satu pelajaran singkat atau ulangan 5 menit sudah cukup agar beruntunmu tidak putus."};
        return new String[] {"Waktunya belajar bahasa Inggris", "Mulai beruntun baru hari ini: satu pelajaran singkat sudah cukup."};
    }

    /** Homework notification text. */
    public static String[] homeworkMessage(String title) {
        String name = title == null || title.isEmpty() ? "PR" : title;
        return new String[] {"Tenggat PR sudah dekat", "\"" + name + "\" belum dikumpulkan. Buka Pusat PR untuk mengerjakannya."};
    }

    /** Only paths of this site, starting with /app, may be opened from a notification. */
    public static String safeAppPath(String path) {
        if (path == null || !path.startsWith("/app") || path.contains("..") || path.contains("//") || path.length() > 200) return "/app";
        return path;
    }
}
