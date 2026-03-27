# P4.3 — Templates V2 (12 templates complets)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Les Templates V1 (P3.2) offrent 4 templates de base (1 par style de contenu).
Judith les utilise mais veut plus de variete. Ce prompt etend a 12 templates
(3 par style) avec des placeholders editables et un preview Canvas avant application.

Apres P4.2, les effets cinematiques (LUTs, grain, vignette) sont disponibles.
Les templates V2 peuvent les inclure dans leur configuration.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Canvas 2D, Heroicons.

## Fichiers a lire AVANT de commencer
- `lib/data/videoTemplates.ts` → cree en P3.2. `VideoTemplate` interface, `TemplateSectionPreset`, 4 templates (hook_and_teach, story_time, quick_tip, inspiration_quote). `getTemplatesByStyle`, `getTemplate`.
- `lib/data/videoThemes.ts` → ~185 lignes post-P4.2. `VideoTheme` avec `lutId?`, `grainAmount?`, `vignetteIntensity?`.
- `lib/store/useEditorStore.ts` → ~360 lignes post-P4.2. `applyTemplate(templateId)` : applique le theme + cree les overlays.
- `lib/data/designKnowledge.ts` → ~340 lignes. `TEXT_ANIMATIONS`, `TEXT_EFFECTS`, `SAFE_ZONES`, `FONTS`.
- `components/features/editor/panels/TemplatePanel.tsx` → cree en P3.2. Panel de selection avec grille par style. Pas de preview Canvas.
- `lib/types/editor.ts` → ~80 lignes post-P3.3. `TextOverlayItem` avec `animation`, `animationDuration`.

---

## Livrable 1 — Etendre le schema VideoTemplate

**Fichier :** `lib/data/videoTemplates.ts`

Ajouter des champs au schema pour les effets cinematiques et un meilleur controle :

```typescript
export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  style: ContentStyle;
  themeId: string;
  sections: TemplateSectionPreset[];
  thumbnail?: string;
  /** Effets cinematiques optionnels */
  lutId?: string;
  grainAmount?: number;
  vignetteIntensity?: number;
  /** Duree ideale suggeree (secondes) */
  suggestedDuration?: number;
  /** Tags pour le filtrage (ex: 'hook', 'educatif', 'cta') */
  tags?: string[];
}
```

---

## Livrable 2 — 8 nouveaux templates (total 12)

**Fichier :** `lib/data/videoTemplates.ts`

Ajouter 8 templates aux 4 existants. Chaque style passe de 1 a 3 templates.

### Enseigner (ajouter 2)

```typescript
{
  id: 'three_points',
  name: '3 Points',
  description: '3 choses a savoir — numerote, structure, efficace',
  style: 'enseigner',
  themeId: 'minimal_chic',
  suggestedDuration: 45,
  tags: ['educatif', 'liste', 'structure'],
  sections: [
    {
      type: 'intro_hook',
      startPercent: 0, endPercent: 0.08,
      text: '3 CHOSES QUE TU NE SAIS PAS SUR...',
      position: { x: 0.5, y: 0.30 },
      fontSize: 36, fontFamily: 'Montserrat',
      effect: 'pill', animation: 'scale_pop', animationDuration: 0.5,
      fill: '#1A1A1A',
    },
    {
      type: 'key_point',
      startPercent: 0.10, endPercent: 0.35,
      text: '1.',
      position: { x: 0.12, y: 0.15 },
      fontSize: 48, fontFamily: 'Montserrat',
      effect: 'pill', animation: 'slide_up', animationDuration: 0.4,
      fill: '#5C7A5F',
    },
    {
      type: 'key_point',
      startPercent: 0.35, endPercent: 0.60,
      text: '2.',
      position: { x: 0.12, y: 0.15 },
      fontSize: 48, fontFamily: 'Montserrat',
      effect: 'pill', animation: 'slide_up', animationDuration: 0.4,
      fill: '#5C7A5F',
    },
    {
      type: 'key_point',
      startPercent: 0.60, endPercent: 0.85,
      text: '3.',
      position: { x: 0.12, y: 0.15 },
      fontSize: 48, fontFamily: 'Montserrat',
      effect: 'pill', animation: 'slide_up', animationDuration: 0.4,
      fill: '#5C7A5F',
    },
    {
      type: 'cta',
      startPercent: 0.88, endPercent: 1.0,
      text: 'Enregistre pour ne rien oublier',
      position: { x: 0.5, y: 0.82 },
      fontSize: 22, fontFamily: 'Inter',
      effect: 'pill', animation: 'bounce', animationDuration: 0.5,
      fill: '#ffffff',
    },
  ],
},
{
  id: 'myth_buster',
  name: 'Myth Buster',
  description: 'Casser un mythe courant — hook provocateur + verite',
  style: 'enseigner',
  themeId: 'bold_energy',
  suggestedDuration: 30,
  tags: ['hook', 'mythe', 'viral'],
  sections: [
    {
      type: 'intro_hook',
      startPercent: 0, endPercent: 0.12,
      text: 'FAUX!',
      position: { x: 0.5, y: 0.40 },
      fontSize: 56, fontFamily: 'Bebas Neue',
      effect: 'outline', animation: 'scale_pop', animationDuration: 0.4,
      fill: '#ff4444', stroke: '#000000', strokeWidth: 3,
    },
    {
      type: 'main_content',
      startPercent: 0.12, endPercent: 0.85,
      text: '',
      position: { x: 0.5, y: 0.5 },
      fontSize: 24, fontFamily: 'Inter',
      effect: 'none', animation: 'none', animationDuration: 0,
      fill: '#ffffff',
    },
    {
      type: 'cta',
      startPercent: 0.88, endPercent: 1.0,
      text: 'Partage a quelqu\'un qui croit encore ca',
      position: { x: 0.5, y: 0.80 },
      fontSize: 20, fontFamily: 'Inter',
      effect: 'pill', animation: 'fade_in', animationDuration: 0.6,
      fill: '#ffffff',
    },
  ],
},
```

