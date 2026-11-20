import { describe, expect, it } from 'vitest';
import { merge } from '@/components/ui';
describe('merge', () => {
  const card = 'rounded-2xl border border-line bg-surface p-4 sm:p-5';
  it('padding override drops base and responsive padding', () => expect(merge(card, 'p-0')).toBe('rounded-2xl border border-line bg-surface p-0'));
  it('border colour override', () => expect(merge(card, 'border-brand/40 shadow-e1')).toBe('rounded-2xl border bg-surface p-4 sm:p-5 border-brand/40 shadow-e1'));
  it('border width override keeps colour', () => expect(merge(card, 'border-2 border-dashed')).toBe('rounded-2xl border-line bg-surface p-4 sm:p-5 border-2 border-dashed'));
  it('bg override', () => expect(merge(card, 'bg-accent-soft')).toBe('rounded-2xl border border-line p-4 sm:p-5 bg-accent-soft'));
  it('py keeps px', () => expect(merge('px-4 py-3', 'py-10')).toBe('px-4 py-10'));
  it('keeps unrelated + states', () => expect(merge('bg-brand hover:brightness-110 text-on-brand', 'mt-4 w-full')).toBe('bg-brand hover:brightness-110 text-on-brand mt-4 w-full'));
  it('border-t is not a colour', () => expect(merge(card, 'border-t-2')).toBe(`${card} border-t-2`));
});
