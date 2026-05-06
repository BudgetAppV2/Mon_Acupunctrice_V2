export type Pilier =
  | 'grossesse'
  | 'pediatrie'
  | 'fertilite'
  | 'anxiete-sommeil'
  | 'menopause'
  | 'acupuncture-sociale'
  | 'transversal';

export type ContentType = 'ressource' | 'faq' | 'blog';

export type CoverFormat = 'cover16x9' | 'story9x16';

export interface CoverAsset {
  file: string;
  type: 'background' | 'lineart';
  pilier?: Pilier;
  palette?: string[];
  dominantColor?: string;
  dimensions?: { width: number; height: number };
  format?: 'horizontal' | 'vertical' | 'square' | 'mixed';
  usedInArticles?: string[]; // Phase 2
}

export interface AssetMetadata {
  count: number;
  updated_at: string;
  assets: CoverAsset[];
}

export interface PlacementResult {
  row: number;
  col: number;
  xPercent: number;
  yPercent: number;
  score: number;
}

export interface GenerateCoverInput {
  contentId: string;
  type: ContentType;
  titre: string;
  pilier: Pilier;
  ctaMode?: 'ressource' | 'reservation';
  excludeAssets?: { backgrounds?: string[]; lineart?: string[] };
}

export interface GenerateCoverOutput {
  cover16x9: string;
  story9x16: string;
  assets: {
    backgroundFile: string;
    lineartFile: string;
  };
  metadata: {
    placementZone: PlacementResult;
    generatedAt: string;
  };
}

// Satori element type (compatible with satori's internal type)
export type SatoriElement = {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: SatoriElement | SatoriElement[] | string;
    src?: string;
    [key: string]: unknown;
  };
};
