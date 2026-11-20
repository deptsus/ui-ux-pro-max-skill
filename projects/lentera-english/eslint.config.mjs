// ESLint (redesign Fase 0): Next.js core web vitals + TypeScript rules, plus the
// full jsx-a11y recommended set. Development only; nothing here ships to users.
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      ...jsxA11y.configs.recommended.rules,
      // Scrollable tables and the question panel are focusable on purpose: keyboard users
      // must be able to scroll them (axe: scrollable-region-focusable).
      'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: ['section'], roles: ['tabpanel', 'region'] }],
      // Labels that wrap their control with a nested text span.
      'jsx-a11y/label-has-associated-control': ['error', { depth: 3 }],
      // React Compiler rules (eslint-plugin-react-hooks 6+). The existing code predates them;
      // rewriting those effects would touch app logic, which the redesign must not do.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      // Indonesian copy uses straight quotes in JSX text; they render the same.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    // Deliberate focus moves: "Lanjut" after answer feedback, and the admin 2FA code field.
    files: ['src/components/SessionRunner.tsx', 'src/app/admin/page.tsx'],
    rules: { 'jsx-a11y/no-autofocus': 'off' },
  },
  {
    // The learner's own recordings and the wordless promo video have no speech to caption.
    files: ['src/app/app/listening/page.tsx', 'src/components/admin/RecordingsPanel.tsx', 'src/components/PromoVideo.tsx'],
    rules: { 'jsx-a11y/media-has-caption': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'android/**', 'public/**', 'node_modules/**', 'play-store/**', 'promo/**']),
]);
