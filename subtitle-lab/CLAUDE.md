# CLAUDE.md — Subtitle Lab Handoff

## Project overview

Subtitle Lab is a **standalone Next.js 16 app** inside the `subtitle-lab/` subdirectory of the Mon_Acupunctrice_V2 repo (`feature/subtitle-lab` branch). It's a mobile-first animated subtitle design tool, deployed on Vercel at `https://subtitle-lab.vercel.app`.

**Long-term vision**: This lab will evolve into a full video editor replacement for the current Mon Acupunctrice Hub V2 editor. Features are added one bottom sheet at a time.

## Current architecture

### Stack
- Next.js 16.2.1 (Turbopack), React 19, Zustand 5, Tailwind 3, @heroicons/react
- Canvas 2D renderer with RAF loop (60fps)
- WebGL 2.0 LUT renderer (3D texture, fragment shader)
- Deployed via Vercel CLI from `subtitle-lab/` subdirectory

### File structure
```
subtitle-lab/
├── app/
│   ├── layout.tsx          # Google Fonts (12 families), metadata
│   ├── page.tsx            # Main layout, Toolbar, multi-sheet system
│   └── globals.css
├── components/
│   ├── BottomSheet.tsx     # Reusable sheet (isOpen/onClose props, 40dvh, backdrop)
│   ├── ControlPanel.tsx    # Subtitle style controls (font, size, colors, animation)
│   ├── FilterPanel.tsx     # CSS filters + WebGL LUTs panel
│   ├── PresetGallery.tsx   # Horizontal preset pills (routes to block or global)
│   ├── SubtitleCanvas.tsx  # Canvas renderer + drag-to-reposition + CSS filter + LUT
│   └── Timeline.tsx        # Scrubber + block track (touch-enabled)
├── lib/
│   ├── animations.ts       # Word-by-word animation functions (8 types)
│   ├── controlOptions.ts   # Font families list, animation type labels
│   ├── filters.ts          # 10 CSS filter presets
│   ├── luts/
│   │   ├── lutParser.ts    # .cube file parser + generateLut()
│   │   ├── lutRenderer.ts  # WebGL 2.0 3D LUT renderer (applyLut/destroyLutRenderer)
│   │   └── presets.ts      # 6 programmatic LUT presets + cache
│   ├── presets.ts          # 8 subtitle style presets
│   ├── renderer.ts         # Canvas 2D subtitle renderer (renderFrame)
│   ├── store.ts            # Zustand store (subtitle state + filter/LUT state)
│   ├── testData.ts         # 6 test subtitle blocks (acupuncture theme)
│   └── types.ts            # TypeScript types
```

### Key patterns

**Multi-sheet architecture**: `page.tsx` manages a `SheetId` state (`'sub' | 'filter' | null`). Each tool icon in the toolbar toggles its sheet. Only one sheet open at a time. Adding a new sheet = new SheetId value + icon in Toolbar + BottomSheet instance in Page.

**Per-block editing**: When a subtitle block is selected in the Timeline, the ControlPanel and PresetGallery route changes to `updateBlock(id, overrides)` instead of `updateGlobalField`. Preset changes apply as overrides on the selected block only.

**Position persistence**: `setGlobalPreset` preserves `state.globalPreset.position` — preset changes never reset the subtitle position. Default position is `{ x: 0.5, y: 0.25 }` (top quarter).

**RAF loop (SubtitleCanvas)**: Uses refs to avoid stale closures. Reads `timeRef`, `blocksRef`, `presetRef`, `lutIdRef` etc. from synchronized refs. Calls `useSubtitleStore.getState()` directly for mutations. After 2D render, applies LUT via `applyLut()` in-place. CSS filter applied via canvas element `style.filter`.

**Vercel deploy workflow**: The project has `rootDirectory: subtitle-lab` in Vercel settings for auto-deploy from GitHub, but CLI deploys from inside the subdirectory. To deploy via CLI, you need to temporarily remove the rootDirectory via the Vercel API (project ID and team ID are in `.vercel/project.json`), deploy with `vercel --prod`, then restore rootDirectory. Use a fresh Vercel token (the previous one was revoked by GitHub secret scanning).

## Known issues

