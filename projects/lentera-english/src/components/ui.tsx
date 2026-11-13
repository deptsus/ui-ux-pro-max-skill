'use client';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'accent';
const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand border-brand-strong hover:brightness-110',
  secondary: 'bg-surface text-ink border-line hover:bg-surface-2',
  ghost: 'bg-transparent text-brand border-transparent hover:bg-brand-soft',
  success: 'bg-ok text-on-brand border-ok hover:brightness-110',
  danger: 'bg-bad text-on-brand border-bad hover:brightness-110',
  accent: 'bg-accent text-[#1e1b3a] border-accent-strong hover:brightness-105',
};
const BASE = 'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition duration-150 border-2 border-b-4 active:border-b-2 active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none select-none';
const SIZE = { sm: 'px-3 py-1.5 text-sm min-h-9', md: 'px-5 py-2.5 text-base min-h-11', lg: 'px-6 py-3.5 text-lg min-h-13' };

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
  return <Tag className={cx('rounded-3xl border border-line bg-surface p-5 shadow-card', className)}>{children}</Tag>;
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
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progres'} className={cx('h-3 w-full overflow-hidden rounded-full bg-surface-2', className)}>
      <div className={cx('h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }} />
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

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <Card className="grid place-items-center gap-3 py-10 text-center">
      <p className="text-lg font-bold">{title}</p>
      {children && <div className="max-w-md text-muted">{children}</div>}
      {action}
    </Card>
  );
}

export function Notice({ tone = 'brand', title, children }: { tone?: keyof typeof TONE; title?: string; children: ReactNode }) {
  return (
    <div className={cx('rounded-2xl px-4 py-3 text-sm', TONE[tone])}>
      {title && <p className="font-bold">{title}</p>}
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
export const inputClass = 'w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none';

export const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');
export const dateId = (ms: number | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) => new Date(ms).toLocaleDateString('id-ID', opts);
export const dateTimeId = (ms: number | string) => new Date(ms).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
