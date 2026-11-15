// Profile update (after Rilis 6): eight cartoon avatars (one in the owner's
// pink, #E89EB8), the new Lentera mark, and the avatar reaching the account
// profile so the leaderboard shows it.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AVATARS, Avatar, PINK, avatarOf } from '@/components/Avatar';
import { Logo, LogoMark } from '@/components/Mascot';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

describe('avatar karakter', () => {
  it('ada 8 karakter berbeda, masing-masing bernama dan berlabel', () => {
    expect(AVATARS).toHaveLength(8);
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(8);
    expect(new Set(AVATARS.map((a) => a.name)).size).toBe(8);
    for (const a of AVATARS) expect(a.label.length).toBeGreaterThan(3);
  });

  it('tepat satu karakter berwarna pink #E89EB8 (Momo si kelinci)', () => {
    const pink = AVATARS.map((_, i) => renderToStaticMarkup(h(Avatar, { index: i }))).filter((svg) => svg.toUpperCase().includes(PINK));
    expect(PINK).toBe('#E89EB8');
    expect(pink).toHaveLength(1);
    expect(pink[0]).toContain('data-avatar="momo"');
  });

  it('setiap nomor avatar lama (0–20) tetap menampilkan karakter yang sah', () => {
    for (let i = -2; i <= 20; i++) expect(AVATARS).toContain(avatarOf(i));
    expect(avatarOf(undefined).id).toBe('pijar');
  });

  it('avatar punya nama untuk pembaca layar, atau disembunyikan bila hanya hiasan', () => {
    expect(renderToStaticMarkup(h(Avatar, { index: 3 }))).toContain('aria-label="Avatar Momo, kelinci merah muda"');
    expect(renderToStaticMarkup(h(Avatar, { index: 3, decorative: true }))).toContain('aria-hidden="true"');
  });

  it('dua avatar di satu halaman tidak berbagi id potongan lingkaran', () => {
    const html = renderToStaticMarkup(h('div', null, h(Avatar, { index: 0 }), h(Avatar, { index: 1 })));
    const ids = [...html.matchAll(/clipPath id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('logo Lentera', () => {
  it('logo baru (balon percakapan dengan nyala) dan gradiennya unik per salinan', () => {
    const html = renderToStaticMarkup(h('div', null, h(LogoMark, {}), h(LogoMark, {})));
    const ids = [...html.matchAll(/linearGradient id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });
  it('nama "Lentera English" tetap ada, juga dalam bentuk ringkas untuk HP sempit', () => {
    const html = renderToStaticMarkup(h(Logo, { compact: true }));
    expect(html.replace(/<[^>]+>/g, '')).toContain('Lentera English');
    expect(html).toContain('sr-only');
  });
});

describe('avatar sampai ke papan peringkat', () => {
  let db: RawDb;
  beforeAll(async () => {
    db = await openEmbedded(undefined, path.resolve(__dirname, '..'));
  });
  afterAll(async () => {
    await db.close();
  });
  it('update_profile menyimpan nama dan avatar, dan papan peringkat memakainya', async () => {
    const u = await newUser(db, 'Siswa Avatar');
    const p = await db.rpc<{ display_name: string; avatar: number }>('update_profile', { p_user: u, p_patch: { display_name: 'Rina', avatar: 3 } });
    expect(p).toMatchObject({ display_name: 'Rina', avatar: 3 });
    await db.rpc('sync_learner', { p_user: u, p_events: [{ id: 'av1', kind: 'xp', at: Date.now(), data: { amount: 50, reason: 'lesson' } }], p_snapshot: null, p_client_updated_at: 1 });
    const board = await db.rpc<{ top: { name: string; avatar: number; me: boolean }[] }>('get_leaderboard', { p_user: u });
    expect(board.top.find((r) => r.me)).toMatchObject({ name: 'Rina', avatar: 3 });
  });
});
