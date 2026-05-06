#!/bin/bash
# batch-test.sh — Genere 6 variations pour stress-tester le POC

cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2

# Nettoyer outputs precedents (sauf debug)
rm -f content/visual-bank/_poc-output/cover-v3-*.png 2>/dev/null

echo "=== Generation 6 variations ==="
echo ""

node content/visual-bank/scripts/poc-compose.mjs grossesse "Acupuncture pendant la grossesse" 2>&1 | tail -3
echo "---"
node content/visual-bank/scripts/poc-compose.mjs pediatrie "Acupuncture pediatrique" 2>&1 | tail -3
echo "---"
node content/visual-bank/scripts/poc-compose.mjs fertilite "Fertilite et FIV" 2>&1 | tail -3
echo "---"
node content/visual-bank/scripts/poc-compose.mjs anxiete-sommeil "Anxiete et sommeil" 2>&1 | tail -3
echo "---"
node content/visual-bank/scripts/poc-compose.mjs menopause "Menopause et sante des femmes" 2>&1 | tail -3
echo "---"
node content/visual-bank/scripts/poc-compose.mjs acupuncture-sociale "Acupuncture sociale" 2>&1 | tail -3
echo ""
echo "=== Done ==="
echo "Toutes les images dans : content/visual-bank/_poc-output/"
echo "Pour tout voir : open content/visual-bank/_poc-output/"
