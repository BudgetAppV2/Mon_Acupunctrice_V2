# P3.2 — Templates V1

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Judith a 4 styles de contenu (enseigner, connecter, aider, inspirer). Chaque semaine
elle cree 2-3 Reels talking head et part d'une page blanche a chaque fois.
Ce prompt ajoute 4 templates structurels (1 par style) qui appliquent un theme +
creent des overlays texte placeholder aux bonnes positions et timings.

Apres Phase 2, les themes 1-clic, animations texte, et undo/redo sont en place.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/data/videoThemes.ts` → 172 lignes. `VideoTheme` interface (lignes 14-36), `VIDEO_THEMES` (8 themes, lignes 38-151), `getTheme(id)`. Chaque theme a `fontTitle`, `fontSubtitle`, `subtitleStyle`, `filterId`, `defaultAnimation`, `defaultTextEffect`, `titleFontSize`, `subtitleFontSize`.
- `lib/data/designKnowledge.ts` → ~338 lignes. `TEXT_ANIMATIONS` (ligne 242-249), `TEXT_EFFECTS` (ligne 228-234), `SAFE_ZONES` (ligne 17-27), `FONT_PAIRINGS` (ligne 104-111).
- `lib/store/useEditorStore.ts` → ~270 lignes post-P2.4. `addOverlay` (cree un overlay avec font du theme actif), `setOverlays`, `setActiveTheme`, `setSubtitleStyle`, `setFilter`. Undo/redo via `pushSnapshot`.
- `lib/types/editor.ts` → 63 lignes. `TextOverlayItem` : `{id, text, fontFamily, fontSize, fill, stroke, strokeWidth, x, y, startTime, endTime, style, animation, animationDuration}`.
- `lib/types/index.ts` → `ContentStyle = 'enseigner' | 'connecter' | 'aider' | 'inspirer'`.
- `components/features/editor/EditorLayout.tsx` → 144 lignes. Layout editeur : header + preview + toolbar + panels. `activeTab` controle le panel affiche. Tabs actuels : style, trim, filtres, texte, subs, audio, cover.
- `components/features/editor/EditorToolbar.tsx` → 39 lignes. TABS array : `[{id, label}]`. On pourrait ajouter un tab "Templates" ou integrer dans "Style".
- `components/features/editor/panels/ThemePanel.tsx` → panel theme existant. Candidat pour integrer les templates.

---

## Livrable 1 — Schema VideoTemplate + 4 templates

**Fichier a creer :** `lib/data/videoTemplates.ts`

```typescript
import type { ContentStyle } from '@/lib/types';
import type { TextAnimationType, TextEffectType } from './designKnowledge';

