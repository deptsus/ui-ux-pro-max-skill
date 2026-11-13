// Formatter murni untuk locale Indonesia. Sengaja tanpa 'use client' agar bisa
// dipanggil dari server component maupun client component.

export const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

export const dateId = (
  ms: number | string,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
) => new Date(ms).toLocaleDateString('id-ID', opts);

export const dateTimeId = (ms: number | string) =>
  new Date(ms).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
