import type { SatoriElement } from '../types';

/**
 * Template cover blog 1920×1080 (16:9 horizontal).
 * PORT DIRECT du POC validé poc-compose.mjs — NE PAS MODIFIER les valeurs visuelles.
 */
export interface CoverBlogTemplateProps {
  bgDataUrl: string;
  laDataUrl: string;
  surtitre: string;
  titre: string;
  width: number;   // 1920
  height: number;  // 1080
  placementX: number;
  placementY: number;
}

export function buildCoverBlogTemplate(props: CoverBlogTemplateProps): SatoriElement {
  const { bgDataUrl, laDataUrl, surtitre, titre, width, height, placementX, placementY } = props;
  const laWidthPercent = 70;
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
        // Voile léger
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
                'linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(245,240,232,0.32) 100%)',
              display: 'flex',
            },
          },
        },
        // Line art positionné intelligemment
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
                    opacity: 0.92,
                  },
                },
              },
            ],
          },
        },
        // Bloc titre en bas à gauche
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '6%',
              bottom: '8%',
              maxWidth: '78%',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 32,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    letterSpacing: '0.2em',
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
                    fontSize: 108,
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
        // Branding
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: '4%',
              bottom: '4%',
              fontSize: 26,
              fontFamily: 'Inter',
              fontWeight: 500,
              color: '#5C5852',
              display: 'flex',
            },
            children: 'acupuncturejudith.ca',
          },
        },
      ],
    },
  };
}
