package id.lenteraenglish.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.provider.Settings;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedDispatcher;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Collections;

/**
 * Lentera English 2.0: the site in Android's own WebView (no Chrome needed).
 * Navigation is kept to the Lentera site; other links open outside the app.
 * Microphone access is given only to the site, only after Android's own
 * permission prompt. Speech, reminders, sharing and printing go through
 * {@link Bridge}.
 */
public class MainActivity extends Activity implements Bridge.Host {
    private static final int REQ_MIC = 11;
    private static final int REQ_NOTIFY = 12;
    private static final String SITE = BuildConfig.SITE;
    private static final String HOST = Uri.parse(SITE).getHost();

    private WebView web;
    private ProgressBar progress;
    private View offline;
    private Bridge bridge;
    private Speech speech;
    private PermissionRequest pendingMic;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_main);
        Reminders.createChannels(this);
        web = findViewById(R.id.web);
        progress = findViewById(R.id.progress);
        offline = findViewById(R.id.offline);
        findViewById(R.id.retry).setOnClickListener(v -> { offline.setVisibility(View.GONE); web.reload(); });
        applyInsets(findViewById(android.R.id.content));

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setGeolocationEnabled(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportMultipleWindows(false);
        s.setUserAgentString(s.getUserAgentString() + " LenteraApp/" + BuildConfig.VERSION_NAME);
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) WebSettingsCompat.setAlgorithmicDarkeningAllowed(s, false);
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) WebSettingsCompat.setSafeBrowsingEnabled(s, true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);

        speech = new Speech(this, (id, ok) -> {
            try {
                org.json.JSONObject o = Bridge.json("spoken", "id", id);
                o.put("ok", ok);
                if (bridge != null) bridge.send(o);
            } catch (Exception ignored) {
                // Never happens with plain strings and booleans.
            }
        });
        bridge = new Bridge(this, this);
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(web, "LenteraNative", Collections.singleton(SITE), bridge);
        }

        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("https".equals(u.getScheme()) && HOST.equals(u.getHost()) && !u.getPath().startsWith("/download/")) return false;
                openOutside(u);
                return true;
            }
            @Override public void onPageStarted(WebView v, String url, Bitmap icon) { progress.setVisibility(View.VISIBLE); }
            @Override public void onPageFinished(WebView v, String url) { progress.setVisibility(View.GONE); }
            @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame()) offline.setVisibility(View.VISIBLE);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView v, int p) { progress.setProgress(p); }
            @Override public void onPermissionRequest(PermissionRequest req) {
                boolean ours = HOST.equals(req.getOrigin().getHost());
                boolean audioOnly = req.getResources().length == 1 && PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(req.getResources()[0]);
                if (!ours || !audioOnly) { req.deny(); return; }
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                    req.grant(req.getResources());
                } else {
                    pendingMic = req;
                    requestPermissions(new String[] {Manifest.permission.RECORD_AUDIO}, REQ_MIC);
                }
            }
        });
        web.setDownloadListener((url, ua, disposition, mime, length) -> download(url, disposition, mime));

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::back);
        }
        if (state != null) web.restoreState(state);
        else web.loadUrl(startUrl(getIntent()));
    }

    /** Android 15 draws apps edge to edge: keep the page clear of the status bar, navigation bar and keyboard. */
    private void applyInsets(View root) {
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
    }

    /** A link or notification into the app opens that page; anything else opens the start page. */
    private static String startUrl(Intent i) {
        Uri u = i == null ? null : i.getData();
        if (u != null && "https".equals(u.getScheme()) && HOST.equals(u.getHost())) {
            return SITE + ReminderLogic.safeAppPath(u.getEncodedPath() + (u.getEncodedQuery() == null ? "" : "?" + u.getEncodedQuery()));
        }
        // ?apk= tells the site which app version runs (update notice, src/lib/android.ts).
        return SITE + "/app?apk=" + BuildConfig.VERSION_CODE;
    }

    @Override protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        if (i.getData() != null) web.loadUrl(startUrl(i));
    }

    @Override protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    private void back() {
        if (web.canGoBack()) web.goBack();
        else finish();
    }

    @Override public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override protected void onResume() {
        super.onResume();
        web.onResume();
        if (notifySettingsOpen) {
            notifySettingsOpen = false;
            bridge.send(Bridge.json("notify-permission", "state", notificationState()));
        }
    }

    @Override protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override protected void onDestroy() {
        speech.shutdown();
        web.destroy();
        super.onDestroy();
    }

    private void openOutside(Uri u) {
        if (!"https".equals(u.getScheme()) && !"mailto".equals(u.getScheme())) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u).addCategory(Intent.CATEGORY_BROWSABLE));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, u.toString(), Toast.LENGTH_LONG).show();
        }
    }

    /** Files from the site (the APK update) go to Downloads; Android opens them from the notification. */
    private void download(String url, String disposition, String mime) {
        Uri u = Uri.parse(url);
        if (!"https".equals(u.getScheme()) || !HOST.equals(u.getHost())) return;
        String name = URLUtil.guessFileName(url, disposition, mime);
        DownloadManager.Request r = new DownloadManager.Request(u)
            .setMimeType(mime)
            .setTitle(name)
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
        getSystemService(DownloadManager.class).enqueue(r);
        Toast.makeText(this, R.string.download_started, Toast.LENGTH_LONG).show();
    }

    @Override public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        boolean ok = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
        if (code == REQ_MIC && pendingMic != null) {
            if (ok) pendingMic.grant(pendingMic.getResources());
            else {
                pendingMic.deny();
                Toast.makeText(this, R.string.mic_denied, Toast.LENGTH_LONG).show();
            }
            pendingMic = null;
        } else if (code == REQ_NOTIFY) {
            bridge.send(Bridge.json("notify-permission", "state", notificationState()));
        }
    }

    // ───────── Bridge.Host ─────────

    @Override public void speak(String id, String text, String lang, boolean slow) { speech.speak(id, text, lang, slow); }
    @Override public void stopSpeech() { speech.stop(); }
    @Override public boolean speechAvailable() { return speech.available(); }

    /** True while the system notification settings are open, so the page hears the result on return. */
    private boolean notifySettingsOpen;

    @Override public void askNotifications() {
        runOnUiThread(() -> {
            if (Reminders.canNotify(this)) {
                bridge.send(Bridge.json("notify-permission", "state", "granted"));
                return;
            }
            boolean asked = Reminders.prefs(this).getBoolean("asked_notify", false);
            if (Build.VERSION.SDK_INT >= 33
                && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
                && (!asked || shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS))) {
                Reminders.prefs(this).edit().putBoolean("asked_notify", true).apply();
                requestPermissions(new String[] {Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFY);
                return;
            }
            // Refused for good, or switched off in settings: only the system screen can turn it back on.
            try {
                notifySettingsOpen = true;
                startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName()));
            } catch (ActivityNotFoundException e) {
                notifySettingsOpen = false;
                bridge.send(Bridge.json("notify-permission", "state", notificationState()));
            }
        });
    }

    @Override public String notificationState() {
        if (Reminders.canNotify(this)) return "granted";
        // Never asked yet on Android 13+: the system dialog can still be shown.
        if (Build.VERSION.SDK_INT >= 33 && !Reminders.prefs(this).getBoolean("asked_notify", false)) return "default";
        return "denied";
    }

    @Override public void share(String title, String text) {
        runOnUiThread(() -> {
            Intent send = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text);
            startActivity(Intent.createChooser(send, title));
        });
    }

    @Override public void shareFile(String name, String mime, String base64) {
        runOnUiThread(() -> {
            try {
                String safe = name.replaceAll("[^A-Za-z0-9._-]", "_");
                if (safe.length() > 80 || safe.startsWith(".")) safe = "lentera" + (safe.contains(".") ? safe.substring(safe.lastIndexOf('.')) : "");
                File dir = new File(getCacheDir(), "shared");
                if (!dir.exists() && !dir.mkdirs()) return;
                File f = new File(dir, safe);
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                if (bytes.length > 2_000_000) return;
                try (FileOutputStream out = new FileOutputStream(f)) { out.write(bytes); }
                Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".files", f);
                // A calendar file opens straight in the calendar app; anything else is shared.
                Intent i = "text/calendar".equals(mime)
                    ? new Intent(Intent.ACTION_VIEW).setDataAndType(uri, mime)
                    : new Intent(Intent.ACTION_SEND).setType(mime).putExtra(Intent.EXTRA_STREAM, uri);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(i, safe));
            } catch (Exception e) {
                Toast.makeText(this, e.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    @Override public void print(String title) {
        runOnUiThread(() -> {
            PrintManager pm = getSystemService(PrintManager.class);
            pm.print(title, web.createPrintDocumentAdapter(title), new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
        });
    }
}
