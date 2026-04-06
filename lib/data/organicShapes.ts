/**
 * Organic SVG shapes for the image editor.
 * Each shape is a path data string for Fabric.js Path.
 */

export interface OrganicShape {
  id: string;
  name: string;
  pathData: string;
  viewBox: string;
  defaultFill: string;
}

export const ORGANIC_SHAPES: OrganicShape[] = [
  {
    id: 'blob-turquoise',
    name: 'Blob',
    viewBox: '0 0 200 200',
    defaultFill: '#7EBEC5',
    pathData: 'M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.4,29,72.5,41.1C63.6,53.2,51.4,62.9,37.7,69.8C24,76.7,8.8,80.8,-5.4,79.4C-19.6,78,-33.2,71.1,-45.8,62.7C-58.4,54.3,-70,44.4,-76.4,31.5C-82.8,18.6,-84,2.7,-81.2,-12.1C-78.4,-26.9,-71.6,-40.6,-61.1,-49.2C-50.6,-57.8,-36.4,-61.3,-23,-65.6C-9.6,-69.9,2.9,-75,16.4,-77.6C29.9,-80.2,44.4,-80.3,44.7,-76.4Z',
  },
  {
    id: 'wave-horizontal',
    name: 'Vague',
    viewBox: '0 0 400 120',
    defaultFill: '#AAD1D2',
    pathData: 'M0,60 C50,20 100,100 150,60 C200,20 250,100 300,60 C350,20 400,80 400,60 L400,120 L0,120 Z',
  },
  {
    id: 'leaf-stylized',
    name: 'Feuille',
    viewBox: '0 0 200 200',
    defaultFill: '#5C7A5F',
    pathData: 'M100,10 C130,10 180,50 185,100 C190,150 150,190 100,190 C50,190 20,150 20,100 C20,60 40,30 70,20 C80,16 90,12 100,10 Z M100,40 C90,50 60,70 55,100 C50,130 70,160 100,165',
  },
  {
    id: 'water-drop',
    name: 'Goutte',
    viewBox: '0 0 160 200',
    defaultFill: '#7EBEC5',
    pathData: 'M80,10 C80,10 145,90 145,130 C145,166 116,195 80,195 C44,195 15,166 15,130 C15,90 80,10 80,10 Z',
  },
  {
    id: 'organic-circle',
    name: 'Cercle organique',
    viewBox: '0 0 200 200',
    defaultFill: '#AAD1D2',
    pathData: 'M100,15 C130,12 160,30 175,55 C190,80 195,110 180,140 C165,170 140,190 110,192 C80,194 50,180 30,155 C10,130 5,95 15,65 C25,35 55,18 100,15 Z',
  },
  {
    id: 'arc-circle',
    name: 'Arc',
    viewBox: '0 0 200 200',
    defaultFill: '#3D7A8A',
    pathData: 'M30,170 C30,90 70,30 130,20 C160,15 185,30 190,55 C180,35 155,25 130,30 C80,42 45,95 45,165 Z',
  },
];
