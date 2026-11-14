// Runs in the browser before React hydrates (Next.js instrumentation-client hook).
//
// Netlify's edge inserts "\n<!-- This site is hosted on Netlify ... -->" into
// <head> of every HTML response. React renders no text or comment nodes in
// <head>, so those two extra nodes make hydration fail (React error #418) and
// React then re-renders the whole page on the client. Removing them before
// hydration restores a clean hydrate. Elements other hosts or extensions add
// (scripts, styles) are left alone: React 19 skips those by itself.
function stripHostNodesFromHead(): void {
  const head = typeof document === 'undefined' ? null : document.head;
  if (!head) return;
  for (const node of Array.from(head.childNodes)) {
    const isComment = node.nodeType === Node.COMMENT_NODE;
    const isBlankText = node.nodeType === Node.TEXT_NODE && !node.textContent?.trim();
    if (isComment || isBlankText) node.remove();
  }
}

stripHostNodesFromHead();
