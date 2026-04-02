# FIX — Rendu du waveform audio avec fade en forme de triangle

## Problème actuel
Les fades sur le waveform sont rendus en changeant l'opacité des barres
individuelles. C'est approximatif et pas très visuel. L'utilisateur
veut un rendu qui ressemble à un vrai fade audio — un triangle.

## Rendu attendu
Le waveform doit montrer visuellement les fades comme dans un vrai
éditeur audio. Chaque barre du waveform est MULTIPLIÉ par l'enveloppe
de fade, pas juste l'opacité.

### Fade-in (triangle à gauche)
```
         ┌─┐┌─┐
      ┌─┐│ ││ │┌─┐┌─┐┌─┐
   ┌─┐│ ││ ││ ││ ││ ││ │
┌─┐│ ││ ││ ││ ││ ││ ││ │
│ ││ ││ ││ ││ ││ ││ ││ │
──────────────────────────
◄─ fade-in ─►
```
La HAUTEUR de chaque barre est multipliée par un facteur linéaire
qui va de 0 (bord gauche) à 1 (fin du fade-in). Ça crée une
enveloppe en forme de rampe/triangle.

### Fade-out (triangle à droite)
```
┌─┐┌─┐
│ ││ │┌─┐┌─┐
│ ││ ││ ││ │┌─┐
│ ││ ││ ││ ││ │┌─┐
│ ││ ││ ││ ││ ││ │
──────────────────
           ◄─ fade-out ─►
```

## Implémentation dans AudioWaveform.tsx

Dans le dessin des barres, au lieu de changer l'alpha du fillStyle,
changer la HAUTEUR de la barre :

```typescript
for (let i = 0; i < visibleBars; i++) {
  const a = amplitudes[i] ?? 0;
  
  // Calculate fade envelope (multiplier on bar HEIGHT, not alpha)
  let envelope = 1;
  if (fadeInBars > 0 && i < fadeInBars) {
    envelope = i / fadeInBars; // 0 → 1 (ramp up)
  }
  if (fadeOutBars > 0 && i >= visibleBars - fadeOutBars) {
    envelope = Math.min(envelope, (visibleBars - 1 - i) / fadeOutBars); // 1 → 0 (ramp down)
  }
  
  // Bar height = amplitude × envelope
  const barH = Math.max(1, a * envelope * height * 0.9);
  
  // Constant alpha for all bars (no opacity changes)
  ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
  ctx.fillRect(i * barW, (height - barH) / 2, Math.max(1, barW - 0.5), barH);
}
```

L'enveloppe multiplie la hauteur de la barre, pas l'opacité.
Résultat visuel : les barres dans la zone de fade sont plus courtes,
créant un profil en triangle qui correspond visuellement au volume
du fade audio.

## Fichier à modifier
- `components/features/editor-v2/AudioWaveform.tsx` — drawWaveform()

## Definition of Done
- [ ] Les barres dans la zone de fade-in sont progressivement plus hautes
      (triangle montant de gauche à droite)
- [ ] Les barres dans la zone de fade-out sont progressivement plus courtes
      (triangle descendant vers la droite)
- [ ] Les barres hors des zones de fade gardent leur hauteur normale
- [ ] L'opacité est constante pour toutes les barres (pas de changement d'alpha)
- [ ] Les fade handles restent fonctionnels
- [ ] npm run build passe
