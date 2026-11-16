package id.lenteraenglish.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Alarm went off: show the daily or homework reminder. */
public class ReminderReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        String action = i.getAction();
        if (Reminders.ACTION_DAILY.equals(action)) Reminders.fireDaily(c);
        else if (Reminders.ACTION_HOMEWORK.equals(action)) Reminders.fireHomework(c, i.getStringExtra("id"), i.getStringExtra("title"));
    }
}
