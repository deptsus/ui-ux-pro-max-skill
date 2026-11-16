package id.lenteraenglish.app;

import android.content.Context;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * The phone's own speech engine. Android's WebView has no speechSynthesis, so
 * the site asks the app to read English text (US or UK accent) and is told
 * when it finished, exactly like the browser voice it uses elsewhere.
 */
final class Speech {
    interface Done { void done(String id, boolean ok); }

    private final TextToSpeech tts;
    private final Done done;
    private boolean ready;
    private boolean failed;
    private final List<String[]> waiting = new ArrayList<>();

    Speech(Context c, Done done) {
        this.done = done;
        tts = new TextToSpeech(c.getApplicationContext(), status -> {
            ready = status == TextToSpeech.SUCCESS;
            failed = !ready;
            for (String[] w : waiting) speak(w[0], w[1], w[2], "1".equals(w[3]));
            waiting.clear();
        });
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) {}
            @Override public void onDone(String id) { done.done(id, true); }
            @Override public void onError(String id) { done.done(id, false); }
            @Override public void onStop(String id, boolean interrupted) { done.done(id, true); }
        });
    }

    boolean available() { return !failed; }

    void speak(String id, String text, String lang, boolean slow) {
        if (failed) { done.done(id, false); return; }
        if (!ready) { waiting.add(new String[] {id, text, lang, slow ? "1" : "0"}); return; }
        Locale want = "en-GB".equals(lang) ? Locale.UK : Locale.US;
        int r = tts.setLanguage(want);
        if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) r = tts.setLanguage(Locale.ENGLISH);
        if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) { done.done(id, false); return; }
        tts.setSpeechRate(slow ? 0.6f : 0.95f);
        Bundle params = new Bundle();
        if (tts.speak(text.length() > 3000 ? text.substring(0, 3000) : text, TextToSpeech.QUEUE_FLUSH, params, id) != TextToSpeech.SUCCESS) done.done(id, false);
    }

    void stop() { if (ready) tts.stop(); }

    void shutdown() { tts.shutdown(); }
}
