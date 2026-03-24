import type { ContentStyle } from '@/lib/types';

export interface HookTemplate {
  id: string;
  style: ContentStyle;
  text: string;
  category: 'hook' | 'caption_structure';
}

export const TEMPLATES: HookTemplate[] = [
  // ENSEIGNER — Hooks
  { id: 'e1', style: 'enseigner', text: 'Savais-tu que [fait surprenant]?', category: 'hook' },
  { id: 'e2', style: 'enseigner', text: '3 choses que tu ne sais pas sur [sujet]', category: 'hook' },
  { id: 'e3', style: 'enseigner', text: 'Arrete de [habitude] si tu veux [resultat]', category: 'hook' },
  { id: 'e4', style: 'enseigner', text: 'La verite sur [mythe courant]', category: 'hook' },
  { id: 'e5', style: 'enseigner', text: 'Ce que la science dit sur [sujet]', category: 'hook' },

  // CONNECTER — Hooks
  { id: 'c1', style: 'connecter', text: "POV : une journee d'acupunctrice", category: 'hook' },
  { id: 'c2', style: 'connecter', text: 'Ce que tu ne vois jamais dans une clinique', category: 'hook' },
  { id: 'c3', style: 'connecter', text: 'Ce que [X] annees de pratique m\'ont appris', category: 'hook' },
  { id: 'c4', style: 'connecter', text: 'Ma routine du [jour] a la clinique', category: 'hook' },
  { id: 'c5', style: 'connecter', text: 'La question qu\'on me pose le plus souvent', category: 'hook' },

  // AIDER — Hooks
  { id: 'a1', style: 'aider', text: 'Essaie ce point d\'acupression ce soir', category: 'hook' },
  { id: 'a2', style: 'aider', text: 'Si tu as [symptome], regarde ceci', category: 'hook' },
  { id: 'a3', style: 'aider', text: 'Le point que tout le monde devrait connaitre', category: 'hook' },
  { id: 'a4', style: 'aider', text: 'Testez ca pendant 7 jours', category: 'hook' },
  { id: 'a5', style: 'aider', text: '1 minute pour soulager [symptome]', category: 'hook' },

  // INSPIRER — Hooks
  { id: 'i1', style: 'inspirer', text: 'Une patiente m\'a dit [citation]', category: 'hook' },
  { id: 'i2', style: 'inspirer', text: '[Nombre] seances plus tard, elle [resultat]', category: 'hook' },
  { id: 'i3', style: 'inspirer', text: 'Ce qui me touche le plus dans mon metier', category: 'hook' },
  { id: 'i4', style: 'inspirer', text: "Pourquoi je fais de l'acupuncture solidaire", category: 'hook' },
  { id: 'i5', style: 'inspirer', text: "Le moment ou j'ai su que c'etait ma vocation", category: 'hook' },

  // STRUCTURES DE CAPTIONS
  { id: 'cs1', style: 'enseigner', text: 'Stat surprenante → 3 points cles → CTA "Enregistre"', category: 'caption_structure' },
  { id: 'cs2', style: 'inspirer',  text: 'Citation patiente → Contexte → Resultat → CTA RDV', category: 'caption_structure' },
  { id: 'cs3', style: 'aider',     text: 'Question frequente → Reponse courte → Detail → CTA "Essaie"', category: 'caption_structure' },
  { id: 'cs4', style: 'connecter', text: 'Moment vecu → Ce qu\'on ne sait pas → Question ouverte', category: 'caption_structure' },
];
