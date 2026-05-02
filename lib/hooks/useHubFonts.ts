'use client';

import { useEffect } from 'react';

const HUB_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Caveat:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;700&family=Kalam:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;600;700&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;600;700;900&family=Space+Grotesk:wght@400;500;700&display=swap';

const ATTR = 'data-hub-fonts';

/**
 * Charge les 11 Google Fonts utilisees par les editeurs (image + blog).
 * Cleanup automatique au unmount pour eviter la fuite vers le site public
 * lors de soft navigations Next.js.
 */
export function useHubFonts() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const existing = document.querySelector(`link[${ATTR}]`);
    if (existing) {
      const count = parseInt(existing.getAttribute('data-ref-count') || '0', 10);
      existing.setAttribute('data-ref-count', String(count + 1));
      return () => {
        const newCount = parseInt(existing.getAttribute('data-ref-count') || '1', 10) - 1;
        if (newCount <= 0) {
          existing.remove();
        } else {
          existing.setAttribute('data-ref-count', String(newCount));
        }
      };
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HUB_FONTS_URL;
    link.setAttribute(ATTR, '');
    link.setAttribute('data-ref-count', '1');
    document.head.appendChild(link);

    return () => {
      const el = document.querySelector(`link[${ATTR}]`);
      if (!el) return;
      const count = parseInt(el.getAttribute('data-ref-count') || '1', 10) - 1;
      if (count <= 0) {
        el.remove();
      } else {
        el.setAttribute('data-ref-count', String(count));
      }
    };
  }, []);
}
