// Formatter murni untuk locale Indonesia. Sengaja tanpa 'use client' agar bisa
// dipanggil dari server component maupun client component.

export const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

export const dateId = (
  ms: number | string,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
) => new Date(ms).toLocaleDateString('id-ID', opts);

export const dateTimeId = (ms: number | string) =>
  new Date(ms).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Angka ringkas untuk sumbu grafik: 585000 → "585rb", 1500000 → "1,5jt". */
export const compactId = (n: number) => {
  const cut = (v: number) => v.toLocaleString('id-ID', { maximumFractionDigits: 1 });
  if (Math.abs(n) >= 1e9) return cut(n / 1e9) + 'M';
  if (Math.abs(n) >= 1e6) return cut(n / 1e6) + 'jt';
  if (Math.abs(n) >= 1e3) return cut(n / 1e3) + 'rb';
  return String(n);
};
