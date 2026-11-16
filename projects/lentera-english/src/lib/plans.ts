// Display copy for plans. Prices shown here are informational; the amount
// actually charged always comes from the subscription_plans table.
export const BENCHMARK_MONTHLY = 195_000;
// Yearly (owner decision, 16 Nov 2026): Rp702.000 shown struck through, 20% off, Rp561.600 charged.
// Must match subscription_plans (checked in tests/db.test.ts).
export const PLANS = {
  premium_monthly: { id: 'premium_monthly', name: 'Premium Bulanan', price: 58_500, listPrice: null, discountPct: 0, days: 30, note: 'Aktif 30 hari sejak pembayaran dikonfirmasi' },
  premium_yearly: { id: 'premium_yearly', name: 'Premium Tahunan', price: 561_600, listPrice: 702_000, discountPct: 20, days: 365, note: 'Aktif 365 hari · setara ±Rp46.800 per bulan' },
} as const;
export type PlanId = keyof typeof PLANS;

export const FREE_FEATURES = ['Pelajaran pengantar A1 (2 bab)', 'Aktivitas belajar harian dan misi', 'Kosakata dan tata bahasa dasar', 'Latihan harian terbatas (5 nyawa, 10 ulangan per hari)', 'Latihan shadowing level A1', 'Liga mingguan, teman, dan tantangan XP', 'Pengingat belajar harian di HP', 'Pelacakan progres dasar', 'Rencana belajar mingguan dari materi gratis'];
export const PREMIUM_FEATURES = ['Seluruh kurikulum CEFR A1 sampai C2', 'Rencana belajar mingguan sampai C2', 'Latihan tanpa batas nyawa', 'Ujian level CEFR', 'Seluruh pustaka PR', 'Analitik belajar lengkap', 'Seluruh pustaka kosakata', 'Ulangan terjadwal tanpa batas', 'Semua skenario percakapan', 'Unduh pelajaran dan belajar offline', 'Latihan shadowing A1 sampai C2', 'Tanpa iklan dan tanpa banner promosi'];
// Xendit channels, used only when PAYMENT_PROVIDER=xendit. The default is the owner's own QRIS.
export const CHANNELS = [
  { id: 'QRIS', name: 'QRIS', desc: 'Pindai dengan aplikasi bank atau e-wallet apa pun' },
  { id: 'DANA', name: 'DANA', desc: 'Bayar dari saldo DANA' },
  { id: 'GOPAY', name: 'GoPay', desc: 'Bayar di aplikasi GoPay' },
] as const;