export interface TemplateSectionPreset {
  /** Type de section */
  type: 'intro_hook' | 'main_content' | 'key_point' | 'cta';
  /** Position relative dans la video (0-1) */
  startPercent: number;
  endPercent: number;
  /** Configuration du texte overlay */
  text: string;              // Placeholder : "Ton hook ici", "Appel a l'action"
  position: { x: number; y: number }; // Position relative (0-1)
  fontSize: number;          // En px sur canvas 1080 (converti en preview)
  fontFamily: string;
  effect: TextEffectType;
  animation: TextAnimationType;
  animationDuration: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  style: ContentStyle;
  /** ID du theme a appliquer */
  themeId: string;
  /** Sections predefines du template */
  sections: TemplateSectionPreset[];
  /** URL de la vignette preview (optionnel, gradient fallback) */
  thumbnail?: string;
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'hook_and_teach',
    name: 'Hook & Teach',
    description: 'Hook bold + 3 points cles + CTA — ideal pour enseigner',
    style: 'enseigner',
    themeId: 'bold_energy',
    sections: [
      {
        type: 'intro_hook',
        startPercent: 0, endPercent: 0.08,
        text: 'TON HOOK ICI',
        position: { x: 0.5, y: 0.35 },
        fontSize: 42, fontFamily: 'Bebas Neue',
        effect: 'outline', animation: 'scale_pop', animationDuration: 0.5,
        fill: '#ffffff', stroke: '#000000', strokeWidth: 3,
      },
      {
        type: 'key_point',
        startPercent: 0.15, endPercent: 0.40,
        text: '1. Premier point',
        position: { x: 0.5, y: 0.20 },
        fontSize: 28, fontFamily: 'Inter',
        effect: 'pill', animation: 'slide_up', animationDuration: 0.4,
        fill: '#ffffff',
      },
      {
        type: 'key_point',
        startPercent: 0.40, endPercent: 0.65,
        text: '2. Deuxieme point',
        position: { x: 0.5, y: 0.20 },
        fontSize: 28, fontFamily: 'Inter',
        effect: 'pill', animation: 'slide_up', animationDuration: 0.4,
        fill: '#ffffff',
      },
      {
        type: 'key_point',
        startPercent: 0.65, endPercent: 0.85,
        text: '3. Troisieme point',
        position: { x: 0.5, y: 0.20 },
        fontSize: 28, fontFamily: 'Inter',
        effect: 'pill', animation: 'slide_up', animationDuration: 0.4,
        fill: '#ffffff',
      },
      {
        type: 'cta',
        startPercent: 0.85, endPercent: 1.0,
        text: 'Enregistre pour plus tard',
        position: { x: 0.5, y: 0.80 },
        fontSize: 24, fontFamily: 'Poppins',
        effect: 'pill', animation: 'bounce', animationDuration: 0.6,
        fill: '#ffffff',
      },
    ],
  },
  {
    id: 'story_time',
    name: 'Story Time',
    description: 'Intro personnelle + anecdote + lecon — ideal pour connecter',
    style: 'connecter',
    themeId: 'terre_warm',
    sections: [
      {
        type: 'intro_hook',
        startPercent: 0, endPercent: 0.10,
        text: 'L\'autre jour...',
        position: { x: 0.5, y: 0.30 },
        fontSize: 36, fontFamily: 'Playfair Display',
        effect: 'outline', animation: 'fade_in', animationDuration: 0.8,
        fill: '#ffffff', stroke: '#5C3D21', strokeWidth: 2,
      },
      {
        type: 'main_content',
        startPercent: 0.10, endPercent: 0.80,
        text: '', // Pas de texte — la voix + sous-titres portent le contenu
        position: { x: 0.5, y: 0.5 },
        fontSize: 24, fontFamily: 'Lora',
        effect: 'none', animation: 'none', animationDuration: 0,
        fill: '#ffffff',
      },
      {
        type: 'cta',
        startPercent: 0.85, endPercent: 1.0,
        text: 'Ca te parle? Dis-moi en commentaire',
        position: { x: 0.5, y: 0.80 },
        fontSize: 22, fontFamily: 'Lora',
        effect: 'pill', animation: 'fade_in', animationDuration: 0.6,
        fill: '#ffffff',
      },
    ],
  },
  {
    id: 'quick_tip',
    name: 'Quick Tip',
    description: 'Question hook + reponse rapide + CTA — ideal pour aider',
    style: 'aider',
    themeId: 'sage_zen',
    sections: [
      {
        type: 'intro_hook',
        startPercent: 0, endPercent: 0.10,
        text: 'SAVAIS-TU QUE...',
        position: { x: 0.5, y: 0.35 },
        fontSize: 38, fontFamily: 'DM Serif Display',
        effect: 'outline', animation: 'scale_pop', animationDuration: 0.5,
        fill: '#ffffff', stroke: '#2D3E2F', strokeWidth: 2,
      },
      {
        type: 'main_content',
        startPercent: 0.10, endPercent: 0.85,
        text: '',
        position: { x: 0.5, y: 0.5 },
        fontSize: 24, fontFamily: 'Poppins',
        effect: 'none', animation: 'none', animationDuration: 0,
        fill: '#ffffff',
      },
      {
        type: 'cta',
        startPercent: 0.88, endPercent: 1.0,
        text: 'Prends rendez-vous',
        position: { x: 0.5, y: 0.80 },
        fontSize: 24, fontFamily: 'Poppins',
        effect: 'pill', animation: 'bounce', animationDuration: 0.5,
        fill: '#ffffff',
      },
    ],
  },
  {
    id: 'inspiration_quote',
    name: 'Inspiration Quote',
    description: 'Citation inspirante + explication + CTA — ideal pour inspirer',
    style: 'inspirer',
    themeId: 'ocean_doux',
    sections: [
      {
        type: 'intro_hook',
        startPercent: 0, endPercent: 0.15,
        text: '"Ta citation ici"',
        position: { x: 0.5, y: 0.40 },
        fontSize: 34, fontFamily: 'Dancing Script',
        effect: 'none', animation: 'fade_in', animationDuration: 1.0,
        fill: '#ffffff', stroke: '#2A4F3F', strokeWidth: 2,
      },
      {
        type: 'main_content',
        startPercent: 0.15, endPercent: 0.85,
        text: '',
        position: { x: 0.5, y: 0.5 },
        fontSize: 24, fontFamily: 'Nunito',
        effect: 'none', animation: 'none', animationDuration: 0,
        fill: '#ffffff',
      },
      {
        type: 'cta',
        startPercent: 0.88, endPercent: 1.0,
        text: 'Partage a quelqu\'un qui en a besoin',
        position: { x: 0.5, y: 0.80 },
        fontSize: 22, fontFamily: 'Nunito',
        effect: 'pill', animation: 'fade_in', animationDuration: 0.6,
        fill: '#ffffff',
      },
    ],
  },
];

