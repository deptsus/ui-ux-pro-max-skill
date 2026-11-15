'use client';
import { useEffect } from 'react';
import { installErrorReporter } from '@/lib/client/errors';

/** Installs the browser error reporter once per page load. Renders nothing. */
export function ErrorReporter() {
  useEffect(() => installErrorReporter(), []);
  return null;
}
