'use client';
// Lentera UI kit (redesign 2026). Calm surfaces with thin borders, one primary action per screen,
// colour that always carries meaning, and 44 px touch targets. Tokens live in globals.css.
import Link from 'next/link';
import { useEffect, useId, useRef, useSyncExternalStore, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, Info, X, XCircle } from 'lucide-react';
import { Mascot, type Mood } from './Mascot';

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Tailwind orders utilities by name, not by where they appear, so a component's own class can
// beat the one passed in (`p-4` wins over `p-0`). `merge` drops the component's classes that the
// caller overrides: padding, border width/colour/style, background, radius, shadow, text colour.
const GROUP: [string, RegExp][] = [
  ['p', /^p-/], ['px', /^px-/], ['py', /^py-/], ['pt', /^pt-/], ['pb', /^pb-/], ['pl', /^pl-/], ['pr', /^pr-/],
  ['bw', /^border(-\d+|-\[[\d.]+px\])?$/], ['bs', /^border-(dashed|dotted|solid|none)$/],
  ['bc', /^border-(?![xytblr]-|[xytblr]$|\d|\[[\d.]+px\]|dashed|dotted|solid|none)/],
  ['bg', /^bg-(?!clip|origin|fixed|local|scroll|repeat|no-repeat|cover|contain|center|gradient|linear|radial|none|blend)/],
  ['rounded', /^rounded(-(none|sm|md|lg|xl|2xl|3xl|full))?$/], ['shadow', /^shadow/],
  ['tc', /^text-(brand|ink|muted|bad|ok|accent|warn|on-|bg|white|surface|line)/],
];
const COVERS: Record<string, string[]> = { p: ['p', 'px', 'py', 'pt', 'pb', 'pl', 'pr'], px: ['px', 'pl', 'pr'], py: ['py', 'pt', 'pb'] };
const groupOf = (c: string) => GROUP.find(([, re]) => re.test(c))?.[0];
export function merge(base: string, extra?: string | false | null) {
  if (!extra) return base;
  const over = new Set<string>();
  for (const c of extra.split(/\s+/)) {
    if (!c || c.includes(':')) continue;
    const g = groupOf(c);
    if (g) (COVERS[g] ?? [g]).forEach((x) => over.add(x));
  }
  if (!over.size) return `${base} ${extra}`;
  const kept = base.split(/\s+/).filter((c) => {
    const bare = c.slice(c.lastIndexOf(':') + 1);
    if (c.includes(':') && !/^(sm|md|lg|xl):/.test(c)) return true; // keep dark:, hover:, active: … states
    const g = groupOf(bare);
    return !g || !over.has(g);
  });
  return `${kept.join(' ')} ${extra}`;
}

const INK = '#17162b';
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
/** White or dark text, whichever reads better on this #rrggbb color (Rilis 6 contrast audit). */
export const textOn = (bg: string) => ((1.05) / (lum(bg) + 0.05) >= (lum(bg) + 0.05) / (lum(INK) + 0.05) ? '#ffffff' : INK);