/** Retourne les templates filtres par style de contenu */
export function getTemplatesByStyle(style: ContentStyle): VideoTemplate[] {
  return VIDEO_TEMPLATES.filter(t => t.style === style);
}

/** Retourne un template par ID */
export function getTemplate(id: string): VideoTemplate | undefined {
  return VIDEO_TEMPLATES.find(t => t.id === id);
}
```

---

## Livrable 2 — Action applyTemplate dans le store

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter une action `applyTemplate` qui :
1. Appelle `pushSnapshot()` pour l'undo/redo
2. Applique le theme du template (setActiveTheme)
3. Cree les overlays texte aux bonnes positions et timings

```typescript
// Dans l'interface EditorState
applyTemplate: (templateId: string) => void;

// Implementation
applyTemplate: (templateId) => {
  const template = getTemplate(templateId);
  if (!template) return;

  const { duration } = get();
  if (duration <= 0) return;

  // pushSnapshot pour undo
  // Appliquer le theme
  const theme = getTheme(template.themeId);
  const themeFilter = getThemeFilter(theme);

  // Creer les overlays depuis les sections du template
  const newOverlays: TextOverlayItem[] = template.sections
    .filter(s => s.text) // Ignorer les sections sans texte (main_content vide)
    .map(section => ({
      id: crypto.randomUUID(),
      text: section.text,
      fontFamily: section.fontFamily,
      fontSize: section.fontSize / (1080 / 375), // Convertir de canvas 1080 a preview 375
      fill: section.fill,
      stroke: section.stroke,
      strokeWidth: section.strokeWidth,
      x: section.position.x,
      y: section.position.y,
      startTime: section.startPercent * duration,
      endTime: section.endPercent * duration,
      style: 'classic' as const,
      animation: section.animation,
      animationDuration: section.animationDuration,
    }));

  set({
    activeThemeId: template.themeId,
    filter: themeFilter.id,
    subtitleStyle: theme.subtitleStyle,
    overlays: newOverlays, // Remplacer les overlays existants
    selectedOverlayId: newOverlays[0]?.id ?? null,
  });
},
```

**IMPORTANT :** `applyTemplate` REMPLACE les overlays existants. Si Judith avait
deja des textes, elle peut undo pour les recuperer. Le template est un point
de depart, pas un ajout.

---

## Livrable 3 — UI de selection de template

**Fichier a creer :** `components/features/editor/panels/TemplatePanel.tsx`

Panel dedie aux templates, accessible depuis le toolbar de l'editeur.

```typescript
'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { VIDEO_TEMPLATES, type VideoTemplate } from '@/lib/data/videoTemplates';
import { getTheme, getThemePalette } from '@/lib/data/videoThemes';

const STYLE_LABELS: Record<string, string> = {
  enseigner: 'Enseigner',
  connecter: 'Connecter',
  aider: 'Aider',
  inspirer: 'Inspirer',
};

const STYLE_ORDER = ['enseigner', 'connecter', 'aider', 'inspirer'] as const;