### Connecter (ajouter 2)

```typescript
{
  id: 'before_after',
  name: 'Before / After',
  description: 'Avant et apres un traitement — transformation visible',
  style: 'connecter',
  themeId: 'sage_zen',
  lutId: 'warm_glow',
  suggestedDuration: 30,
  tags: ['transformation', 'resultat', 'temoignage'],
  sections: [
    {
      type: 'intro_hook',
      startPercent: 0, endPercent: 0.10,
      text: 'AVANT',
      position: { x: 0.5, y: 0.20 },
      fontSize: 40, fontFamily: 'DM Serif Display',
      effect: 'outline', animation: 'fade_in', animationDuration: 0.6,
      fill: '#ffffff', stroke: '#2D3E2F', strokeWidth: 2,
    },
    {
      type: 'key_point',
      startPercent: 0.45, endPercent: 0.55,
      text: 'APRES',
      position: { x: 0.5, y: 0.20 },
      fontSize: 40, fontFamily: 'DM Serif Display',
      effect: 'outline', animation: 'scale_pop', animationDuration: 0.5,
      fill: '#5C7A5F', stroke: '#2D3E2F', strokeWidth: 2,
    },
    {
      type: 'cta',
      startPercent: 0.88, endPercent: 1.0,
      text: 'Prends rendez-vous',
      position: { x: 0.5, y: 0.82 },
      fontSize: 22, fontFamily: 'Poppins',
      effect: 'pill', animation: 'bounce', animationDuration: 0.5,
      fill: '#ffffff',
    },
  ],
},
{
  id: 'day_in_life',
  name: 'Day in the Life',
  description: 'Une journee a la clinique — authentique et chaleureux',
  style: 'connecter',
  themeId: 'terre_warm',
  grainAmount: 0.04,
  vignetteIntensity: 0.2,
  suggestedDuration: 60,
  tags: ['coulisses', 'authentique', 'quotidien'],
  sections: [
    {
      type: 'intro_hook',
      startPercent: 0, endPercent: 0.08,
      text: 'Ma journee a la clinique',
      position: { x: 0.5, y: 0.25 },
      fontSize: 30, fontFamily: 'Playfair Display',
      effect: 'none', animation: 'fade_in', animationDuration: 1.0,
      fill: '#ffffff', stroke: '#5C3D21', strokeWidth: 2,
    },
    {
      type: 'main_content',
      startPercent: 0.08, endPercent: 0.92,
      text: '',
      position: { x: 0.5, y: 0.5 },
      fontSize: 24, fontFamily: 'Lora',
      effect: 'none', animation: 'none', animationDuration: 0,
      fill: '#ffffff',
    },
    {
      type: 'cta',
      startPercent: 0.92, endPercent: 1.0,
      text: 'Tu veux voir plus de coulisses?',
      position: { x: 0.5, y: 0.82 },
      fontSize: 22, fontFamily: 'Lora',
      effect: 'pill', animation: 'fade_in', animationDuration: 0.6,
      fill: '#ffffff',
    },
  ],
},
```