/** A character's name: neutral chip with a dot in their shirt color, readable in both themes. */
export function NameChip({ name, color, className }: { name: string; color: string; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-ink', className)}><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />{name}</span>;
}

// ---------------------------------------------------------------------------------------------
// Buttons. Solid buttons keep a soft 2 px ledge in a darker shade and sink when pressed
// (the tactile touch kept from Rilis 14); outline and text buttons stay flat.
type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'accent';
const LEDGE = 'shadow-[0_2px_0_var(--edge)] active:translate-y-[2px] active:shadow-none';
const VARIANT: Record<Variant, string> = {
  primary: `bg-brand text-on-brand hover:brightness-110 [--edge:var(--brand-strong)] ${LEDGE}`,
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-2 active:bg-surface-2',
  ghost: 'bg-transparent text-brand hover:bg-brand-soft active:bg-brand-soft',
  success: `bg-ok text-on-brand hover:brightness-110 [--edge:rgb(0_0_0/0.22)] ${LEDGE}`,
  danger: `bg-bad text-on-brand hover:brightness-110 [--edge:rgb(0_0_0/0.22)] ${LEDGE}`,
  accent: `bg-accent text-on-accent hover:brightness-105 [--edge:rgb(0_0_0/0.18)] ${LEDGE}`,
};
const BASE = 'inline-flex items-center justify-center gap-2 rounded-xl text-center font-bold leading-tight transition-[transform,box-shadow,filter,background-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 select-none';
const SIZE = { sm: 'min-h-11 px-4 py-2 text-sm', md: 'min-h-11 px-5 py-2.5 text-base', lg: 'min-h-13 px-6 py-3 text-lg' };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZE;
  full?: boolean;
  /** Shows a spinner and blocks the button; the label stays so its size never jumps. */
  busy?: boolean;
}
export function Button({ variant = 'primary', size = 'md', full, busy, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button {...rest} disabled={disabled || busy} aria-busy={busy || undefined} className={merge(cx(BASE, VARIANT[variant], SIZE[size], full && 'w-full'), className)}>
      {busy && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
      {children}
    </button>
  );
}
export function LinkButton({ href, variant = 'primary', size = 'md', full, className, children }: { href: string; variant?: Variant; size?: keyof typeof SIZE; full?: boolean; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={merge(cx(BASE, VARIANT[variant], SIZE[size], full && 'w-full'), className)}>
      {children}
    </Link>
  );
}
/** Icon-only button: 44×44 target, the label is required and is its accessible name. */
export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} {...rest} className={cx('inline-grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2 disabled:opacity-50', className)}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------------------------
// Surfaces. A Card groups related content; it is never placed inside another Card.
export function Card({ className, children, as: Tag = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <Tag className={merge('rounded-2xl border border-line bg-surface p-4 sm:p-5', className)}>{children}</Tag>;
}

const TONE = {
  brand: 'bg-brand-soft text-brand-ink',
  accent: 'bg-accent-soft text-accent-strong',
  warn: 'bg-warn-soft text-warn',
  ok: 'bg-ok-soft text-ok',
  bad: 'bg-bad-soft text-bad',
  muted: 'bg-surface-2 text-muted',
};
export type Tone = keyof typeof TONE;
export function Badge({ tone = 'brand', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={merge(cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold', TONE[tone]), className)}>{children}</span>;
}

export function Progress({ value, max = 100, tone = 'brand', label, className }: { value: number; max?: number; tone?: 'brand' | 'accent' | 'ok'; label?: string; className?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = tone === 'accent' ? 'bg-accent' : tone === 'ok' ? 'bg-ok' : 'bg-brand';
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progres'} className={cx('h-2 w-full overflow-hidden rounded-full bg-surface-2 dark:bg-line', className)}>
      <div className={cx('h-full rounded-full transition-[width] duration-500 ease-out', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({ value, size = 96, stroke = 10, tone = 'brand', children }: { value: number; size?: number; stroke?: number; tone?: 'brand' | 'accent' | 'ok' | 'bad'; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const color = { brand: 'var(--brand)', accent: 'var(--accent)', ok: 'var(--ok)', bad: 'var(--bad)' }[tone];
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Page structure.
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/** A section title (h2 by default) with an optional link or button on the right. */
export function SectionHeader({ title, id, action, as: Tag = 'h2', className }: { title: ReactNode; id?: string; action?: ReactNode; as?: 'h2' | 'h3'; className?: string }) {
  return (
    <div className={cx('mb-3 flex items-end justify-between gap-3', className)}>
      <Tag id={id} className={Tag === 'h2' ? 'text-xl font-extrabold' : 'text-lg font-extrabold'}>{title}</Tag>
      {action}
    </div>
  );
}

/** `page`: the Empty is the whole page (no PageHeader), so its title is the page's h1. `mood`: Pijar's face (Rilis 14). */
export function Empty({ title, children, action, page, mood = 'think' }: { title: string; children?: ReactNode; action?: ReactNode; page?: boolean; mood?: Mood }) {
  return (
    <Card className="grid place-items-center gap-3 px-5 py-10 text-center">
      <Mascot mood={mood} size={72} decorative />
      {page ? <h1 className="text-xl font-extrabold">{title}</h1> : <p className="text-lg font-extrabold">{title}</p>}
      {children && <div className="max-w-md text-muted">{children}</div>}
      {action}
    </Card>
  );
}

const NOTICE_ICON = { brand: Info, accent: AlertTriangle, warn: AlertTriangle, ok: CheckCircle2, bad: XCircle, muted: Info };
export function Notice({ tone = 'brand', title, children, className }: { tone?: Tone; title?: string; children: ReactNode; className?: string }) {
  const Icon = NOTICE_ICON[tone];
  return (
    <div className={merge(cx('flex gap-3 rounded-xl px-4 py-3 text-sm', TONE[tone]), className)}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="text-base font-bold">{title}</p>}
        <div className={tone === 'muted' ? '' : 'text-ink'}>{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Lists: collections are rows in one group, not a stack of cards.
export function ListGroup({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return <ul aria-label={label} className={merge('divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface', className)}>{children}</ul>;
}

const ICON_TONE = { brand: 'bg-brand-soft text-brand', accent: 'bg-accent-soft text-accent-strong', warn: 'bg-warn-soft text-warn', ok: 'bg-ok-soft text-ok', bad: 'bg-bad-soft text-bad', muted: 'bg-surface-2 text-muted' };
interface RowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  iconTone?: Tone;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Shows a chevron (default for links). */
  chevron?: boolean;
  disabled?: boolean;
  className?: string;
  lang?: string;
}
export function ListRow({ title, subtitle, icon, iconTone = 'brand', trailing, href, onClick, chevron, disabled, className, lang }: RowProps) {
  const body = (
    <>
      {icon && <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', ICON_TONE[iconTone])} aria-hidden>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span lang={lang} className="block font-bold leading-snug text-ink">{title}</span>
        {subtitle && <span className="mt-0.5 block text-sm text-muted">{subtitle}</span>}
      </span>
      {trailing}
      {(chevron ?? !!href) && <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />}
    </>
  );
  const row = 'flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left';
  const live = 'transition-colors hover:bg-surface-2 active:bg-surface-2 focus-visible:-outline-offset-4';
  return (
    <li className={className}>
      {href && !disabled ? <Link href={href} className={cx(row, live)}>{body}</Link>
        : onClick ? <button type="button" onClick={onClick} disabled={disabled} className={cx(row, live, 'disabled:opacity-60')}>{body}</button>
        : <div className={cx(row, disabled && 'opacity-70')} aria-disabled={disabled || undefined}>{body}</div>}
    </li>
  );
}

// ---------------------------------------------------------------------------------------------
// Segmented control: a small set of mutually exclusive options. Toggle buttons (aria-pressed) by
// default; `radio` makes it a radio group (arrow keys move the choice, one tab stop) for settings.
export function Segmented<T extends string>({ options, value, onChange, label, labelledBy, radio, full, className }: { options: { value: T; label: ReactNode; icon?: ReactNode }[]; value: T; onChange: (v: T) => void; label?: string; labelledBy?: string; radio?: boolean; full?: boolean; className?: string }) {
  const move = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (!radio) return;
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    onChange(options[n].value);
    (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
  };
  return (
    <div role={radio ? 'radiogroup' : 'group'} aria-label={labelledBy ? undefined : label} aria-labelledby={labelledBy} className={merge(cx('flex gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1 dark:bg-line/60', full ? 'w-full' : 'inline-flex max-w-full'), className)}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} onKeyDown={(e) => move(e, i)}
            {...(radio ? { role: 'radio', 'aria-checked': on, tabIndex: on ? 0 : -1 } : { 'aria-pressed': on })}
            className={cx('inline-flex min-h-11 min-w-11 flex-1 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-center text-sm font-bold leading-tight transition-[color,background-color,transform] duration-150 active:scale-[0.97]', on ? 'bg-surface text-ink shadow-e1 ring-1 ring-line dark:bg-surface-2' : 'text-muted hover:text-ink')}>
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Links that switch between sibling pages (e.g. CEFR | Sekolah | Khusus); the current one has aria-current. */
export function TabLinks({ items, label, className }: { items: { href: string; label: ReactNode; current: boolean }[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cx('flex gap-1 rounded-xl bg-surface-2 p-1 dark:bg-line/60', className)}>
      {items.map((t) => (
        <Link key={t.href} href={t.href} aria-current={t.current ? 'page' : undefined}
          className={cx('inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 text-sm font-bold transition-[color,background-color,transform] duration-150 active:scale-[0.97]', t.current ? 'bg-surface text-ink shadow-e1 ring-1 ring-line' : 'text-muted hover:text-ink')}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------------------------
// Stats: one bordered group with hairline dividers, not one card per number.
export function StatRow({ items, className }: { items: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }[]; className?: string }) {
  const cols = items.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <dl className={cx('grid gap-px overflow-hidden rounded-2xl border border-line bg-line', cols, className)}>
      {items.map((s) => (
        <div key={s.label} className="min-w-0 bg-surface px-3 py-3">
          <dt className="flex items-center gap-1.5 text-xs font-bold text-muted">{s.icon}{s.label}</dt>
          <dd className="mt-0.5 text-xl font-extrabold tabular-nums">{s.value}</dd>
          {s.hint && <dd className="text-xs text-muted">{s.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------------------------
// Loading: placeholders with fixed sizes so nothing jumps when data arrives.
export function Skeleton({ className }: { className?: string }) {
  return <span className={cx('block animate-shimmer rounded-lg bg-surface-2 dark:bg-line/70', className)} aria-hidden />;
}
export function Loading({ label = 'Memuat…', lines = 3, className }: { label?: string; lines?: number; className?: string }) {
  return (
    <div role="status" className={cx('space-y-3', className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} className={cx('h-14 rounded-2xl', i === lines - 1 && lines > 1 && 'w-2/3')} />)}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Sheet: a bottom sheet on phones and a centred dialog on wider screens (native <dialog>:
// focus is trapped, Esc closes, the page behind is inert).
export function Sheet({ open, onClose, title, children, footer, className }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    // Clicking the backdrop (the dialog element itself, outside the panel) closes it; Esc is native.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog ref={ref} className="sheet" aria-labelledby={id} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className={cx('max-h-[inherit] overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-e2 sm:rounded-3xl', className)}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={id} className="pt-2 text-xl font-extrabold">{title}</h2>
          <IconButton label="Tutup" onClick={onClose} className="-mr-2"><X size={20} aria-hidden /></IconButton>
        </div>
        {children}
        {footer && <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </dialog>
  );
}

/** Confirmation before a destructive or costly action. */
export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel = 'Batal', tone = 'danger', busy, onConfirm, onCancel }: { open: boolean; title: string; children: ReactNode; confirmLabel: string; cancelLabel?: string; tone?: 'danger' | 'primary'; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}
      footer={<><Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button><Button variant={tone} busy={busy} onClick={onConfirm}>{confirmLabel}</Button></>}>
      <div className="text-muted">{children}</div>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------------------------
// Toasts: short confirmations ("Tersimpan"). They sit above the bottom nav and never cover the
// main action; screen readers hear them through the polite live region.
type ToastItem = { id: number; text: string; tone: 'ok' | 'bad' | 'brand' };
let toasts: ToastItem[] = [];
let toastSeq = 0;
const toastListeners = new Set<() => void>();
const emitToasts = () => toastListeners.forEach((l) => l());
export function toast(text: string, tone: ToastItem['tone'] = 'ok') {
  const id = ++toastSeq;
  toasts = [...toasts.slice(-2), { id, text, tone }];
  emitToasts();
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); emitToasts(); }, 4000);
}
const NO_TOASTS: ToastItem[] = [];
export function Toaster() {
  const list = useSyncExternalStore((l) => { toastListeners.add(l); return () => { toastListeners.delete(l); }; }, () => toasts, () => NO_TOASTS);
  const Icon = { ok: CheckCircle2, bad: XCircle, brand: Info };
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav)+env(safe-area-inset-bottom)+0.75rem)] z-50 flex flex-col items-center gap-2 px-4">
      {list.map((t) => {
        const I = Icon[t.tone];
        return (
          <div key={t.id} className="toast-in pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-bg shadow-e2">
            <I size={18} className={cx('shrink-0', t.tone === 'bad' ? 'text-bad-soft' : 'text-bg')} aria-hidden />
            <span className="flex-1">{t.text}</span>
            <button type="button" className="-my-2 -mr-2 grid h-10 w-10 place-items-center rounded-full opacity-80 hover:opacity-100" aria-label="Tutup pemberitahuan" onClick={() => { toasts = toasts.filter((x) => x.id !== t.id); emitToasts(); }}><X size={16} aria-hidden /></button>
          </div>
        );
      })}
    </div>
  );
}

/** The main action of a screen, pinned above the bottom nav (and the home indicator) on phones. */
export function StickyActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('sticky bottom-[calc(var(--bottom-nav)+env(safe-area-inset-bottom))] z-10 -mx-4 mt-6 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:mx-0 lg:rounded-2xl lg:border', className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Forms.
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {error ? <span className="mt-1.5 flex items-center gap-1 text-sm font-bold text-bad"><XCircle size={14} aria-hidden />{error}</span>
        : hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
export const inputClass = 'min-h-12 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/25 disabled:opacity-60 aria-[invalid=true]:border-bad';

// Formatter tinggal di '@/lib/format' (tanpa 'use client'); diekspor ulang agar impor lama tetap jalan.
export { rupiah, dateId, dateTimeId } from '@/lib/format';
