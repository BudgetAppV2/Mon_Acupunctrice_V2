/**
 * 40 Canva text style presets (100% Google Fonts).
 * Generated from subtitle-lab/fabric-presets/canva-fabric-presets-google-fonts-only.json
 * Each preset has cw/ch (original canvas size) for proper scaling.
 */

export interface CanvaElement {
  type: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: string;
  fill?: string;
  textAlign?: string;
  charSpacing?: number;
  lineHeight?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  angle?: number;
  underline?: boolean;
  linethrough?: boolean;
  textTransform?: string;
}

export interface CanvaPreset {
  id: string;
  name: string;
  cw: number;
  ch: number;
  elements: CanvaElement[];
}

export const CANVA_PRESETS: CanvaPreset[] = [
  {
    id: "canva-0",
    name: "Raphaël \nLeblanc",
    cw: 758,
    ch: 389,
    elements: [
      {
        type: 'textbox',
        text: "Raphaël \nLeblanc",
        fontFamily: "Glass Antiqua",
        fontSize: 128,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 30,
        lineHeight: 0.93,
        left: 33,
        width: 757,
        height: 273,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Crée pour",
        fontFamily: "Vollkorn",
        fontSize: 28,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 40,
        width: 757,
        height: 33,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Directeur exécutif, Construction Polaris\nParis Vème",
        fontFamily: "Glass Antiqua",
        fontSize: 28,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 50,
        left: 316,
        width: 757,
        height: 72
      }
    ]
  },
  {
    id: "canva-1",
    name: "Fraîches,\nDouces &\nDélici",
    cw: 757,
    ch: 455,
    elements: [
      {
        type: 'textbox',
        text: "Fraîches,\nDouces &\nDélicieuses",
        fontFamily: "PT Sans",
        fontSize: 128,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 20,
        lineHeight: 0.99,
        width: 757,
        height: 405
      },
      {
        type: 'textbox',
        text: "Brasserie antonin",
        fontFamily: "PT Sans",
        fontSize: 24,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 210,
        left: 427,
        width: 757,
        height: 28,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-2",
    name: "La créativité",
    cw: 776,
    ch: 418,
    elements: [
      {
        type: 'textbox',
        text: "La créativité",
        fontFamily: "Lora",
        fontSize: 96,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 50,
        lineHeight: 1.1,
        top: 18,
        width: 758,
        height: 220,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "qui s'amuse",
        fontFamily: "Glacial Indifference",
        fontSize: 74.67,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 130,
        lineHeight: 1.18,
        left: 329,
        width: 758,
        height: 89,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "C'est l'intelligence",
        fontFamily: "Lora",
        fontSize: 74.67,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 40,
        left: 220,
        top: 18,
        width: 758,
        height: 90
      }
    ]
  },
  {
    id: "canva-3",
    name: "Article",
    cw: 775,
    ch: 222,
    elements: [
      {
        type: 'textbox',
        text: "Article",
        fontFamily: "Racing Sans One",
        fontSize: 74.67,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: -10,
        lineHeight: 0.9,
        top: 4,
        width: 772,
        height: 89,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Oreiller en ouate\nOreiller en coton\nOreiller en plume",
        fontFamily: "Arimo",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#222222",
        charSpacing: 140,
        left: 97,
        width: 371,
        height: 126
      },
      {
        type: 'textbox',
        text: "Prix",
        fontFamily: "Racing Sans One",
        fontSize: 74.67,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "end",
        charSpacing: -10,
        lineHeight: 0.9,
        top: 520,
        width: 166,
        height: 89,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "60€\n65€\n70€",
        fontFamily: "Arimo",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#222222",
        charSpacing: 140,
        left: 97,
        top: 520,
        width: 255,
        height: 126
      }
    ]
  },
  {
    id: "canva-4",
    name: "C'est bientôt",
    cw: 791,
    ch: 288,
    elements: [
      {
        type: 'textbox',
        text: "C'est bientôt",
        fontFamily: "Quicksand",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 30,
        width: 757,
        height: 38,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Les vacances !",
        fontFamily: "Londrina Shadow",
        fontSize: 125.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 50,
        lineHeight: 0.96,
        left: 38,
        width: 791,
        height: 150
      },
      {
        type: 'textbox',
        text: "Retrouvez tous nos conseils de voyages sur sitevraimentsuper.com",
        fontFamily: "Quicksand",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 20,
        left: 207,
        width: 757,
        height: 82,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-5",
    name: "Michel \nRobeyns",
    cw: 774,
    ch: 557,
    elements: [
      {
        type: 'textbox',
        text: "Michel \nRobeyns",
        fontFamily: "Limelight",
        fontSize: 117.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: -10,
        lineHeight: 1.02,
        left: 216,
        top: 3,
        width: 771,
        height: 259
      },
      {
        type: 'textbox',
        text: "Félicitations !",
        fontFamily: "Yellowtail",
        fontSize: 96,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 50,
        left: 54,
        top: 7,
        width: 757,
        height: 115,
        angle: -8.37
      },
      {
        type: 'textbox',
        text: "Classe de 2020\nAdministration des entreprises",
        fontFamily: "Raleway",
        fontSize: 21.33,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 130,
        left: 503,
        width: 757,
        height: 54,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-6",
    name: "Crée pour",
    cw: 610,
    ch: 246,
    elements: [
      {
        type: 'textbox',
        text: "Crée pour",
        fontFamily: "Roboto",
        fontSize: 24,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#222222",
        charSpacing: 90,
        width: 152,
        height: 28,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Richard Levin",
        fontFamily: "Glegoo",
        fontSize: 85.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 20,
        lineHeight: 1.14,
        left: 33,
        width: 609,
        height: 102
      },
      {
        type: 'textbox',
        text: "PDG de S.A.R.L. Construction\n22 boulevard des Capucins\nParis",
        fontFamily: "Roboto",
        fontSize: 24,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#222222",
        charSpacing: 40,
        left: 152,
        width: 341,
        height: 94
      }
    ]
  },
  {
    id: "canva-7",
    name: "Proposition \nMarketing",
    cw: 775,
    ch: 452,
    elements: [
      {
        type: 'textbox',
        text: "Proposition \nMarketing",
        fontFamily: "Anton",
        fontSize: 117.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 20,
        lineHeight: 0.99,
        width: 757,
        height: 257,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Projet",
        fontFamily: "Yellowtail",
        fontSize: 37.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        left: 287,
        width: 757,
        height: 45
      },
      {
        type: 'textbox',
        text: "Un plan marketing est un document ou un plan contenant les objectifs de publicité et de marketing d'une entreprise pour l'année suivante.",
        fontFamily: "Glacial Indifference",
        fontSize: 21.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 170,
        left: 369,
        top: 18,
        width: 757,
        height: 83
      }
    ]
  },
  {
    id: "canva-8",
    name: "Venez avec nous célébrer",
    cw: 757,
    ch: 506,
    elements: [
      {
        type: 'textbox',
        text: "Venez avec nous célébrer une vie \nde joie et de rires",
        fontFamily: "Great Vibes",
        fontSize: 106.67,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        lineHeight: 0.93,
        left: 86,
        width: 757,
        height: 326
      },
      {
        type: 'textbox',
        text: "Dominique Levant\n9 Juin 1946 - 8 MARS 2019",
        fontFamily: "Lora",
        fontSize: 28,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 100,
        width: 757,
        height: 72,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Le 12 mars 2019 à 11H\nRue du tribunal, \nMontpellier",
        fontFamily: "Lora",
        fontSize: 24,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 50,
        left: 412,
        width: 757,
        height: 94,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-9",
    name: "Un projet de la direction",
    cw: 757,
    ch: 452,
    elements: [
      {
        type: 'textbox',
        text: "Un projet de la direction générale",
        fontFamily: "Raleway",
        fontSize: 28,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 90,
        left: 288,
        width: 757,
        height: 33,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Proposition \nMarketing",
        fontFamily: "Raleway",
        fontSize: 117.33,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        lineHeight: 1.11,
        width: 757,
        height: 271
      },
      {
        type: 'textbox',
        text: "La proposition marketing est un document compréhensif qui permet de mettre en avant la stratégie générale d'une entreprise et des efforts prévu en terme de publicité pour l'année à venir.",
        fontFamily: "Raleway",
        fontSize: 24,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 20,
        left: 358,
        width: 757,
        height: 94
      }
    ]
  },
  {
    id: "canva-10",
    name: "Secrétaire \nmédicale",
    cw: 758,
    ch: 367,
    elements: [
      {
        type: 'textbox',
        text: "Secrétaire \nmédicale",
        fontFamily: "Ubuntu",
        fontSize: 117.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: -10,
        lineHeight: 1.02,
        left: 42,
        width: 757,
        height: 259
      },
      {
        type: 'textbox',
        text: "Devenez",
        fontFamily: "Ubuntu",
        fontSize: 37.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 50,
        width: 757,
        height: 45
      },
      {
        type: 'textbox',
        text: "Une profession du futur qui vous apportera la carrière de vos rêves",
        fontFamily: "Ubuntu",
        fontSize: 21.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 130,
        left: 313,
        width: 757,
        height: 54,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-11",
    name: "L'art de la fermentation",
    cw: 757,
    ch: 365,
    elements: [
      {
        type: 'textbox',
        text: "L'art de la fermentation",
        fontFamily: "Fredoka",
        fontSize: 85.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 20,
        lineHeight: 0.99,
        left: 52,
        width: 757,
        height: 186,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "section 1.2",
        fontFamily: "Quicksand",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 50,
        width: 757,
        height: 38,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "La fermentation est un processus métabolique qui convertit le sucre en acides et en gaz. Il survient dans les levures et les bactéries, ainsi que dans les cellules présentant un manque d'oxygène dans les muscles, comme dans le cas de l'acide lactique.",
        fontFamily: "Quicksand",
        fontSize: 21.33,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 30,
        left: 253,
        width: 757,
        height: 112
      }
    ]
  },
  {
    id: "canva-12",
    name: "Dr. \nAdrien\nPasquet",
    cw: 757,
    ch: 365,
    elements: [
      {
        type: 'textbox',
        text: "Dr. \nAdrien\nPasquet",
        fontFamily: "Alfa Slab One",
        fontSize: 85.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 10,
        lineHeight: 0.97,
        width: 757,
        height: 266,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "12 rue de la paix, \n33 000 Bordeaux",
        fontFamily: "Source Sans Pro",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#222222",
        charSpacing: 50,
        left: 283,
        width: 757,
        height: 82
      }
    ]
  },
  {
    id: "canva-13",
    name: "L'architecture est un art",
    cw: 757,
    ch: 368,
    elements: [
      {
        type: 'textbox',
        text: "L'architecture est un art visuel, et les édifices en parlent d'eux-mêmes.",
        fontFamily: "Abril Fatface",
        fontSize: 74.67,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 10,
        lineHeight: 0.99,
        width: 757,
        height: 308
      },
      {
        type: 'textbox',
        text: "- Julia Morgan",
        fontFamily: "Montserrat",
        fontSize: 31,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 110,
        lineHeight: 1.2,
        left: 330,
        width: 757,
        height: 38
      }
    ]
  },
  {
    id: "canva-14",
    name: "La photographie \nd'alyssa",
    cw: 789,
    ch: 289,
    elements: [
      {
        type: 'textbox',
        text: "La photographie \nd'alyssa",
        fontFamily: "Montserrat",
        fontSize: 82.8,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: -68,
        lineHeight: 1.08,
        left: 25,
        width: 789,
        height: 194,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Découvrez maintenant",
        fontFamily: "Montserrat",
        fontSize: 20.7,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 110,
        top: 14,
        width: 757,
        height: 25,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Retrouvez mon portfolio à\nwww.portfoliodalyssa.com",
        fontFamily: "Montserrat",
        fontSize: 18.1,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 70,
        left: 241,
        top: 14,
        width: 757,
        height: 48
      }
    ]
  },
  {
    id: "canva-15",
    name: "Le",
    cw: 1123,
    ch: 492,
    elements: [
      {
        type: 'textbox',
        text: "Le",
        fontFamily: "DM Sans",
        fontSize: 73.16,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#df2c9a",
        textAlign: "end",
        left: 25,
        width: 342,
        height: 87,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Digital",
        fontFamily: "DM Sans",
        fontSize: 184.49,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#3c0f78",
        textAlign: "center",
        lineHeight: 0.92,
        left: 199,
        width: 958,
        height: 221,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Loft",
        fontFamily: "Great Vibes",
        fontSize: 212.74,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#df2c9a",
        lineHeight: 0.53,
        top: 297,
        width: 661,
        height: 309
      }
    ]
  },
  {
    id: "canva-16",
    name: "\"Les gens passent la jour",
    cw: 775,
    ch: 601,
    elements: [
      {
        type: 'textbox',
        text: "\"Les gens passent la journée à bronzer et la nuit à danser.\"",
        fontFamily: "Amatic SC",
        fontSize: 96,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 20,
        lineHeight: 0.95,
        left: 227,
        width: 757,
        height: 297,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Vous cherchez une \"nouvelle Ibiza\"? Florianopolis est la deuxième plus grande ville de l'État de Santa Catarina et le centre de la nuit et de la musique brésiliennes.",
        fontFamily: "Sacramento",
        fontSize: 42.67,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        top: 18,
        width: 757,
        height: 227
      },
      {
        type: 'textbox',
        text: "vous devez absolument passer par le Tropicana Beach Club et savourer votre sangria au bord de l’océan.",
        fontFamily: "Glacial Indifference",
        fontSize: 18.67,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 170,
        left: 553,
        width: 757,
        height: 48,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-17",
    name: "Venez soutenir l'équipe d",
    cw: 568,
    ch: 336,
    elements: [
      {
        type: 'textbox',
        text: "Venez soutenir l'équipe de france",
        fontFamily: "Raleway",
        fontSize: 24,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 110,
        width: 551,
        height: 28,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Allez les bleus !",
        fontFamily: "Exo 2",
        fontSize: 96,
        fontWeight: 900,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 10,
        lineHeight: 0.92,
        left: 41,
        top: 30,
        width: 519,
        height: 203,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Retrouvez-nous Mardi 15 Mars 2020 pour \nune soirée exceptionnelle",
        fontFamily: "Raleway",
        fontSize: 28,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 20,
        left: 263,
        top: 10,
        width: 559,
        height: 72
      }
    ]
  },
  {
    id: "canva-18",
    name: "2e SEMESTRE",
    cw: 757,
    ch: 243,
    elements: [
      {
        type: 'textbox',
        text: "2e SEMESTRE",
        fontFamily: "Raleway",
        fontSize: 96,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: -10,
        lineHeight: 0.9,
        left: 58,
        width: 757,
        height: 115
      },
      {
        type: 'textbox',
        text: "Symétrie Globale S.A.R.L.",
        fontFamily: "Libre Baskerville",
        fontSize: 37.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 30,
        width: 757,
        height: 45
      },
      {
        type: 'textbox',
        text: "INFORMATIONS DE VENTE",
        fontFamily: "Raleway",
        fontSize: 28,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 140,
        left: 209,
        width: 757,
        height: 33,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-19",
    name: "Félicitations à",
    cw: 791,
    ch: 300,
    elements: [
      {
        type: 'textbox',
        text: "Félicitations à",
        fontFamily: "Source Sans Pro",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 80,
        width: 757,
        height: 38,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Christophe Fournier",
        fontFamily: "Source Serif Pro",
        fontSize: 85.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "end",
        lineHeight: 1.05,
        left: 66,
        width: 791,
        height: 102
      },
      {
        type: 'textbox',
        text: "Pour sa participation au séminaire de l'association de charpenterie  et pour sa performance exemplaire lors des cours dispensés",
        fontFamily: "Source Sans Pro",
        fontSize: 24,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 20,
        left: 205,
        width: 757,
        height: 94,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-20",
    name: "Agent Immobilier",
    cw: 813,
    ch: 399,
    elements: [
      {
        type: 'textbox',
        text: "Agent Immobilier",
        fontFamily: "Josefin Sans",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 30,
        lineHeight: 1.21,
        width: 600,
        height: 38,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Jean \nLa maison",
        fontFamily: "Limelight",
        fontSize: 96,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#222222",
        lineHeight: 1.06,
        left: 60,
        top: 3,
        width: 810,
        height: 215,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "913-351-745\nj.lamaison@immo.com\nimmo.com",
        fontFamily: "Josefin Sans",
        fontSize: 28,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        charSpacing: 40,
        lineHeight: 1.26,
        left: 295,
        top: 1,
        width: 600,
        height: 103
      }
    ]
  },
  {
    id: "canva-21",
    name: "Vous méritez le meilleur,",
    cw: 722,
    ch: 401,
    elements: [
      {
        type: 'textbox',
        text: "Vous méritez le meilleur,",
        fontFamily: "Playfair Display",
        fontSize: 32,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 30,
        top: 33,
        width: 657,
        height: 38
      },
      {
        type: 'textbox',
        text: "Bonne fête \ndes mères !",
        fontFamily: "Playfair Display",
        fontSize: 117.33,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        lineHeight: 0.96,
        left: 52,
        top: 75,
        width: 572,
        height: 252
      },
      {
        type: 'textbox',
        text: "Prenez le temps de vous reposer et de profiter de tous ceux que vous aimez",
        fontFamily: "Playfair Display",
        fontSize: 28,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 20,
        left: 328,
        width: 722,
        height: 72
      }
    ]
  },
  {
    id: "canva-22",
    name: "Recettes pour \nla saint-v",
    cw: 757,
    ch: 502,
    elements: [
      {
        type: 'textbox',
        text: "Recettes pour \nla saint-valentin",
        fontFamily: "Josefin Sans",
        fontSize: 56,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#222222",
        textAlign: "center",
        charSpacing: -20,
        lineHeight: 0.97,
        left: 317,
        width: 757,
        height: 121,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "14",
        fontFamily: "Lora",
        fontSize: 296,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 100,
        width: 757,
        height: 355,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "www.sitevraimentgenial.com",
        fontFamily: "Lora",
        fontSize: 21.33,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#222222",
        textAlign: "center",
        charSpacing: 40,
        left: 477,
        width: 757,
        height: 25
      }
    ]
  },
  {
    id: "canva-23",
    name: "steak night",
    cw: 517,
    ch: 423,
    elements: [
      {
        type: 'textbox',
        text: "steak night",
        fontFamily: "Playfair Display",
        fontSize: 130,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 100,
        lineHeight: 1.1,
        left: 57,
        width: 517,
        height: 299,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Fridays 6:30pm - 10pm",
        fontFamily: "Playfair Display",
        fontSize: 30,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 100,
        lineHeight: 1.45,
        left: 387,
        width: 517,
        height: 35
      },
      {
        type: 'textbox',
        text: "Join us every end of the week!",
        fontFamily: "Playfair Display",
        fontSize: 30,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 45,
        lineHeight: 1.45,
        width: 517,
        height: 35
      }
    ]
  },
  {
    id: "canva-24",
    name: "valence",
    cw: 622,
    ch: 205,
    elements: [
      {
        type: 'textbox',
        text: "valence",
        fontFamily: "Libre Baskerville",
        fontSize: 93.42,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 195,
        lineHeight: 1.13,
        left: 42,
        width: 566,
        height: 101,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "cabernet malec",
        fontFamily: "Libre Baskerville",
        fontSize: 17.58,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 443,
        width: 566,
        height: 19,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "square de la couronne",
        fontFamily: "Libre Baskerville",
        fontSize: 17.58,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 443,
        left: 168,
        width: 566,
        height: 19,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-25",
    name: "Virtual",
    cw: 838,
    ch: 442,
    elements: [
      {
        type: 'textbox',
        text: "Virtual",
        fontFamily: "Shrikhand",
        fontSize: 147.53,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#ffffff",
        lineHeight: 1.1,
        width: 406,
        height: 113
      },
      {
        type: 'textbox',
        text: "Cocktail\nHour",
        fontFamily: "Shrikhand",
        fontSize: 184.26,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#ffffff",
        lineHeight: 0.81,
        left: 73,
        width: 838,
        height: 370
      }
    ]
  },
  {
    id: "canva-26",
    name: "dazzle",
    cw: 800,
    ch: 238,
    elements: [
      {
        type: 'textbox',
        text: "dazzle",
        fontFamily: "Glacial Indifference",
        fontSize: 108.3,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 200,
        lineHeight: 1.2,
        width: 629,
        height: 107,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "eau de parfum",
        fontFamily: "Glacial Indifference",
        fontSize: 60.17,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 200,
        lineHeight: 1.2,
        left: 127,
        top: 24,
        width: 580,
        height: 60
      }
    ]
  },
  {
    id: "canva-27",
    name: "Item",
    cw: 737,
    ch: 196,
    elements: [
      {
        type: 'textbox',
        text: "Item",
        fontFamily: "Glacial Indifference",
        fontSize: 35.57,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 52,
        lineHeight: 1.2,
        width: 315,
        height: 27,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Flamingo Print Pillow Case\nGold Foil Pillow Case\nPolka Dots Fitted Sheet",
        fontFamily: "Glacial Indifference",
        fontSize: 34.03,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        lineHeight: 1.36,
        left: 41,
        width: 315,
        height: 86
      },
      {
        type: 'textbox',
        text: "Price",
        fontFamily: "Glacial Indifference",
        fontSize: 21.15,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 52,
        lineHeight: 1.2,
        top: 335,
        width: 141,
        height: 26,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "$60.00\n$65.00\n$80.00",
        fontFamily: "Glacial Indifference",
        fontSize: 34.03,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        lineHeight: 1.36,
        left: 41,
        top: 335,
        width: 141,
        height: 86
      }
    ]
  },
  {
    id: "canva-28",
    name: "xocolat atelier",
    cw: 621,
    ch: 346,
    elements: [
      {
        type: 'textbox',
        text: "xocolat atelier",
        fontFamily: "Playfair Display",
        fontSize: 98,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        lineHeight: 1.11,
        left: 66,
        width: 621,
        height: 225,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "The",
        fontFamily: "Playfair Display",
        fontSize: 55,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        lineHeight: 1.14,
        width: 621,
        height: 65
      },
      {
        type: 'textbox',
        text: "est. 1984",
        fontFamily: "Montserrat",
        fontSize: 30,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 191,
        lineHeight: 1.19,
        left: 311,
        width: 621,
        height: 35,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-29",
    name: "PIVOT",
    cw: 1771,
    ch: 359,
    elements: [
      {
        type: 'textbox',
        text: "PIVOT",
        fontFamily: "Libre Baskerville",
        fontSize: 799.87,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#102f76",
        textAlign: "center",
        charSpacing: -165,
        lineHeight: 0.82,
        width: 781,
        height: 158,
        angle: 0,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "strategy",
        fontFamily: "Work Sans",
        fontSize: 156.97,
        fontWeight: 300,
        fontStyle: "normal",
        fill: "#102f76",
        textAlign: "center",
        lineHeight: 0.82,
        left: 64,
        top: 433,
        width: 153,
        height: 31,
        angle: 0,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-30",
    name: "this",
    cw: 1736,
    ch: 575,
    elements: [
      {
        type: 'textbox',
        text: "this",
        fontFamily: "Arimo",
        fontSize: 290.67,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#d1c4e9",
        lineHeight: 0.85,
        width: 1736,
        height: 349
      },
      {
        type: 'textbox',
        text: "week>",
        fontFamily: "Arimo",
        fontSize: 290.67,
        fontWeight: 700,
        fontStyle: "italic",
        fill: "#1d1d1d",
        lineHeight: 0.85,
        left: 226,
        width: 1736,
        height: 349
      }
    ]
  },
  {
    id: "canva-31",
    name: "I don't say it nearly eno",
    cw: 594,
    ch: 548,
    elements: [
      {
        type: 'textbox',
        text: "I don't say it nearly enough but thank you for all you've done for me in my life and everything you still do.",
        fontFamily: "Playfair Display",
        fontSize: 23,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#000000",
        textAlign: "center",
        lineHeight: 1.49,
        width: 594,
        height: 61
      },
      {
        type: 'textbox',
        text: "Happy Mother’s Day!",
        fontFamily: "Playfair Display",
        fontSize: 110,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 8,
        left: 93,
        width: 594,
        height: 385
      },
      {
        type: 'textbox',
        text: "All the love from James & Jaclyn",
        fontFamily: "Playfair Display",
        fontSize: 29,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#000000",
        textAlign: "center",
        lineHeight: 1.36,
        left: 514,
        width: 594,
        height: 34
      }
    ]
  },
  {
    id: "canva-32",
    name: "Title",
    cw: 888,
    ch: 439,
    elements: [
      {
        type: 'textbox',
        text: "Title",
        fontFamily: "Lato",
        fontSize: 128,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        lineHeight: 1,
        width: 888,
        height: 202
      },
      {
        type: 'textbox',
        text: "Heading",
        fontFamily: "Lato",
        fontSize: 50.73,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 43,
        lineHeight: 1.1,
        left: 246,
        width: 888,
        height: 79,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Paragraph",
        fontFamily: "Lato",
        fontSize: 37.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        left: 380,
        width: 888,
        height: 59
      }
    ]
  },
  {
    id: "canva-33",
    name: "Heading",
    cw: 888,
    ch: 194,
    elements: [
      {
        type: 'textbox',
        text: "Heading",
        fontFamily: "Lato",
        fontSize: 50.73,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 43,
        lineHeight: 1.1,
        width: 888,
        height: 79,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Paragraph",
        fontFamily: "Lato",
        fontSize: 37.33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        left: 135,
        width: 888,
        height: 59
      }
    ]
  },
  {
    id: "canva-34",
    name: "Todo lo que necesitas es",
    cw: 790,
    ch: 338,
    elements: [
      {
        type: 'textbox',
        text: "Todo lo que necesitas es amor.\nPero un poco de chocolate de vez en cuando no hace daño.",
        fontFamily: "Glass Antiqua",
        fontSize: 66.67,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        lineHeight: 1.28,
        width: 604,
        height: 191
      },
      {
        type: 'textbox',
        text: "Charles M. Schulz",
        fontFamily: "Josefin Sans",
        fontSize: 24.41,
        fontWeight: 700,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "center",
        charSpacing: 229,
        left: 236,
        top: 12,
        width: 580,
        height: 22,
        textTransform: "uppercase"
      }
    ]
  },
  {
    id: "canva-35",
    name: "I can't say I do without",
    cw: 621,
    ch: 352,
    elements: [
      {
        type: 'textbox',
        text: "I can't say I do without you!",
        fontFamily: "Lora",
        fontSize: 85,
        fontWeight: 400,
        fontStyle: "italic",
        fill: "#000000",
        textAlign: "start",
        lineHeight: 1.2,
        width: 621,
        height: 203
      },
      {
        type: 'textbox',
        text: "Please join me for a bridal brunch as a token of appreciation for being my bridesmaids",
        fontFamily: "Montserrat",
        fontSize: 23.3,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 75,
        lineHeight: 1.6,
        left: 250,
        width: 481,
        height: 102
      }
    ]
  },
  {
    id: "canva-36",
    name: "Mis Quince Años",
    cw: 549,
    ch: 258,
    elements: [
      {
        type: 'textbox',
        text: "Mis Quince Años",
        fontFamily: "Libre Baskerville",
        fontSize: 63,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 51,
        lineHeight: 1.05,
        width: 549,
        height: 80
      },
      {
        type: 'textbox',
        text: "isla rivera",
        fontFamily: "Libre Baskerville",
        fontSize: 33,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 210,
        lineHeight: 1.25,
        left: 100,
        width: 549,
        height: 39,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "5 o'clock in the afternoon, at the hermosa palaces, brown street, vista, ca 92083",
        fontFamily: "Libre Baskerville",
        fontSize: 19,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 109,
        lineHeight: 1.75,
        left: 204,
        width: 549,
        height: 54
      }
    ]
  },
  {
    id: "canva-37",
    name: "freundschaft bridge",
    cw: 522,
    ch: 352,
    elements: [
      {
        type: 'textbox',
        text: "freundschaft bridge",
        fontFamily: "Lato",
        fontSize: 30.77,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 186,
        lineHeight: 1.17,
        width: 522,
        height: 37,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "Located in the heart of Germany",
        fontFamily: "Libre Baskerville",
        fontSize: 21.15,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 54,
        lineHeight: 1.17,
        left: 51,
        width: 522,
        height: 27
      },
      {
        type: 'textbox',
        text: "Balkan worked with Polygon Studio to design a classically structured bridge that would easily fit in with the visual aesthetic of the city. The underside of the bridge was repurposed as a walkway.",
        fontFamily: "Lato",
        fontSize: 26.92,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        charSpacing: 46,
        lineHeight: 1.39,
        left: 127,
        width: 522,
        height: 226
      }
    ]
  },
  {
    id: "canva-38",
    name: "02",
    cw: 466,
    ch: 84,
    elements: [
      {
        type: 'textbox',
        text: "02",
        fontFamily: "Oswald",
        fontSize: 63,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "end",
        charSpacing: 10,
        lineHeight: 1.2,
        width: 105,
        height: 84
      },
      {
        type: 'textbox',
        text: "Editor's Note\nSasha L. Houston",
        fontFamily: "Glacial Indifference",
        fontSize: 28,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "start",
        lineHeight: 1.15,
        left: 9,
        top: 130,
        width: 336,
        height: 64
      }
    ]
  },
  {
    id: "canva-39",
    name: "project",
    cw: 460,
    ch: 223,
    elements: [
      {
        type: 'textbox',
        text: "project",
        fontFamily: "Montserrat",
        fontSize: 15.8,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "end",
        charSpacing: 229,
        lineHeight: 1.35,
        width: 460,
        height: 29,
        textTransform: "uppercase"
      },
      {
        type: 'textbox',
        text: "website design & development for infinite brewing company",
        fontFamily: "Montserrat",
        fontSize: 19.6,
        fontWeight: 400,
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "end",
        charSpacing: 216,
        left: 59,
        width: 460,
        height: 164,
        textTransform: "uppercase"
      }
    ]
  }
];

/** Collect unique font families from a preset */
export function canvaFonts(p: CanvaPreset): string[] {
  const s = new Set<string>();
  for (const e of p.elements) if (e.fontFamily) s.add(e.fontFamily);
  return [...s];
}
