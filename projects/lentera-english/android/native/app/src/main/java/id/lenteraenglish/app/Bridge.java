package id.lenteraenglish.app;

import android.net.Uri;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewCompat;
import org.json.JSONObject;

/**
 * window.LenteraNative: messages between the site and the app. Only the
 * site's own origin, in the main frame, gets this object (the allowed-origin
 * rule is enforced by the WebView, and checked again here). Each message is
 * a small JSON object with a "type"; see src/lib/client/native.ts on the site.
 */
final class Bridge implements WebViewCompat.WebMessageListener {
    interface Host {
        void speak(String id, String text, String lang, boolean slow);
        void stopSpeech();
        boolean speechAvailable();
        void askNotifications();
        String notificationState();
        void share(String title, String text);
        void shareFile(String name, String mime, String base64);
        void print(String title);
    }

    private final Host host;
    private final MainActivity activity;
    private JavaScriptReplyProxy reply;

    Bridge(MainActivity activity, Host host) {
        this.activity = activity;
        this.host = host;
    }

    @Override
    public void onPostMessage(@NonNull WebView view, @NonNull WebMessageCompat message, @NonNull Uri sourceOrigin, boolean isMainFrame, @NonNull JavaScriptReplyProxy replyProxy) {
        if (!isMainFrame || !Uri.parse(BuildConfig.SITE).getHost().equals(sourceOrigin.getHost()) || !"https".equals(sourceOrigin.getScheme())) return;
        reply = replyProxy;
        String data = message.getData();
        if (data == null || data.length() > 200_000) return;
        try {
            handle(new JSONObject(data));
        } catch (Exception e) {
            send(json("error", "message", "invalid"));
        }
    }

    private void handle(JSONObject m) throws Exception {
        switch (m.optString("type")) {
            case "hello":
                JSONObject h = json("hello", "version", BuildConfig.VERSION_NAME);
                h.put("versionCode", BuildConfig.VERSION_CODE);
                h.put("notifications", host.notificationState());
                h.put("speech", host.speechAvailable());
                h.put("dailyHour", Reminders.prefs(activity).getInt("daily_hour", -1));
                send(h);
                break;
            case "notify-permission":
                host.askNotifications();
                break;
            case "daily": {
                int hour = m.isNull("hour") ? -1 : m.optInt("hour", -1);
                Reminders.setDaily(activity, hour >= 5 && hour <= 22 ? hour : -1);
                JSONObject r = json("daily", "state", host.notificationState());
                r.put("hour", hour >= 5 && hour <= 22 ? hour : JSONObject.NULL);
                send(r);
                break;
            }
            case "streak":
                Reminders.setStreak(activity, m.optInt("current", 0), m.optString("lastDate", ""), m.optInt("freezes", 0));
                break;
            case "homework": {
                int n = Reminders.setHomework(activity, m.optJSONArray("items"), m.optBoolean("on", true));
                JSONObject r = json("homework", "state", host.notificationState());
                r.put("scheduled", n);
                send(r);
                break;
            }
            case "speak":
                host.speak(m.optString("id", ""), m.optString("text", ""), m.optString("lang", "en-US"), m.optBoolean("slow", false));
                break;
            case "stop-speech":
                host.stopSpeech();
                break;
            case "share":
                host.share(m.optString("title", "Lentera English"), m.optString("text", ""));
                break;
            case "share-file":
                host.shareFile(m.optString("name", "lentera.txt"), m.optString("mime", "application/octet-stream"), m.optString("base64", ""));
                break;
            case "print":
                host.print(m.optString("title", "Lentera English"));
                break;
            default:
                send(json("error", "message", "unknown type"));
        }
    }

    static JSONObject json(String type, String key, Object value) {
        JSONObject o = new JSONObject();
        try {
            o.put("type", type);
            if (key != null) o.put(key, value);
        } catch (Exception ignored) {
            // Keys and values here are always valid JSON.
        }
        return o;
    }

    /** Messages back to the page; safe to call from any thread. */
    void send(JSONObject o) {
        activity.runOnUiThread(() -> {
            if (reply != null) reply.postMessage(o.toString());
        });
    }
}
