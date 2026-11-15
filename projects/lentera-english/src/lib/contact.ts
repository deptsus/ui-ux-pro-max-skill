// Topics of the "Hubungi kami" form (Rilis 9), shared by the page and the API.
export const CONTACT_TOPICS: Record<'umum' | 'privasi' | 'sekolah' | 'bug', string> = {
  umum: 'Pertanyaan umum',
  privasi: 'Privasi dan data',
  sekolah: 'Sekolah dan guru',
  bug: 'Laporan masalah',
};
export type ContactTopic = keyof typeof CONTACT_TOPICS;
export const isContactTopic = (t: unknown): t is ContactTopic => typeof t === 'string' && t in CONTACT_TOPICS;
