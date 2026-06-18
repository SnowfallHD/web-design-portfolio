import React, { useEffect, useMemo, useState } from 'react';

export const WALKTHROUGH_FRAMES = [
  {
    name: 'Entrance',
    copy: 'Branded reception, concrete desk, wall mark, and first view down the training floor.',
    src: '/brand-images/pulseforge-sequence-01-entrance.webp',
    focus: '50% 52%',
    startScale: 1.04,
    endScale: 1.18,
    panX: -1.6,
    panY: -0.4,
  },
  {
    name: 'Turf',
    copy: 'Green sled lane, white hash marks, rubber flooring, and racks pulling into view.',
    src: '/brand-images/pulseforge-sequence-02-turf.webp',
    focus: '52% 50%',
    startScale: 1.06,
    endScale: 1.2,
    panX: -3.1,
    panY: -0.9,
  },
  {
    name: 'Strength',
    copy: 'Rack line, dumbbell wall, benches, plates, mirrors, and warm linear lights.',
    src: '/brand-images/pulseforge-sequence-03-strength.webp',
    focus: '46% 50%',
    startScale: 1.05,
    endScale: 1.19,
    panX: 2.2,
    panY: -0.7,
  },
  {
    name: 'Conditioning',
    copy: 'Rowers, assault bikes, ropes, kettlebells, and the turf lane continuing through the room.',
    src: '/brand-images/pulseforge-sequence-04-conditioning.webp',
    focus: '54% 50%',
    startScale: 1.05,
    endScale: 1.21,
    panX: -2.5,
    panY: -0.8,
  },
  {
    name: 'Recovery',
    copy: 'Glass partition, cold plunge, compression chairs, mobility table, and quiet reset lighting.',
    src: '/brand-images/pulseforge-sequence-05-recovery.webp',
    focus: '48% 52%',
    startScale: 1.05,
    endScale: 1.18,
    panX: 1.8,
    panY: -1.1,
  },
  {
    name: 'Trial Pass',
    copy: 'Final desk view, branded handoff, and the seven-day trial pass reveal.',
    src: '/brand-images/pulseforge-sequence-06-cta.webp',
    focus: '50% 50%',
    startScale: 1.03,
    endScale: 1.16,
    panX: -1,
    panY: -0.5,
  },
];

const clamp = (value) => Math.max(0, Math.min(1, value));

function segmentForProgress(progress) {
  const p = clamp(progress);
  const last = WALKTHROUGH_FRAMES.length - 1;
  const scaled = p * last;
  const index = Math.min(last, Math.floor(scaled));
  const nextIndex = Math.min(last, index + 1);
  const local = index === last ? 1 : scaled - index;
  const blend = clamp((local - 0.58) / 0.42);
  return { index, nextIndex, local, blend };
}

export function zoneForProgress(progress) {
  const { index } = segmentForProgress(progress);
  return { ...WALKTHROUGH_FRAMES[index], index, beats: WALKTHROUGH_FRAMES };
}

function frameStyle(frame, opacity, progress, local, direction = 1) {
  const travel = (local - 0.5) * direction;
  const scale = frame.startScale + (frame.endScale - frame.startScale) * clamp(local);
  return {
    opacity,
    '--frame-focus': frame.focus,
    '--frame-scale': scale,
    '--frame-x': `${frame.panX * progress + travel * 2.2}%`,
    '--frame-y': `${frame.panY * progress + Math.sin(progress * Math.PI) * -0.9}%`,
  };
}

export default function PulseForgeWalkthrough({ active = false, scrollProgress = 0 }) {
  const [preloaded, setPreloaded] = useState(false);
  const [reduced, setReduced] = useState(false);
  const p = clamp(active ? scrollProgress : 0);
  const { index, nextIndex, local, blend } = useMemo(() => segmentForProgress(p), [p]);
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

  const currentOpacity = reduced ? 1 : 1 - blend;
  const nextOpacity = reduced ? 0 : blend;

  return (
    <div
      className={`pulse-walkthrough ${preloaded ? 'is-preloaded' : 'is-loading'} ${reduced ? 'is-reduced' : ''}`}
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
          <figure className="pulse-walkthrough-frame is-next" style={frameStyle(next, nextOpacity, p, clamp(local - 0.58), -1)}>
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
      {!preloaded && <div className="pulse-walkthrough-fallback"><span>Preloading gym walkthrough</span></div>}
    </div>
  );
}
