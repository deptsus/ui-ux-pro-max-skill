// Shared helpers for the end-to-end suite: answers any exercise type through
// the real UI, using the published content pack as the answer key.
import { createRequire } from 'node:module';
// Playwright is provided by the environment (global install), not by npm.
export const { chromium, devices } = createRequire(import.meta.url)('playwright');
export const BASE = process.env.E2E_BASE ?? 'http://localhost:3100';

export async function fetchPack(page, token) {
  return page.evaluate(async (t) => (await (await fetch('/api/content', { headers: t ? { Authorization: `Bearer ${t}` } : {} })).json()).pack, token ?? null);
}

const strip = (w) => w.replace(/[.,!?;:"]/g, '');

/** Answers the exercise currently on screen. Returns its id. */
export async function answerCurrent(page, pack, correct = true) {
  const card = page.locator('[data-ex]');
  await card.waitFor({ timeout: 15000 });
  const id = await card.getAttribute('data-ex');
  let ex = pack.exercises.find((e) => e.id === id);
  if (!ex && id.startsWith('vocab:')) ex = { id, type: 'vocab', vocab: pack.vocabulary.find((v) => `vocab:${v.id}` === id) };
  if (!ex) throw new Error(`exercise ${id} not in pack`);
  const group = card.getByRole('radiogroup');

  if (ex.vocab) {
    const v = ex.vocab;
    const texts = await group.getByRole('radio').allTextContents();
    const right = texts.find((t) => t === v.meaning || t === v.word);
    const pick = correct ? right : texts.find((t) => t !== right);
    await group.getByRole('radio', { name: pick, exact: true }).click();
  } else if (ex.options) {
    const opt = correct ? ex.options.find((o) => o.correct) : ex.options.find((o) => !o.correct);
    await group.getByRole('radio', { name: opt.text, exact: true }).click();
  } else if (['fill', 'construct', 'translate', 'fix'].includes(ex.type)) {
    await card.getByLabel('Jawabanmu').fill(correct ? ex.answers[0] : Object.keys(ex.errors ?? {})[0] ?? 'zzz');
  } else if (ex.type === 'arrange') {
    const words = correct ? ex.answers[0].split(' ') : ex.answers[0].split(' ').reverse();
    // Only tiles still in the pool: the drop zone ("Kalimatmu") holds the same words once placed,
    // and a sentence can use a word twice ("going to come to").
    for (const w of words) await card.locator('div.flex.flex-wrap.gap-2:not([aria-label]) > button:enabled', { hasText: new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click();
  } else if (ex.type === 'match') {
    if (!correct) {
      await card.getByRole('button', { name: ex.pairs[0][0], exact: true }).click();
      await card.getByRole('button', { name: ex.pairs[1][1], exact: true }).click();
    }
    // Two pairs can share an answer ("I → was", "It → was"): take the first one still open.
    for (const [l, r] of ex.pairs) {
      await card.getByRole('button', { name: l, exact: true, disabled: false }).first().click();
      await card.getByRole('button', { name: r, exact: true, disabled: false }).first().click();
    }
  } else if (ex.type === 'spot') {
    const words = ex.text.split(' ');
    const idx = correct ? words.findIndex((w) => strip(w) === ex.wrongWord) : words.findIndex((w) => strip(w) !== ex.wrongWord);
    await card.locator('div.flex.flex-wrap.gap-2 > button').nth(idx).click();
  } else if (ex.type === 'para') {
    const order = correct ? ex.sentences : [...ex.sentences].reverse();
    for (const s of order) await card.getByRole('button', { name: s }).click();
  } else {
    throw new Error(`unsupported type ${ex.type}`);
  }
  return id;
}

/** Plays a whole session. `plan(i, id)` decides right/wrong per question. */
export async function runSession(page, pack, { plan = () => true, deferred = false } = {}) {
  const seen = [];
  for (let i = 0; i < 60; i++) {
    const card = page.locator('[data-ex]');
    const done = await Promise.race([card.waitFor({ timeout: 8000 }).then(() => false), page.getByRole('heading', { name: /Pembahasan/ }).waitFor({ timeout: 8000 }).then(() => true)]).catch(() => true);
    if (done) break;
    const before = await card.getAttribute('data-ex');
    const correct = plan(i, before);
    await answerCurrent(page, pack, correct);
    seen.push({ id: before, correct });
    await page.getByRole('button', { name: deferred ? 'Jawab' : 'Periksa', exact: true }).click();
    if (!deferred) {
      await page.getByText(correct ? 'Benar!' : 'Belum tepat', { exact: true }).waitFor({ timeout: 5000 });
      const end = page.getByRole('button', { name: /Nyawa habis/ });
      if (await end.count()) { await end.click(); break; }
      await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
    }
    await page.waitForFunction((prev) => { const el = document.querySelector('[data-ex]'); return !el || el.getAttribute('data-ex') !== prev || !document.querySelector('[role=status]'); }, before, { timeout: 5000 }).catch(() => {});
  }
  return seen;
}

export function check(name, cond, detail = '') {
  const ok = !!cond;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : ` — ${detail}`}`);
  if (!ok) process.exitCode = 1;
  return ok;
}
