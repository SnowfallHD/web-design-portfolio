# Asset notes

- `pulseforge-hyperreal-gym.webp` / `pulseforge-hyperreal-gym.png`
  - Source: generated specifically for this portfolio with Hermes image generation on 2026-06-16.
  - Prompt intent: one cohesive photoreal premium performance gym interior, no people, PulseForge branding, turf lane, racks, conditioning and recovery equipment.
  - Use: legacy PulseForge preview visual plate.

- `pulseforge-sequence-01-entrance.webp` through `pulseforge-sequence-06-cta.webp`
  - Source: generated specifically for this portfolio on 2026-06-18 as a coherent 2.5D fallback when no continuous fly-through video/source sequence was available in the environment.
  - Prompt intent: same premium PulseForge performance club, same palette/lens/lighting/materials/signage, moving entrance → turf lane → strength zone → conditioning zone → recovery area → trial-pass desk.
  - Use: fallback PulseForge scroll-scrubbed cinematic media layer if the provided video cannot load.

- `pulseforge-flythrough.mp4` / `pulseforge-flythrough-poster.webp` / `pulseforge-flythrough-frames/frame-001.webp` through `frame-300.webp`
  - Source: user-provided flythrough video attachment on 2026-06-20, optimized locally with ffmpeg for web playback: muted H.264 MP4, no audio, faststart, 12-frame keyframes for scroll seeking; additionally exported to 300 WebP frames at 25 fps for smooth scroll-scrubbed rendering even when visitors scroll slowly.
  - Visual content: continuous premium PulseForge-style gym flythrough, recovery bay / loaded barbells / rack lane / red flywheel wall / front desk handoff.
  - Use: primary PulseForge sticky-scroll cinematic media layer; browser code scrubs a high-frame-rate user-video-derived sequence from modal scroll progress, with eased progress and adjacent-frame blending; the MP4 is retained as the source media asset.

- `orbit-product-*.webp`
  - Source: generated specifically for this portfolio on 2026-06-18.
  - Prompt intent: consistent premium technical ecommerce product photography for Orbit Supply catalog cards, dark graphite background, cyan rim light, no text/logos.
  - Use: product images for the expanded Orbit Supply ecommerce catalog.

Existing `*-*.webp` brand images are project-bundled generated/demo imagery for portfolio examples.
