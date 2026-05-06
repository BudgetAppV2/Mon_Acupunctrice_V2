import type { SatoriElement } from '../types';

/**
 * Template story Instagram 1080×1920 (9:16 portrait).
 * PORT DIRECT du POC validé poc-compose-story.mjs — NE PAS MODIFIER les valeurs visuelles.
 */
export interface StoryInstagramTemplateProps {
  bgDataUrl: string;
  laDataUrl: string;
  surtitre: string;
  titre: string;
  width: number;   // 1080
  height: number;  // 1920
  placementX: number;
  placementY: number;
  ctaMode: 'ressource' | 'reservation';
  ctaLabel: string;
}

const CTA_GRADIENTS = {
  ressource: 'linear-gradient(180deg, #7E9374 0%, #6F8566 50%, #5C7156 100%)',
  reservation: 'linear-gradient(180deg, #C47A58 0%, #B8694A 50%, #A05B3D 100%)',
};

export function buildStoryInstagramTemplate(props: StoryInstagramTemplateProps): SatoriElement {
  const {
    bgDataUrl,
    laDataUrl,
    surtitre,
    titre,
    width,
    height,
    placementX,
    placementY,
    ctaMode,
    ctaLabel,
  } = props;

  const laWidthPercent = 130;
  const laHeightPercent = 80;

  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundImage: `url(${bgDataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Inter',
      },
      children: [
        // Voile (plus prononcé que cover — lisibilité haut+bas)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(180deg, rgba(245,240,232,0.65) 0%, rgba(245,240,232,0.10) 28%, rgba(245,240,232,0.05) 55%, rgba(245,240,232,0.30) 70%, rgba(245,240,232,0.75) 100%)',
              display: 'flex',
            },
          },
        },
        // Bloc TITRE (haut)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '8%',
              top: '8%',
              width: '84%',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 44,
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: '#6F8566',
                    display: 'flex',
                  },
                  children: surtitre,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 140,
                    fontFamily: 'Cormorant',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    color: '#2C2A26',
                    lineHeight: 1.05,
                    letterSpacing: '-0.01em',
                    display: 'flex',
                  },
                  children: titre,
                },
              },
            ],
          },
        },
        // LINE ART
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: `${placementX}%`,
              top: `${placementY}%`,
              width: `${laWidthPercent}%`,
              height: `${laHeightPercent}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: laDataUrl,
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: 1.0,
                  },
                },
              },
            ],
          },
        },
        // BOUTON CTA (y=70%, matchant linkSticker IG y=0.75)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '15%',
              top: '70%',
              width: '70%',
              height: '8%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: CTA_GRADIENTS[ctaMode],
              borderRadius: 999,
              boxShadow:
                '0 12px 32px rgba(44,42,38,0.32), 0 4px 12px rgba(44,42,38,0.18), inset 0 1px 0 rgba(255,255,255,0.25)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 50,
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    textShadow: '0 2px 4px rgba(0,0,0,0.20)',
                  },
                  children: `${ctaLabel}  →`,
                },
              },
            ],
          },
        },
        // Indication "Tape pour ouvrir"
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '0%',
              top: '80%',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 28,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    color: '#5C5852',
                    letterSpacing: '0.08em',
                    display: 'flex',
                  },
                  children: 'Tape pour ouvrir',
                },
              },
            ],
          },
        },
        // Branding
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '0%',
              top: '90%',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 36,
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    color: '#2C2A26',
                    display: 'flex',
                  },
                  children: 'acupuncturejudith.ca',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
