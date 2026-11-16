package id.lenteraenglish.app;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.TimeZone;
import org.junit.Test;

public class ReminderLogicTest {
    private static final TimeZone WIB = TimeZone.getTimeZone("Asia/Jakarta");
    /** 18 Nov 2026 10:00 WIB. */
    private static final long NOW = 1794970800000L;

    @Test public void dayKeyUsesLocalDate() {
        assertEquals("2026-11-18", ReminderLogic.dayKey(NOW, WIB));
        assertEquals("2026-11-19", ReminderLogic.dayKey(NOW + 15 * ReminderLogic.HOUR, WIB));
    }

    @Test public void dailyIsTodayIfStillAheadElseTomorrow() {
        assertEquals(NOW + 9 * ReminderLogic.HOUR, ReminderLogic.nextDaily(NOW, 19, WIB));
        assertEquals(NOW + 23 * ReminderLogic.HOUR, ReminderLogic.nextDaily(NOW, 9, WIB));
        assertEquals(NOW + ReminderLogic.DAY, ReminderLogic.nextDaily(NOW, 10, WIB));
    }

    @Test public void homeworkReminderADayBeforeWithinDaytime() {
        // Due tomorrow 15:00 → today 15:00.
        assertEquals(NOW + 5 * ReminderLogic.HOUR, ReminderLogic.homeworkTrigger(NOW + 29 * ReminderLogic.HOUR, NOW, WIB));
        // Due 21 Nov 03:00 → a day before is 20 Nov 03:00 → moved to 07:00 (+45 h).
        assertEquals(NOW + 45 * ReminderLogic.HOUR, ReminderLogic.homeworkTrigger(NOW + 65 * ReminderLogic.HOUR, NOW, WIB));
        // Due in 5 hours: remind in a minute.
        assertEquals(NOW + 60_000, ReminderLogic.homeworkTrigger(NOW + 5 * ReminderLogic.HOUR, NOW, WIB));
        // Due within the hour, or overdue: nothing.
        assertEquals(-1, ReminderLogic.homeworkTrigger(NOW + 30 * 60_000, NOW, WIB));
        assertEquals(-1, ReminderLogic.homeworkTrigger(NOW - ReminderLogic.HOUR, NOW, WIB));
    }

    @Test public void streakStateAtFireTime() {
        assertArrayEquals(new int[] {1, 6, 0}, ReminderLogic.streakState("2026-11-18", 6, 1, NOW, WIB));
        assertArrayEquals(new int[] {0, 6, 0}, ReminderLogic.streakState("2026-11-17", 6, 0, NOW, WIB));
        assertArrayEquals(new int[] {0, 6, 1}, ReminderLogic.streakState("2026-11-16", 6, 1, NOW, WIB));
        assertArrayEquals(new int[] {0, 0, 0}, ReminderLogic.streakState("2026-11-10", 6, 1, NOW, WIB));
    }

    @Test public void messagesMatchTheServer() {
        assertEquals("Jaga 6 hari beruntunmu", ReminderLogic.dailyMessage(6, false)[0]);
        assertEquals("Selamatkan 6 hari beruntunmu", ReminderLogic.dailyMessage(6, true)[0]);
        assertEquals("Waktunya belajar bahasa Inggris", ReminderLogic.dailyMessage(0, false)[0]);
        assertTrue(ReminderLogic.homeworkMessage("PR Mingguan")[1].startsWith("\"PR Mingguan\" belum dikumpulkan"));
    }

    @Test public void notificationsOnlyOpenAppPages() {
        assertEquals("/app/homework?id=x", ReminderLogic.safeAppPath("/app/homework?id=x"));
        assertEquals("/app", ReminderLogic.safeAppPath("https://evil.test/app"));
        assertEquals("/app", ReminderLogic.safeAppPath("/app/../admin"));
        assertEquals("/app", ReminderLogic.safeAppPath(null));
    }
}
