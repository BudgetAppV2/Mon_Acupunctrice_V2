Matched preset names

- `Le Passé Vous Va Si Bien`
- `Le Lab Bas-Carbone`
- `ÉCOlogique`
- `Le cercle végétal`
- `Expression Libre`
- `Valence`

Fonts applied from mapping

- `Le Passé Vous Va Si Bien`: `Lucy Rose` (Regular, 400) for `LE PASSÉ` and `VOUS VA`; `Bright Sight Script` (Italic, 400) for `si bien`.
- `Le Lab Bas-Carbone`: `Knockout Sumo` (34, 400) for `LE LAB`; `Placard Next Wide` (Wide Bold, 700) for `Bas-Carbone`.
- `ÉCOlogique`: `TAN St. Canard` (Heavy, 850) for `ÉCO`; `Ahsing` (Regular, 400) for `logique`.
- `Le cercle végétal`: `Radnika Next Condensed` (Bold Condensed, 700) for `LE CERCLE`; `Calps Sans` (Regular Italic, 400) for `végétal`.
- `Expression Libre`: `Cooperative` (Regular, 400) for `EXPRESSION`; `Posey Textured` (Italic, 400) for `LIBRE`.
- `Valence`: `Libre Baskerville` (Regular, 400) applied to the full block because the PDF exposes this preset as a single-font mapping.

Unresolved presets

- None at the preset-title level.

Remaining approximations

- The SVG contains outlined typography only; all textboxes remain reconstructed from path geometry, not original live text nodes.
- `Valence` includes ancillary microcopy (`AUBERGE CLASSIQUE`, `PLACE DE LA COURONNE`) that does not appear anywhere in the PDF mapping. To avoid visual font guessing, those lines were assigned the official mapped family `Libre Baskerville`.
- Decorative geometry stays SVG-driven. The aqua banner and orange tag are preserved as rotated Fabric rects derived from the SVG path geometry.
- Character spacing and textbox widths remain geometry-based approximations so the editable Fabric output stays aligned with the original SVG layout.