export default function TemplatePanel() {
  const { applyTemplate, duration } = useEditorStore();

  const handleApply = (template: VideoTemplate) => {
    if (duration <= 0) return;
    applyTemplate(template.id);
  };

  return (
    <div className="px-3 py-3 space-y-3">
      <p className="text-xs text-gray-400">
        Choisis un template pour structurer ta video
      </p>
      {STYLE_ORDER.map(style => {
        const templates = VIDEO_TEMPLATES.filter(t => t.style === style);
        if (templates.length === 0) return null;
        return (
          <div key={style} className="space-y-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              {STYLE_LABELS[style]}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {templates.map(t => {
                const theme = getTheme(t.themeId);
                const palette = getThemePalette(theme);
                return (
                  <button
                    key={t.id}
                    onClick={() => handleApply(t)}
                    className="rounded-lg overflow-hidden text-left bg-gray-800 border border-gray-700"
                  >
                    {/* Preview visuelle avec les couleurs du theme */}
                    <div
                      className="h-16 flex items-end p-2"
                      style={{ background: `linear-gradient(135deg, ${palette.accent}, ${palette.stroke})` }}
                    >
                      <span
                        className="text-xs font-bold leading-tight"
                        style={{
                          color: palette.text,
                          fontFamily: `"${theme.fontTitle}", sans-serif`,
                        }}
                      >
                        {t.name}
                      </span>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] text-gray-400 line-clamp-2">
                        {t.description}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        {t.sections.filter(s => s.text).length} textes
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {duration <= 0 && (
        <p className="text-xs text-yellow-400/70 text-center">
          Importe une video d'abord pour utiliser les templates
        </p>
      )}
    </div>
  );
}
```

---

## Livrable 4 — Ajouter le tab "Templates" dans EditorToolbar

**Fichier :** `components/features/editor/EditorToolbar.tsx`

Ajouter un tab dans TABS (ligne 3) :

```typescript
const TABS = [
  { id: 'style', label: 'Style' },
  { id: 'templates', label: 'Templates' },  // NOUVEAU
  { id: 'trim', label: 'Trim' },
  // ... reste inchange
];
```

**Fichier :** `components/features/editor/EditorLayout.tsx`

Ajouter le rendering conditionnel (apres ligne 127) :

```typescript
import TemplatePanel from './panels/TemplatePanel';

// Dans le JSX, apres {activeTab === 'style' && <ThemePanel />}
{activeTab === 'templates' && <TemplatePanel />}
```

---

## Contraintes
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, ou exportWebCodecs.ts
- NE PAS modifier les Cloud Functions ou les routes API
- NE PAS creer plus de 4 templates (1 par style — V2 avec 12 templates viendra en Phase 4)
- NE PAS generer de contenu automatiquement (Judith ne veut pas de generation IA de texte)
- Les templates sont des POINTS DE DEPART — Judith modifie chaque texte apres application
- Les sections sans texte (main_content vide) ne creent PAS d'overlay
- `applyTemplate` doit etre tracke par l'undo/redo (pushSnapshot avant)
- Les positions des overlays doivent respecter les SAFE_ZONES d'Instagram
- Les fontSize sont en px canvas 1080, convertis en preview 375 (diviser par ~2.88)
- Les fonts doivent etre prechargees quand un template est selectionne
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `videoTemplates.ts` contient l'interface `VideoTemplate` et 4 templates
- [ ] Template "Hook & Teach" : hook bold + 3 points + CTA
- [ ] Template "Story Time" : intro + (voix) + CTA
- [ ] Template "Quick Tip" : question hook + (voix) + CTA
- [ ] Template "Inspiration Quote" : citation + (voix) + CTA
- [ ] `applyTemplate` dans le store applique le theme + cree les overlays
- [ ] `applyTemplate` est tracke par l'undo/redo
- [ ] TemplatePanel affiche les 4 templates groupes par style
- [ ] Chaque carte template montre les couleurs du theme associe
- [ ] Tab "Templates" dans EditorToolbar
- [ ] Les overlays crees sont modifiables individuellement apres application
- [ ] Les templates ne fonctionnent que quand une video est chargee (duration > 0)
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/data/videoThemes.ts`
- `lib/data/designKnowledge.ts`
- `lib/store/useEditorStore.ts`
- `lib/types/editor.ts`
- `lib/types/index.ts`
- `components/features/editor/EditorLayout.tsx`
- `components/features/editor/EditorToolbar.tsx`
- `components/features/editor/panels/ThemePanel.tsx`
