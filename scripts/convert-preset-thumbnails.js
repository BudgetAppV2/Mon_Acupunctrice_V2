const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const mapping = require('../subtitle-lab/fabric-presets/canva-svg-page-mapping.json');

const ROOT_DIR = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT_DIR, 'subtitle-lab', 'fabric-presets', 'Votre texte de paragraphe');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'images', 'text-presets');
const OUTPUT_SVG_DIR = path.join(ROOT_DIR, 'public', 'images', 'text-presets-svg');

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_SVG_DIR, { recursive: true });

  await Promise.all(
    mapping.presets.map(async ({ pageNumber }) => {
      const inputFile = path.join(SVG_DIR, `${pageNumber}.svg`);
      const outputFile = path.join(OUTPUT_DIR, `preset-${pageNumber}.png`);
      const outputSvgFile = path.join(OUTPUT_SVG_DIR, `preset-${pageNumber}.svg`);

      await sharp(inputFile, { density: 192 })
        .flatten({ background: '#ffffff' })
        .trim({ background: '#ffffff' })
        .resize(360, 220, { fit: 'contain', background: '#ffffff' })
        .png()
        .toFile(outputFile);
      await fs.copyFile(inputFile, outputSvgFile);

      console.log(`Generated ${path.relative(ROOT_DIR, outputFile)}`);
    }),
  );

  console.log(`Done: ${mapping.presets.length} preset thumbnails and source SVGs`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
