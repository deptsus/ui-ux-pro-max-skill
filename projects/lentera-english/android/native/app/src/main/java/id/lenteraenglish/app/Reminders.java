package id.lenteraenglish.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import java.util.HashSet;
import java.util.Set;
import java.util.TimeZone;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * On-device reminders. A WebView cannot receive Web Push, so the site tells
 * the app (through the bridge) the learner's chosen hour, streak and homework
 * deadlines, and the app schedules local notifications with AlarmManager.
 * Nothing leaves the phone.
 */
public final class Reminders {
    private Reminders() {}

    static final String CH_DAILY = "daily";
    static final String CH_HOMEWORK = "homework";
    static final String ACTION_DAILY = "id.lenteraenglish.app.DAILY";
    static final String ACTION_HOMEWORK = "id.lenteraenglish.app.HOMEWORK";
    private static final String PREFS = "lentera.reminders";

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static void createChannels(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        NotificationChannel daily = new NotificationChannel(CH_DAILY, c.getString(R.string.channel_daily), NotificationManager.IMPORTANCE_DEFAULT);
        daily.setDescription(c.getString(R.string.channel_daily_desc));
        NotificationChannel hw = new NotificationChannel(CH_HOMEWORK, c.getString(R.string.channel_homework), NotificationManager.IMPORTANCE_DEFAULT);
        hw.setDescription(c.getString(R.string.channel_homework_desc));
        nm.createNotificationChannel(daily);
        nm.createNotificationChannel(hw);
    }

    static boolean canNotify(Context c) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
        return NotificationManagerCompat.from(c).areNotificationsEnabled();
    }

    private static PendingIntent alarmIntent(Context c, String action, int code, String extraId, String extraTitle) {
        Intent i = new Intent(c, ReminderReceiver.class).setAction(action);
        if (extraId != null) i.putExtra("id", extraId);
        if (extraTitle != null) i.putExtra("title", extraTitle);
        return PendingIntent.getBroadcast(c, code, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private static void at(Context c, long when, PendingIntent pi) {
        AlarmManager am = c.getSystemService(AlarmManager.class);
        // Inexact (a 10-minute window) is enough for a study reminder and needs no special permission.
        am.setWindow(AlarmManager.RTC_WAKEUP, when, 10 * 60_000L, pi);
    }

    // ───────── Daily study reminder ─────────

    static void setDaily(Context c, int hour) {
        prefs(c).edit().putInt("daily_hour", hour).apply();
        scheduleDaily(c);
    }

    static void scheduleDaily(Context c) {
        int hour = prefs(c).getInt("daily_hour", -1);
        PendingIntent pi = alarmIntent(c, ACTION_DAILY, 1, null, null);
        c.getSystemService(AlarmManager.class).cancel(pi);
        if (hour < 5 || hour > 22) return;
        at(c, ReminderLogic.nextDaily(System.currentTimeMillis(), hour, TimeZone.getDefault()), pi);
    }

    static void setStreak(Context c, int current, String lastDate, int freezes) {
        prefs(c).edit().putInt("streak_current", Math.max(0, current)).putString("streak_last", lastDate == null ? "" : lastDate)
            .putInt("streak_freezes", Math.max(0, freezes)).apply();
    }

    static void fireDaily(Context c) {
        SharedPreferences p = prefs(c);
        int[] s = ReminderLogic.streakState(p.getString("streak_last", ""), p.getInt("streak_current", 0), p.getInt("streak_freezes", 0),
            System.currentTimeMillis(), TimeZone.getDefault());
        if (s[0] == 0) {
            String[] m = ReminderLogic.dailyMessage(s[1], s[2] == 1);
            show(c, CH_DAILY, 1, m[0], m[1], "/app");
        }
        scheduleDaily(c);
    }

    // ───────── Homework deadlines ─────────

    /** Replaces every scheduled homework reminder with these items ({id, title, dueAt}). */
    static int setHomework(Context c, JSONArray items, boolean on) {
        SharedPreferences p = prefs(c);
        AlarmManager am = c.getSystemService(AlarmManager.class);
        for (String id : p.getStringSet("homework_ids", new HashSet<>())) am.cancel(alarmIntent(c, ACTION_HOMEWORK, code(id), id, null));
        Set<String> ids = new HashSet<>();
        Set<String> done = p.getStringSet("homework_done", new HashSet<>());
        int n = 0;
        long now = System.currentTimeMillis();
        if (on && items != null) {
            for (int k = 0; k < Math.min(items.length(), 50); k++) {
                JSONObject it = items.optJSONObject(k);
                if (it == null) continue;
                String id = it.optString("id", "");
                if (id.isEmpty() || id.length() > 120 || done.contains(id)) continue;
                long when = ReminderLogic.homeworkTrigger(it.optLong("dueAt", 0), now, TimeZone.getDefault());
                if (when < 0) continue;
                String title = it.optString("title", "PR");
                at(c, when, alarmIntent(c, ACTION_HOMEWORK, code(id), id, title.length() > 80 ? title.substring(0, 80) : title));
                ids.add(id);
                n++;
            }
        }
        p.edit().putStringSet("homework_ids", ids).putBoolean("homework_on", on).putString("homework_items", items == null ? "[]" : items.toString()).apply();
        return n;
    }

    static void fireHomework(Context c, String id, String title) {
        SharedPreferences p = prefs(c);
        if (!p.getBoolean("homework_on", true) || id == null) return;
        Set<String> done = new HashSet<>(p.getStringSet("homework_done", new HashSet<>()));
        if (done.contains(id)) return;
        done.add(id);
        p.edit().putStringSet("homework_done", done).apply();
        String[] m = ReminderLogic.homeworkMessage(title);
        show(c, CH_HOMEWORK, code(id), m[0], m[1], "/app/homework?id=" + Uri.encode(id));
    }

    /** After a reboot or an app update, alarms are gone: schedule them again. */
    static void restore(Context c) {
        scheduleDaily(c);
        try {
            setHomework(c, new JSONArray(prefs(c).getString("homework_items", "[]")), prefs(c).getBoolean("homework_on", true));
        } catch (Exception ignored) {
            // A broken stored list only means no homework reminders until the app opens again.
        }
    }

    private static int code(String id) {
        return 1000 + (id.hashCode() & 0x3fffffff);
    }

    private static void show(Context c, String channel, int id, String title, String body, String path) {
        createChannels(c);
        if (!canNotify(c)) return;
        Intent open = new Intent(c, MainActivity.class).setAction(Intent.ACTION_VIEW)
            .setData(Uri.parse(BuildConfig.SITE + ReminderLogic.safeAppPath(path)))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, id, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, channel)
            .setSmallIcon(R.drawable.ic_notification_icon)
            .setColor(0xFF4B3FD6)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pi)
            .setAutoCancel(true);
        try {
            NotificationManagerCompat.from(c).notify(id, b.build());
        } catch (SecurityException ignored) {
            // Permission withdrawn between the check and here.
        }
    }
}
