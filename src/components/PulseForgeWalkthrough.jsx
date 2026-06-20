import React, { useEffect, useMemo, useState } from 'react';

export const PULSEFORGE_FLYTHROUGH = {
  src: '/brand-images/pulseforge-flythrough.mp4',
  poster: '/brand-images/pulseforge-flythrough-poster.webp',
  duration: 12,
  frameCount: 48,
};

const framePath = (index) => `/brand-images/pulseforge-flythrough-frames/frame-${String(index + 1).padStart(2, '0')}.webp`;

export const WALKTHROUGH_FRAMES = Array.from({ length: PULSEFORGE_FLYTHROUGH.frameCount }, (_, index) => ({
  name: 'PulseForge flythrough',
  copy: 'Scroll-scrubbed frame from the provided PulseForge gym flythrough video.',
  src: framePath(index),
  focus: '50% 50%',
}));

const clamp = (value) => Math.max(0, Math.min(1, value));

function segmentForProgress(progress) {
  const p = clamp(progress);
  const last = WALKTHROUGH_FRAMES.length - 1;
  const scaled = p * last;
  const index = Math.min(last, Math.floor(scaled));
  const nextIndex = Math.min(last, index + 1);
  const local = index === last ? 1 : scaled - index;
  const blend = clamp((local - 0.45) / 0.55);
  return { index, nextIndex, local, blend };
}

export function zoneForProgress(progress) {
  const { index } = segmentForProgress(progress);
  return { ...WALKTHROUGH_FRAMES[index], index, beats: WALKTHROUGH_FRAMES };
}

function frameStyle(frame, opacity, progress, local, direction = 1) {
  const travel = (local - 0.5) * direction;
  const scale = 1.006 + progress * 0.015 + clamp(local) * 0.006;
  return {
    opacity,
    '--frame-focus': frame.focus,
    '--frame-scale': scale,
    '--frame-x': `${(progress - 0.5) * -0.7 + travel * 0.45}%`,
    '--frame-y': `${Math.sin(progress * Math.PI) * -0.35}%`,
  };
}

export default function PulseForgeWalkthrough({ active = false, scrollProgress = 0 }) {
  const [preloaded, setPreloaded] = useState(false);
  const [reduced, setReduced] = useState(false);
  const p = clamp(active ? scrollProgress : 0);
  const { index, nextIndex, local, blend } = useMemo(() => segmentForProgress(reduced ? 1 : p), [p, reduced]);
  const zone = WALKTHROUGH_FRAMES[index];
  const next = WALKTHROUGH_FRAMES[nextIndex];
  const finalReveal = p > 0.88;

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const set = () => setReduced(Boolean(mq?.matches));
    set();
    mq?.addEventListener?.('change', set);
    return () => mq?.removeEventListener?.('change', set);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loads = WALKTHROUGH_FRAMES.map((frame) => new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = frame.src;
    }));
    Promise.allSettled(loads).then(() => { if (!cancelled) setPreloaded(true); });
    return () => { cancelled = true; };
  }, []);

  const hasNext = nextIndex !== index;
  const currentOpacity = reduced || !hasNext ? 1 : 1 - blend;
  const nextOpacity = reduced || !hasNext ? 0 : blend;

  return (
    <div
      className={`pulse-walkthrough ${preloaded ? 'is-preloaded' : 'is-loading'} ${reduced ? 'is-reduced' : ''} has-video-frames`}
      aria-hidden="true"
      style={{
        '--walk-progress': p,
        '--depth-a-x': `${p * -7}%`,
        '--depth-a-y': `${p * -2}%`,
        '--depth-b-x': `${p * 6}%`,
        '--depth-b-y': `${p * -1}%`,
        '--light-x': `${-18 + p * 34}%`,
      }}
    >
      <div className="pulse-walkthrough-media">
        <figure className="pulse-walkthrough-frame is-current" style={frameStyle(zone, currentOpacity, p, local, 1)}>
          <img src={zone.src} alt="" loading="eager" decoding="async" />
        </figure>
        {nextIndex !== index && (
          <figure className="pulse-walkthrough-frame is-next" style={frameStyle(next, nextOpacity, p, clamp(local - 0.45), -1)}>
            <img src={next.src} alt="" loading="eager" decoding="async" />
          </figure>
        )}
      </div>
      <div className="pulse-walkthrough-depth depth-a" />
      <div className="pulse-walkthrough-depth depth-b" />
      <div className="pulse-walkthrough-light" />
      <div className="pulse-walkthrough-grain" />
      <div className={`pulse-walkthrough-trial ${finalReveal ? 'is-visible' : ''}`}>
        <span>Trial pass unlocked</span>
        <strong>Book the floor assessment</strong>
      </div>
      {!preloaded && <div className="pulse-walkthrough-fallback"><span>Loading gym flythrough</span></div>}
    </div>
  );
}