### Aider (ajouter 2)

```typescript
{
  id: 'step_by_step',
  name: 'Step by Step',
  description: 'Tutoriel pas a pas — clair, actionable',
  style: 'aider',
  themeId: 'minimal_chic',
  suggestedDuration: 45,
  tags: ['tutoriel', 'etapes', 'pratique'],
  sections: [
    {
      type: 'intro_hook',
      startPercent: 0, endPercent: 0.08,
      text: 'COMMENT FAIRE...',
      position: { x: 0.5, y: 0.30 },
      fontSize: 34, fontFamily: 'Montserrat',
      effect: 'pill', animation: 'slide_up', animationDuration: 0.5,
      fill: '#1A1A1A',
    },
    {
      type: 'key_point',
      startPercent: 0.10, endPercent: 0.35,
      text: 'Etape 1',
      position: { x: 0.5, y: 0.15 },
      fontSize: 26, fontFamily: 'Inter',
      effect: 'pill', animation: 'slide_up', animationDuration: 0.3,
      fill: '#ffffff',
    },
    {
      type: 'key_point',
      startPercent: 0.35, endPercent: 0.60,
      text: 'Etape 2',
      position: { x: 0.5, y: 0.15 },
      fontSize: 26, fontFamily: 'Inter',
      effect: 'pill', animation: 'slide_up', animationDuration: 0.3,
      fill: '#ffffff',
    },
    {
      type: 'key_point',
      startPercent: 0.60, endPercent: 0.85,
      text: 'Etape 3',
      position: { x: 0.5, y: 0.15 },
      fontSize: 26, fontFamily: 'Inter',
      effect: 'pill', animation: 'slide_up', animationDuration: 0.3,
      fill: '#ffffff',
    },
    {
      type: 'cta',
      startPercent: 0.88, endPercent: 1.0,
      text: 'Essaie et dis-moi comment ca va',
      position: { x: 0.5, y: 0.82 },
      fontSize: 20, fontFamily: 'Inter',
      effect: 'pill', animation: 'fade_in', animationDuration: 0.5,
      fill: '#ffffff',
    },
  ],
},
{
  id: 'diy_guide',
  name: 'DIY Guide',
  description: 'Guide autonome — acupression, exercice, routine',
  style: 'aider',
  themeId: 'ocean_doux',
  suggestedDuration: 60,
  tags: ['diy', 'exercice', 'routine'],
  sections: [
    {
      type: 'intro_hook',
      startPercent: 0, endPercent: 0.10,
      text: 'Tu peux faire ca chez toi',
      position: { x: 0.5, y: 0.30 },
      fontSize: 32, fontFamily: 'Dancing Script',
      effect: 'none', animation: 'fade_in', animationDuration: 0.8,
      fill: '#ffffff', stroke: '#2A4F3F', strokeWidth: 2,
    },
    {
      type: 'main_content',
      startPercent: 0.10, endPercent: 0.88,
      text: '',
      position: { x: 0.5, y: 0.5 },
      fontSize: 24, fontFamily: 'Nunito',
      effect: 'none', animation: 'none', animationDuration: 0,
      fill: '#ffffff',
    },
    {
      type: 'cta',
      startPercent: 0.90, endPercent: 1.0,
      text: 'Pour aller plus loin, prends rendez-vous',
      position: { x: 0.5, y: 0.82 },
      fontSize: 20, fontFamily: 'Nunito',
      effect: 'pill', animation: 'bounce', animationDuration: 0.5,
      fill: '#ffffff',
    },
  ],
},
```

### Inspirer (ajouter 2)

