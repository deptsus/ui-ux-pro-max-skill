// "Hubungi kami" (Rilis 9): questions, privacy requests (such as deleting
// data) and bug reports, read by the owner in /admin. Rate-limited per
// address; a hidden field catches simple bots.
import { HttpError, json, readJson, requireDb, route } from '@/lib/server/api';
import { userIdFromRequest } from '@/lib/server/auth';
import { notifyAdmins } from '@/lib/server/push';
import { clientIp, rateLimit } from '@/lib/server/security';
import { CONTACT_TOPICS, isContactTopic } from '@/lib/contact';

export const dynamic = 'force-dynamic';

interface Body { topic?: unknown; name?: unknown; contact?: unknown; message?: unknown; website?: unknown }

export const POST = route(async (req) => {
  const db = await requireDb();
  const b = await readJson<Body>(req, 8000);
  // Bots fill every field; people never see this one.
  if (typeof b.website === 'string' && b.website.trim()) return json({ ok: true });
  await rateLimit(db, 'contact', clientIp(req), 5, 3600);
  const topic = isContactTopic(b.topic) ? b.topic : '';
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const contact = typeof b.contact === 'string' ? b.contact.trim() : '';
  const message = typeof b.message === 'string' ? b.message.trim() : '';
  if (!topic) throw new HttpError(400, 'Pilih topik pesan.');
  if (!name || name.length > 80) throw new HttpError(400, 'Tulis namamu (maksimal 80 karakter).');
  if (contact.length > 120) throw new HttpError(400, 'Kontak terlalu panjang.');
  if (message.length < 5 || message.length > 3000) throw new HttpError(400, 'Tulis pesan 5–3000 karakter.');
  const userId = await userIdFromRequest(req).catch(() => null);
  await db.rpc('submit_contact', { p_topic: topic, p_name: name, p_contact: contact, p_message: message, p_user: userId });
  await notifyAdmins(db, { title: `Pesan baru: ${CONTACT_TOPICS[topic as keyof typeof CONTACT_TOPICS]}`, body: `${name}: ${message.slice(0, 120)}`, url: '/admin?tab=health', tag: 'lentera-contact' }, { origin: new URL(req.url).origin, timeoutMs: 4000 }).catch(() => undefined);
  return json({ ok: true });
});
