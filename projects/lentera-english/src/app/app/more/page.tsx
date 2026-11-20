'use client';
// Lainnya: every space that is not a bottom-nav tab, grouped like the desktop sidebar.
import { NAV_GROUPS } from '@/components/nav';
import { ListGroup, ListRow, PageHeader } from '@/components/ui';

export default function MorePage() {
  return (
    <div>
      <PageHeader title="Lainnya" subtitle="Semua ruang belajar di sekolah digitalmu." />
      <div className="space-y-6">
        {NAV_GROUPS.map((g) => {
          const items = g.items.filter((n) => n.desc);
          if (!items.length) return null;
          const id = `grup-${g.title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
          return (
            <section key={g.title} aria-labelledby={id}>
              <h2 id={id} className="mb-2 px-1 text-sm font-bold text-muted">{g.title}</h2>
              <ListGroup>
                {items.map(({ href, label, icon: Icon, desc }) => (
                  <ListRow key={href} href={href} icon={<Icon size={20} />} title={label} subtitle={desc} />
                ))}
              </ListGroup>
            </section>
          );
        })}
      </div>
    </div>
  );
}