```typescript
{
  id: 'transformation',
  name: 'Transformation',
  description: 'Histoire de transformation — emotionnel et puissant',
  style: 'inspirer',
  themeId: 'sage_zen',
  lutId: 'warm_glow',
  grainAmount: 0.03,
  suggestedDuration: 45,
  tags: ['temoignage', 'transformation', 'emotionnel'],
  sections: [
    {
      type: 'intro_hook',
      startPercent: 0, endPercent: 0.10,
      text: 'Elle pensait que...',
      position: { x: 0.5, y: 0.35 },
      fontSize: 32, fontFamily: 'DM Serif Display',
      effect: 'outline', animation: 'fade_in', animationDuration: 0.8,
      fill: '#ffffff', stroke: '#2D3E2F', strokeWidth: 2,
    },
    {
      type: 'main_content',
      startPercent: 0.10, endPercent: 0.88,
      text: '',
      position: { x: 0.5, y: 0.5 },
      fontSize: 24, fontFamily: 'Poppins',
      effect: 'none', animation: 'none', animationDuration: 0,
      fill: '#ffffff',
    },
    {
      type: 'cta',
      startPercent: 0.90, endPercent: 1.0,
      text: 'Et toi, qu\'est-ce qui te retient?',
      position: { x: 0.5, y: 0.82 },
      fontSize: 22, fontFamily: 'Poppins',
      effect: 'pill', animation: 'fade_in', animationDuration: 0.6,
      fill: '#ffffff',
    },
  ],
},
{
  id: 'quote_card',
  name: 'Quote Card',
  description: 'Citation visuelle — texte centre, ambiance inspirante',
  style: 'inspirer',
  themeId: 'pantone_2026',
  lutId: 'soft_pastel',
  suggestedDuration: 20,
  tags: ['citation', 'visuel', 'partage'],
  sections: [
    {
      type: 'intro_hook',
      startPercent: 0, endPercent: 0.60,
      text: '"Ta citation inspirante ici"',
      position: { x: 0.5, y: 0.40 },
      fontSize: 36, fontFamily: 'DM Serif Display',
      effect: 'none', animation: 'fade_in', animationDuration: 1.5,
      fill: '#ffffff', stroke: '#2D3436', strokeWidth: 2,
    },
    {
      type: 'key_point',
      startPercent: 0.50, endPercent: 0.85,
      text: '— Ton nom',
      position: { x: 0.6, y: 0.55 },
      fontSize: 20, fontFamily: 'Inter',
      effect: 'none', animation: 'fade_in', animationDuration: 0.8,
      fill: '#5C7A5F',
    },
    {
      type: 'cta',
      startPercent: 0.85, endPercent: 1.0,
      text: 'Partage cette citation',
      position: { x: 0.5, y: 0.82 },
      fontSize: 20, fontFamily: 'Inter',
      effect: 'pill', animation: 'fade_in', animationDuration: 0.5,
      fill: '#ffffff',
    },
  ],
},
```

---

## Livrable 3 — Mettre a jour applyTemplate pour les effets cinematiques

**Fichier :** `lib/store/useEditorStore.ts`

Modifier `applyTemplate` pour appliquer les LUT, grain et vignette du template :

```typescript
applyTemplate: (templateId) => {
  const template = getTemplate(templateId);
  if (!template) return;
  const { duration } = get();
  if (duration <= 0) return;

  // pushSnapshot()

  const theme = getTheme(template.themeId);
  const themeFilter = getThemeFilter(theme);

  // ... creer les overlays (existant) ...

  set({
    activeThemeId: template.themeId,
    filter: themeFilter.id,
    subtitleStyle: theme.subtitleStyle,
    overlays: newOverlays,
    selectedOverlayId: newOverlays[0]?.id ?? null,
    // Effets cinematiques du template (priorite) ou du theme (fallback)
    lutId: template.lutId ?? theme.lutId ?? null,
    grainAmount: template.grainAmount ?? theme.grainAmount ?? 0,
    vignetteIntensity: template.vignetteIntensity ?? theme.vignetteIntensity ?? 0,
  });
},
```

---

## Livrable 4 — Ameliorer TemplatePanel avec preview et filtrage

**Fichier :** `components/features/editor/panels/TemplatePanel.tsx`

Refactorer le panel pour supporter 12 templates avec filtrage par style :

