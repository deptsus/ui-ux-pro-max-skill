'use client';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Mascot, type Mood } from './Mascot';

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
/** White or dark text, whichever reads better on this #rrggbb color (Rilis 6 contrast audit). */
export const textOn = (bg: string) => ((1.05) / (lum(bg) + 0.05) >= (lum(bg) + 0.05) / (lum('#1e1b3a') + 0.05) ? '#ffffff' : '#1e1b3a');

/** A character's name: neutral chip with a dot in their shirt color, readable in both themes. */
export function NameChip({ name, color, className }: { name: string; color: string; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-extrabold text-ink', className)}><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />{name}</span>;
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'accent';
// Clay buttons (Rilis 14): thick outline and a ledge that the button presses into.
const CLAY = 'border-[2.5px] border-outline shadow-[0_4px_0_var(--outline)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--outline)]';
const VARIANT: Record<Variant, string> = {
  primary: `bg-brand text-on-brand hover:brightness-110 ${CLAY}`,
  secondary: `bg-surface text-ink hover:bg-surface-2 ${CLAY}`,
  ghost: 'bg-transparent text-brand border-2 border-transparent hover:bg-brand-soft',
  success: `bg-ok text-on-brand hover:brightness-110 ${CLAY}`,
  danger: `bg-bad text-on-brand hover:brightness-110 ${CLAY}`,
  accent: `bg-accent text-[#1e1b3a] hover:brightness-105 ${CLAY}`,
};
const BASE = 'inline-flex items-center justify-center gap-2 rounded-2xl font-display font-bold tracking-wide transition-[transform,box-shadow,filter,background-color] duration-100 disabled:opacity-50 disabled:pointer-events-none select-none';
const SIZE = { sm: 'px-3 py-1.5 text-sm min-h-11', md: 'px-5 py-2.5 text-base min-h-11', lg: 'px-6 py-3.5 text-lg min-h-13' };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZE;
  full?: boolean;
}
export function Button({ variant = 'primary', size = 'md', full, className, ...rest }: ButtonProps) {
  return <button {...rest} className={cx(BASE, VARIANT[variant], SIZE[size], full && 'w-full', className)} />;
}
export function LinkButton({ href, variant = 'primary', size = 'md', full, className, children }: { href: string; variant?: Variant; size?: keyof typeof SIZE; full?: boolean; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={cx(BASE, VARIANT[variant], SIZE[size], full && 'w-full', className)}>
      {children}
    </Link>
  );
}

export function Card({ className, children, as: Tag = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <Tag className={cx('rounded-3xl border-2 border-outline bg-surface p-5 shadow-[0_4px_0_var(--outline)]', className)}>{children}</Tag>;
}

const TONE = {
  brand: 'bg-brand-soft text-brand',
  accent: 'bg-accent-soft text-accent-strong',
  ok: 'bg-ok-soft text-ok',
  bad: 'bg-bad-soft text-bad',
  muted: 'bg-surface-2 text-muted',
};
export function Badge({ tone = 'brand', children, className }: { tone?: keyof typeof TONE; children: ReactNode; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold', TONE[tone], className)}>{children}</span>;
}

export function Progress({ value, max = 100, tone = 'brand', label, className }: { value: number; max?: number; tone?: 'brand' | 'accent' | 'ok'; label?: string; className?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = tone === 'accent' ? 'bg-accent' : tone === 'ok' ? 'bg-ok' : 'bg-brand';
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progres'} className={cx('h-4 w-full overflow-hidden rounded-full border-2 border-outline bg-surface-2', className)}>
      <div className={cx('relative h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }}>
        {pct > 6 && <span className="absolute inset-x-1.5 top-[2px] h-[3px] rounded-full bg-white/45" aria-hidden />}
      </div>
    </div>
  );
}

export function Ring({ value, size = 96, stroke = 10, tone = 'brand', children }: { value: number; size?: number; stroke?: number; tone?: 'brand' | 'accent' | 'ok' | 'bad'; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const color = { brand: 'var(--brand)', accent: 'var(--accent)', ok: 'var(--ok)', bad: 'var(--bad)' }[tone];
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/** `page`: the Empty is the whole page (no PageHeader), so its title is the page's h1. `mood`: Pijar's face (Rilis 14). */
export function Empty({ title, children, action, page, mood = 'think' }: { title: string; children?: ReactNode; action?: ReactNode; page?: boolean; mood?: Mood }) {
  return (
    <Card className="grid place-items-center gap-3 py-10 text-center">
      <Mascot mood={mood} size={80} decorative />
      {page ? <h1 className="text-xl font-bold">{title}</h1> : <p className="font-display text-xl font-bold">{title}</p>}
      {children && <div className="max-w-md text-muted">{children}</div>}
      {action}
    </Card>
  );
}

export function Notice({ tone = 'brand', title, children }: { tone?: keyof typeof TONE; title?: string; children: ReactNode }) {
  return (
    <div className={cx('rounded-2xl px-4 py-3 text-sm', TONE[tone])}>
      {title && <p className="font-display text-base font-bold">{title}</p>}
      <div className={tone === 'muted' ? '' : 'text-ink'}>{children}</div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
export const inputClass = 'w-full rounded-2xl border-2 border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none';

// Formatter tinggal di '@/lib/format' (tanpa 'use client'); diekspor ulang agar impor lama tetap jalan.
export { rupiah, dateId, dateTimeId } from '@/lib/format';
