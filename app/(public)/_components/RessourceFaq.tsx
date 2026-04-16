import type { FaqEntry } from '@/lib/types/ressource';

interface RessourceFaqProps {
  entries: FaqEntry[];
}

/**
 * Accordeon FAQ Server Component, base sur <details> natif HTML.
 * 100% accessible, 0 JS, indexable par Google. Le Schema.org FAQPage
 * correspondant est genere dans la page parente pour les rich snippets.
 */
export default function RessourceFaq({ entries }: RessourceFaqProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => (
        <details
          key={idx}
          className="group bg-white border border-public-border-subtle rounded-[12px] p-5 open:shadow-public-sm transition-shadow"
        >
          <summary className="font-public-serif text-[17px] font-semibold text-public-text-dark cursor-pointer list-none flex justify-between items-start gap-3">
            <span>{entry.question}</span>
            <span
              className="text-public-accent-warm shrink-0 group-open:rotate-45 transition-transform"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <div className="mt-4 text-[15px] leading-[1.7] text-public-text-medium whitespace-pre-wrap">
            {entry.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