```typescript
'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { VIDEO_TEMPLATES, type VideoTemplate } from '@/lib/data/videoTemplates';
import { getTheme, getThemePalette } from '@/lib/data/videoThemes';
import type { ContentStyle } from '@/lib/types';

const STYLES: { id: ContentStyle; label: string }[] = [
  { id: 'enseigner', label: 'Enseigner' },
  { id: 'connecter', label: 'Connecter' },
  { id: 'aider', label: 'Aider' },
  { id: 'inspirer', label: 'Inspirer' },
];

export default function TemplatePanel() {
  const { applyTemplate, duration } = useEditorStore();
  const [activeStyle, setActiveStyle] = useState<ContentStyle | 'all'>('all');

  const filtered = activeStyle === 'all'
    ? VIDEO_TEMPLATES
    : VIDEO_TEMPLATES.filter(t => t.style === activeStyle);

  return (
    <div className="px-3 py-3 space-y-2">
      {/* Filtres par style */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveStyle('all')}
          className={`px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap ${
            activeStyle === 'all' ? 'bg-sage text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          Tous
        </button>
        {STYLES.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveStyle(s.id)}
            className={`px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap ${
              activeStyle === s.id ? 'bg-sage text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grille de templates */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map(t => (
          <TemplateCard key={t.id} template={t} onApply={() => applyTemplate(t.id)} disabled={duration <= 0} />
        ))}
      </div>

      {duration <= 0 && (
        <p className="text-xs text-yellow-400/70 text-center">
          Importe une video d'abord
        </p>
      )}
    </div>
  );
}

function TemplateCard({ template, onApply, disabled }: {
  template: VideoTemplate;
  onApply: () => void;
  disabled: boolean;
}) {
  const theme = getTheme(template.themeId);
  const palette = getThemePalette(theme);
  const textSections = template.sections.filter(s => s.text).length;

  return (
    <button
      onClick={onApply}
      disabled={disabled}
      className="rounded-lg overflow-hidden text-left bg-gray-800 border border-gray-700 disabled:opacity-40"
    >
      <div
        className="h-20 flex flex-col justify-end p-2"
        style={{ background: `linear-gradient(135deg, ${palette.accent}88, ${palette.stroke}88)` }}
      >
        <span
          className="text-sm font-bold leading-tight"
          style={{ color: palette.text, fontFamily: `"${theme.fontTitle}", sans-serif` }}
        >
          {template.name}
        </span>
        {template.suggestedDuration && (
          <span className="text-[9px] mt-0.5" style={{ color: `${palette.text}99` }}>
            ~{template.suggestedDuration}s
          </span>
        )}
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[10px] text-gray-400 line-clamp-2">{template.description}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[9px] text-gray-600">{textSections} textes</span>
          {template.lutId && <span className="text-[9px] text-amber-600/60">LUT</span>}
          {template.grainAmount && template.grainAmount > 0 && <span className="text-[9px] text-gray-600">Grain</span>}
        </div>
      </div>
    </button>
  );
}
```

---

## Contraintes
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, exportWebCodecs.ts
- NE PAS modifier les Cloud Functions ou les routes API
- NE PAS creer plus de 12 templates au total (3 par style)
- NE PAS generer de texte IA — les placeholders sont des textes fixes editables
- Les templates existants (V1) doivent rester intacts et fonctionnels
- Les nouveaux templates utilisent les themes et fonts EXISTANTS (pas de nouvelles fonts)
- `applyTemplate` doit appliquer les effets cinematiques (LUT, grain, vignette) du template
- L'undo/redo doit tracker l'application du template complet en 1 action
- Les positions respectent les SAFE_ZONES d'Instagram
- Les fonts des templates doivent etre prechargees (loadFont) quand le template est selectionne
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] 12 templates au total dans `videoTemplates.ts` (3 par style)
- [ ] Enseigner : Hook & Teach, 3 Points, Myth Buster
- [ ] Connecter : Story Time, Before/After, Day in the Life
- [ ] Aider : Quick Tip, Step by Step, DIY Guide
- [ ] Inspirer : Inspiration Quote, Transformation, Quote Card
- [ ] Chaque template a `suggestedDuration` et `tags`
- [ ] Certains templates ont des effets cinematiques (lutId, grainAmount, vignetteIntensity)
- [ ] `applyTemplate` applique les effets cinematiques du template
- [ ] TemplatePanel avec filtrage par style (tabs All/Enseigner/Connecter/Aider/Inspirer)
- [ ] Chaque carte template montre le nombre de textes, la duree suggeree, et les badges (LUT, Grain)
- [ ] Les 4 templates V1 existants restent fonctionnels
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/data/videoTemplates.ts`
- `lib/data/videoThemes.ts`
- `lib/data/designKnowledge.ts`
- `lib/store/useEditorStore.ts`
- `lib/types/editor.ts`
- `components/features/editor/panels/TemplatePanel.tsx`
- `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` (section F — Templates)
- `project-docs/03_RESEARCH/VISUAL_ANALYSIS_RESEARCH.md` (patterns hooks viraux)
