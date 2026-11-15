'use client';
// Voice recording for shadowing (Rilis 8). Everything stays on the device:
// the recording lives in memory as a blob URL and is gone when the page closes.
// Analysis is plain signal measurement (loudness over time), not speech
// recognition or AI scoring.

export const recordingSupported = () =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

export interface Recording { url: string; blob: Blob; ms: number }
export interface ActiveRecording { stop: () => Promise<Recording>; cancel: () => void }

type AC = typeof AudioContext;
const AudioCtx = (): AC | undefined => (typeof window === 'undefined' ? undefined : window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext);

/** Starts recording the microphone. `onLevel` gets the loudness (0–1) about 30 times a second. */
export async function startRecording(onLevel?: (level: number) => void): Promise<ActiveRecording> {
  if (!recordingSupported()) throw Object.assign(new Error('Browser ini tidak mendukung perekaman suara.'), { code: 'unsupported' });
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch {
    throw Object.assign(new Error('Izin mikrofon ditolak. Izinkan mikrofon untuk Lentera di pengaturan HP atau browser, lalu coba lagi.'), { code: 'denied' });
  }
  const chunks: Blob[] = [];
  const rec = new MediaRecorder(stream);
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const started = performance.now();
  let raf = 0;
  let ctx: AudioContext | undefined;
  const Ctx = AudioCtx();
  if (onLevel && Ctx) {
    ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      onLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4));
      raf = requestAnimationFrame(tick);
    };
    tick();
  }
  const cleanup = () => {
    cancelAnimationFrame(raf);
    void ctx?.close().catch(() => {});
    stream.getTracks().forEach((t) => t.stop());
  };
  rec.start();
  return {
    stop: () => new Promise<Recording>((resolve) => {
      const done = () => {
        cleanup();
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        resolve({ blob, url: URL.createObjectURL(blob), ms: performance.now() - started });
      };
      if (rec.state === 'inactive') done();
      else {
        rec.onstop = done;
        rec.stop();
      }
    }),
    cancel: () => {
      rec.onstop = null;
      if (rec.state !== 'inactive') rec.stop();
      cleanup();
    },
  };
}

export interface Shape {
  /** Loudness per slice, 0–1, for a small waveform picture. */
  peaks: number[];
  /** Time from the first to the last loud moment: the spoken part without silence around it. */
  voicedMs: number;
  totalMs: number;
}

/** Measures a recording (blob or URL): its loudness outline and how long the speech itself lasts. */
export async function analyse(source: Blob | string, slices = 48): Promise<Shape | null> {
  const Ctx = AudioCtx();
  if (!Ctx) return null;
  try {
    const data = typeof source === 'string' ? await (await fetch(source)).arrayBuffer() : await source.arrayBuffer();
    const ctx = new Ctx();
    const audio = await ctx.decodeAudioData(data);
    void ctx.close().catch(() => {});
    const pcm = audio.getChannelData(0);
    const frame = Math.max(1, Math.round(audio.sampleRate * 0.02));
    const rms: number[] = [];
    for (let i = 0; i < pcm.length; i += frame) {
      let sum = 0;
      const end = Math.min(pcm.length, i + frame);
      for (let j = i; j < end; j++) sum += pcm[j] * pcm[j];
      rms.push(Math.sqrt(sum / (end - i)));
    }
    const max = Math.max(...rms, 1e-6);
    const threshold = Math.max(0.01, max * 0.15);
    const first = rms.findIndex((v) => v >= threshold);
    const last = rms.length - 1 - [...rms].reverse().findIndex((v) => v >= threshold);
    const voicedMs = first < 0 ? 0 : (last - first + 1) * 20;
    // Waveform of the voiced part only, so model and learner line up.
    const span = first < 0 ? rms : rms.slice(first, last + 1);
    const per = span.length / slices;
    const peaks = Array.from({ length: slices }, (_, k) => {
      const part = span.slice(Math.floor(k * per), Math.max(Math.floor(k * per) + 1, Math.floor((k + 1) * per)));
      return part.length ? Math.max(...part) / max : 0;
    });
    return { peaks, voicedMs, totalMs: audio.duration * 1000 };
  } catch {
    return null;
  }
}

/** Plays a blob URL to the end; resolves when it ends (or fails). */
export function playUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const a = new Audio(url);
    a.onended = () => resolve();
    a.onerror = () => resolve();
    a.play().catch(() => resolve());
  });
}
