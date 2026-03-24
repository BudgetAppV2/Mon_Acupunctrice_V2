'use client';

import { CONTENT_STYLES } from '@/lib/utils/contentStyles';
import type { ContentStyle } from '@/lib/types';

interface Props {
  value?: ContentStyle;
  onChange: (style: ContentStyle) => void;
}

export default function ContentStyleSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CONTENT_STYLES.map((s) => {
        const selected = value === s.value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={
              selected
                ? { backgroundColor: s.color, borderColor: s.color, color: '#fff' }
                : { backgroundColor: 'transparent', borderColor: s.color, color: s.color }
            }
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
