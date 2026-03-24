import TemplateCard from './TemplateCard';
import type { HookTemplate } from '@/lib/data/templates';
import type { ContentStyle } from '@/lib/types';

interface Props {
  templates: HookTemplate[];
  selectedStyle: ContentStyle | 'all';
}

export default function TemplateList({ templates, selectedStyle }: Props) {
  const filtered = selectedStyle === 'all'
    ? templates
    : templates.filter(t => t.style === selectedStyle);

  const hooks = filtered.filter(t => t.category === 'hook');
  const structures = filtered.filter(t => t.category === 'caption_structure');

  return (
    <div className="space-y-6">
      {hooks.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-4">
            Hooks
          </h2>
          <div className="space-y-2">
            {hooks.map(t => <TemplateCard key={t.id} template={t} />)}
          </div>
        </section>
      )}

      {structures.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-4">
            Structures de captions
          </h2>
          <div className="space-y-2">
            {structures.map(t => <TemplateCard key={t.id} template={t} />)}
          </div>
        </section>
      )}
    </div>
  );
}
