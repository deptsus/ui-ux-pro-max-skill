// Parents (Rilis 10, migration 0015). A child makes a one-time code (valid 7
// days) in their profile; a parent who enters it sees the child's progress.
// Either side can end the link.
//   GET → { children: [...], parents: [...] }  (children = whom I watch; parents = who watches me)
//   POST { action: 'code' }           → child: new code
//   POST { action: 'link', code }     → parent: link with the child's code
//   POST { action: 'unlink', id }     → either side: remove the link with that person
import { HttpError, json, readJson, requireUser, route } from '@/lib/server/api';
import { classError, cleanCode, isUuid, limitCodeGuesses } from '@/lib/server/classes';
import { notReady } from '@/lib/server/habits';
import { rateLimit } from '@/lib/server/security';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  const [children, parents] = await Promise.all([
    db.rpc('parent_overview', { p_parent: userId }).catch(notReady),
    db.rpc('my_parents', { p_child: userId }).catch(notReady),
  ]);
  return json({ children, parents });
});

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  await rateLimit(db, 'parent', userId, 30, 3600);
  const b = await readJson<{ action?: string; code?: unknown; id?: unknown }>(req, 1000);
  switch (b.action) {
    case 'code':
      return json(await db.rpc('parent_code', { p_child: userId }).catch(notReady));
    case 'link': {
      const code = cleanCode(b.code, 8);
      if (code.length !== 8) throw new HttpError(400, 'Kode dari anak terdiri dari 8 huruf dan angka.');
      await rateLimit(db, 'parent-code', userId, 10, 3600);
      await limitCodeGuesses(db, req);
      const r = await db.rpc<{ error?: string; name: string }>('link_parent', { p_parent: userId, p_code: code }).catch(notReady);
      classError(r);
      return json({ message: `Terhubung dengan ${r.name}. Progresnya tampil di bawah.` });
    }
    case 'unlink':
      if (!isUuid(b.id)) throw new HttpError(400, 'Akun tidak dikenal.');
      await db.rpc('unlink_parent', { p_user: userId, p_other: b.id }).catch(notReady);
      return json({ message: 'Tautan dihapus.' });
    default:
      throw new HttpError(400, 'Aksi tidak dikenal.');
  }
});
