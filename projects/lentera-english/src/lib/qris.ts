// QRIS payloads (EMVCo merchant-presented QR, Bank Indonesia profile).
// Payments are made to the owner's own QRIS: one QR per plan, each with the
// plan price embedded (tag 54). This module reads such a payload so the
// server can refuse a QR whose amount, currency or checksum is wrong.
// No 'use client': used by the server and by the checkout page.

export interface QrisField {
  tag: string;
  value: string;
}

export interface QrisInfo {
  /** "12" = dynamic (amount fixed by the QR), "11" = static. */
  pointOfInitiation: string | null;
  amount: number | null;
  currency: string | null;
  country: string | null;
  merchantName: string | null;
  merchantCity: string | null;
  /** National Merchant ID, from the QRIS domestic template (tag 51). */
  nmid: string | null;
  crcValid: boolean;
}

/** Splits a TLV string (2-digit tag, 2-digit length, value). Throws on malformed input. */
export function parseTlv(payload: string): QrisField[] {
  const out: QrisField[] = [];
  let i = 0;
  while (i < payload.length) {
    const tag = payload.slice(i, i + 2);
    const len = Number(payload.slice(i + 2, i + 4));
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(payload.slice(i + 2, i + 4)) || i + 4 + len > payload.length) throw new Error('QRIS tidak valid: struktur data rusak.');
    out.push({ tag, value: payload.slice(i + 4, i + 4 + len) });
    i += 4 + len;
  }
  return out;
}

/** CRC-16/CCITT-FALSE over the payload up to and including "6304", as QRIS requires. */
export function crc16(input: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(input)) {
    crc ^= byte << 8;
    for (let k = 0; k < 8; k++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function readQris(payload: string): QrisInfo {
  const fields = parseTlv(payload.trim());
  const get = (tag: string) => fields.find((f) => f.tag === tag)?.value ?? null;
  const domestic = get('51');
  let nmid: string | null = null;
  if (domestic) {
    try {
      nmid = parseTlv(domestic).find((f) => f.tag === '02')?.value ?? null;
    } catch {
      nmid = null;
    }
  }
  const amount = get('54');
  const p = payload.trim();
  return {
    pointOfInitiation: get('01'),
    amount: amount !== null && /^\d+(\.\d{1,2})?$/.test(amount) ? Number(amount) : null,
    currency: get('53'),
    country: get('58'),
    merchantName: get('59'),
    merchantCity: get('60'),
    nmid,
    crcValid: get('63') !== null && p.endsWith(get('63')!) && crc16(p.slice(0, -4)) === p.slice(-4).toUpperCase(),
  };
}

/**
 * Problems that make a payload unusable for a plan that costs `price` rupiah.
 * Empty when the QR is a valid rupiah QRIS with exactly that amount embedded.
 */
export function qrisProblems(payload: string, price: number): string[] {
  let info: QrisInfo;
  try {
    info = readQris(payload);
  } catch (e) {
    return [(e as Error).message];
  }
  const out: string[] = [];
  if (!info.crcValid) out.push('Checksum QRIS tidak cocok: kode mungkin terpotong atau salah salin.');
  if (info.currency !== '360') out.push('Mata uang QRIS bukan rupiah.');
  if (info.country !== 'ID') out.push('QRIS bukan untuk Indonesia.');
  if (info.amount === null) out.push('QRIS ini tidak berisi nominal. Buat QRIS dengan nominal sesuai harga paket.');
  else if (info.amount !== price) out.push(`Nominal di QRIS (Rp${info.amount.toLocaleString('id-ID')}) berbeda dengan harga paket (Rp${price.toLocaleString('id-ID')}).`);
  return out;
}