1. **LUT darkening bug**: In the main editor, LUTs sometimes added a dark overlay. The WebGL renderer copies result back via `sourceCtx.drawImage(canvas, 0, 0)` — verify that premultipliedAlpha:false is working correctly. May need testing with real video frames.
2. **letterSpacing**: Uses `ctx.letterSpacing` which requires modern browsers. Safari iOS 16.4+ supports it. Older devices will silently ignore.
3. **No auto-deploy**: Production branch on Vercel is still `main`, needs to be changed to `feature/subtitle-lab` in Vercel dashboard → Settings → Environments → Production.
4. **Vercel token revoked**: The previous CLI token was exposed in git history and revoked by GitHub secret scanning. Generate a new token at https://vercel.com/account/tokens and run `vercel login` again.

## Phase 2 plan — Video import + preview

### Goal
Replace the static gradient background with real video preview. User imports a video file, it plays in the canvas with subtitles overlaid, and the timeline shows the video duration.

### Implementation steps

#### M1: Video import + HTMLVideoElement
- Add a `videoFile` and `videoUrl` (blob URL) to the Zustand store
- Add an import button (e.g. in the toolbar or a new "Media" sheet)
- Create an `<input type="file" accept="video/*">` triggered by the button
- On file select: `URL.createObjectURL(file)` → store as `videoUrl`
- Create a hidden `<video>` element, set src to blobUrl, extract duration → update `store.duration`

#### M2: Video frame rendering in canvas
- In the RAF loop (`SubtitleCanvas.tsx`), instead of drawing the gradient background:
  - If `videoUrl` exists: draw the video frame with `ctx.drawImage(videoElement, 0, 0, CANVAS_W, CANVAS_H)`
  - If no video: keep the gradient (current behavior)
- Sync video currentTime with store currentTime: `videoElement.currentTime = timeRef.current / 1000`
- Use `requestVideoFrameCallback` if available for better frame sync, fallback to RAF
- The existing subtitle renderer draws ON TOP of the video frame — no changes needed to `renderFrame()`

#### M3: Play/pause sync
- When `isPlaying` changes: call `videoElement.play()` or `videoElement.pause()`
- When user scrubs timeline: set `videoElement.currentTime` directly
- Video `timeupdate` event updates `store.currentTime` during playback (or use RAF delta as currently done)

#### M4: Thumbnail generation for filter previews
- After video loads, seek to ~2s, draw frame to a small offscreen canvas (48×64)
- Store as `thumbnailUrl` (dataURL) in the store
- FilterPanel uses thumbnailUrl instead of gradient for filter/LUT thumbnails
- This matches the original editor behavior in `FilterPanel.tsx`

### Key reference code from the main editor
- `components/features/editor/VideoPreview.tsx` — how the main editor renders video
- `components/features/editor/panels/FilterPanel.tsx` — thumbnail-based filter previews
- `components/features/editor/panels/TrimPanel.tsx` — trim handles UI
- `lib/hooks/useVideoPlayback.ts` — if it exists, video sync logic

### Architecture notes
- The `<video>` element should be created as a ref in SubtitleCanvas, not rendered in DOM (hidden)
- Video decode happens automatically via the browser — no MediaSource API needed for import
- Canvas size stays 540×960 (9:16) — video is scaled to fit/cover
- Aspect ratio handling: if video is 16:9, letterbox or crop to fill 9:16 canvas

## Future phases (not for now)

### Phase 3 — Trim handles
- Add trim start/end to store, visual handles on timeline, clip playback range

### Phase 4 — Cover image
- Frame picker from video, text overlay for cover, export as image

### Phase 5 — Multi-track / transitions
- Multiple video tracks, transition effects between clips, audio track management

## Code from main editor to reference (NOT copy blindly)

The main Mon_Acupunctrice_V2 editor lives in the repo root. Relevant files:
- `lib/editor/subtitleEngine.ts` — 3 subtitle families (narratif, boldHighlight, minimalWellness)
- `lib/editor/subtitleStyles/` — individual family renderers
- `lib/data/designKnowledge.ts` — filters, design rules, video themes
- `lib/data/videoThemes.ts` — 8 video themes with accent colors
- `lib/editor/lutParser.ts` + `lutRenderer.ts` — ALREADY COPIED to subtitle-lab/lib/luts/
- `components/features/editor/` — all editor panels

The lab's subtitle system is MORE CAPABLE than the editor's (8 animations, word-level timing, per-block overrides) but uses different types. Long-term plan: lab types become the source of truth.

## Development commands
```bash
cd ~/Desktop/Mon_Acupunctrice_V2/subtitle-lab
npm run dev      # localhost:3001
npm run build    # verify before deploy
```
