// Display copy for plans. Prices shown here are informational; the amount
// actually charged always comes from the subscription_plans table.
export const BENCHMARK_MONTHLY = 195_000;
export const PLANS = {
  premium_monthly: { id: 'premium_monthly', name: 'Premium Bulanan', price: 58_500, days: 30, note: 'Aktif 30 hari sejak pembayaran berhasil' },
  premium_yearly: { id: 'premium_yearly', name: 'Premium Tahunan', price: 585_000, days: 365, note: 'Aktif 365 hari · setara Rp48.750 per bulan' },
} as const;
export type PlanId = keyof typeof PLANS;

export const FREE_FEATURES = ['Pelajaran pengantar A1 (2 bab)', 'Aktivitas belajar harian dan misi', 'Kosakata dan tata bahasa dasar', 'Latihan harian terbatas (5 nyawa, 10 ulangan per hari)', 'Pelacakan progres dasar'];
export const PREMIUM_FEATURES = ['Seluruh kurikulum CEFR A1 sampai C2', 'Latihan tanpa batas nyawa', 'Ujian level CEFR', 'Seluruh pustaka PR', 'Analitik belajar lengkap', 'Seluruh pustaka kosakata', 'Ulangan terjadwal tanpa batas', 'Semua skenario percakapan', 'Unduh pelajaran dan belajar offline', 'Tanpa iklan dan tanpa banner promosi'];
export const CHANNELS = [
  { id: 'QRIS', name: 'QRIS', desc: 'Pindai dengan aplikasi bank atau e-wallet apa pun' },
  { id: 'DANA', name: 'DANA', desc: 'Bayar dari saldo DANA' },
  { id: 'GOPAY', name: 'GoPay', desc: 'Bayar di aplikasi GoPay' },
] as const;
