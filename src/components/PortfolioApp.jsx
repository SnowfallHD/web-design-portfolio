import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowUpRight, Dumbbell, Home, Leaf, ShoppingBag, Newspaper, Utensils, Waves, X } from 'lucide-react';

const sites = [
  { id: 'pulseforge', title: 'PulseForge', category: 'Performance gym', palette: 'Redline / steel / sweat', accent: '#ff2d55', image: '/brand-images/pulseforge-gym.webp', Icon: Dumbbell, one: 'A high-performance training club built around intensity, coaching, recovery, and trial-pass conversion.' },
  { id: 'atlas', title: 'Atlas Estate', category: 'Luxury real estate', palette: 'Limestone / ink / brass', accent: '#b78342', image: '/brand-images/atlas-estate.webp', Icon: Home, one: 'A private coastal brokerage with editorial property photography, route maps, off-market inventory, and concierge intake.' },
  { id: 'verdant', title: 'Verdant Works', category: 'Outdoor living', palette: 'Moss / clay / cedar', accent: '#7ba95b', image: '/brand-images/verdant-works.webp', Icon: Leaf, one: 'A grounded landscaping company showing real transformations, planting logic, seasonal care, and estimate flow.' },
  { id: 'orbit', title: 'Orbit Supply', category: 'Product drop', palette: 'Graphite / optic cyan / violet', accent: '#73f5ff', image: '/brand-images/orbit-supply.webp', Icon: ShoppingBag, one: 'A technical gear drop with product photography, shader-morphing object, variants, specs, bundles, and cart state.' },
  { id: 'margin', title: 'The Margin', category: 'Magazine', palette: 'Newsprint / oxblood / ink', accent: '#8c2f39', image: '/brand-images/the-margin.webp', Icon: Newspaper, one: 'A literary publication with issue covers, editorial hierarchy, article rails, authors, archive, and subscription path.' },
  { id: 'ember', title: 'Ember Table', category: 'Restaurant', palette: 'Char / flame / wine', accent: '#ffb347', image: '/brand-images/ember-table.webp', Icon: Utensils, one: 'A warm restaurant site centered on food, fire, chef story, tasting courses, private dining, and reservations.' },
  { id: 'luma', title: 'Luma Spa', category: 'Wellness spa', palette: 'Mist / jade / stone', accent: '#72c7ad', image: '/brand-images/luma-spa.webp', Icon: Waves, one: 'A quiet wellness brand with treatment rooms, ritual paths, practitioners, memberships, gift cards, and calm booking.' },
];

const byId = Object.fromEntries(sites.map((s) => [s.id, s]));

function progressFrom(el) {
  if (!el) return 0;
  const max = Math.max(1, el.scrollHeight - el.clientHeight);
  return Math.min(1, Math.max(0, el.scrollTop / max));
}

function BrandImage({ site, className = '', alt, shade = true }) {
  return <Photo src={site.image} alt={alt || `${site.title} brand photography`} className={className} shade={shade} />;
}

function Photo({ src, className = '', alt = '', shade = true }) {
  return (
    <div className={`brand-photo ${className}`}>
      <img src={src} alt={alt} loading="lazy" />
      {shade && <span className="brand-photo-shade" />}
    </div>
  );
}

function ScrollDrawSvg({ viewBox, paths, progress = 0, className = '', children }) {
  const refs = useRef([]);
  const [lengths, setLengths] = useState([]);
  const pathSignature = paths.map((path) => path.d).join('|');

  useEffect(() => {
    const measure = () => setLengths(refs.current.map((path) => path?.getTotalLength?.() || 1));
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    refs.current.forEach((node) => node && ro?.observe(node));
    window.addEventListener('resize', measure);
    return () => { ro?.disconnect(); window.removeEventListener('resize', measure); };
  }, [pathSignature]);

  return (
    <svg className={`scroll-draw ${className}`} viewBox={viewBox} fill="none" aria-hidden="true">
      {paths.map((path, i) => {
        const len = lengths[i] || 1;
        const start = path.start ?? 0;
        const end = path.end ?? 1;
        const local = Math.min(1, Math.max(0, (progress - start) / Math.max(0.001, end - start)));
        return (
          <path
            key={`${path.d}-${i}`}
            ref={(node) => { refs.current[i] = node; }}
            d={path.d}
            stroke={path.stroke}
            strokeWidth={path.strokeWidth || 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: len, strokeDashoffset: len * (1 - local) }}
          />
        );
      })}
      {children}
    </svg>
  );
}

function ThreeScene({ variant = 'fly', active = false, scrollProgress = 0 }) {
  const mount = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const progress = useRef(scrollProgress);

  useEffect(() => { progress.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    if (!mount.current) return undefined;
    const host = mount.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(variant === 'fly' ? 62 : 48, 1, 0.1, 220);
    camera.position.set(0, 0, variant === 'fly' ? 13 : 6.2);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45));
    host.appendChild(renderer.domElement);

    const objects = [];
    const startedAt = performance.now();
    let raf = 0;
    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color(variant === 'fly' ? '#ff2d55' : '#73f5ff') },
      uColorB: { value: new THREE.Color(variant === 'fly' ? '#ffffff' : '#9b5cff') },
    };

    if (variant === 'fly') {
      scene.fog = new THREE.FogExp2('#050306', 0.028);
      const wallMat = new THREE.MeshBasicMaterial({ color: '#11151b', transparent: true, opacity: 0.9 });
      const glassMat = new THREE.MeshBasicMaterial({ color: '#27323b', transparent: true, opacity: 0.44, wireframe: true });
      const redMat = new THREE.MeshBasicMaterial({ color: '#ff2d55', transparent: true, opacity: 0.82 });
      const whiteMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 });
      const darkMat = new THREE.MeshBasicMaterial({ color: '#050608', transparent: true, opacity: 0.95 });
      const floorGeo = new THREE.BoxGeometry(7.8, 0.04, 2.05);
      const wallGeo = new THREE.BoxGeometry(0.05, 2.55, 2.05);
      const beamGeo = new THREE.BoxGeometry(7.8, 0.04, 0.08);
      const laneGeo = new THREE.BoxGeometry(0.025, 0.035, 2.0);
      const lightGeo = new THREE.BoxGeometry(1.1, 0.03, 0.18);
      const signGeo = new THREE.PlaneGeometry(1.2, 0.34);
      const rackGeo = new THREE.BoxGeometry(0.38, 1.35, 0.08);
      const plateGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 18);
      const addMesh = (mesh, kind, phase = 0) => { scene.add(mesh); objects.push({ mesh, kind, phase }); return mesh; };
      for (let i = 0; i < 38; i += 1) {
        const z = -i * 2.05;
        const floor = addMesh(new THREE.Mesh(floorGeo, wallMat.clone()), 'floor', i); floor.position.set(0, -1.72, z);
        const leftWall = addMesh(new THREE.Mesh(wallGeo, i % 4 === 0 ? glassMat.clone() : wallMat.clone()), 'wall', i); leftWall.position.set(-3.9, -0.35, z);
        const rightWall = addMesh(new THREE.Mesh(wallGeo, i % 5 === 0 ? glassMat.clone() : wallMat.clone()), 'wall', i); rightWall.position.set(3.9, -0.35, z);
        const beam = addMesh(new THREE.Mesh(beamGeo, i % 3 === 0 ? redMat.clone() : whiteMat.clone()), 'beam', i); beam.position.set(0, 1.25, z - 0.85); beam.material.opacity = i % 3 === 0 ? 0.45 : 0.18;
        [-1.15, 0, 1.15].forEach((x) => { const lane = addMesh(new THREE.Mesh(laneGeo, x === 0 ? redMat.clone() : whiteMat.clone()), 'lane', i); lane.position.set(x, -1.66, z); lane.material.opacity = x === 0 ? 0.62 : 0.24; });
        if (i % 4 === 1) { const light = addMesh(new THREE.Mesh(lightGeo, redMat.clone()), 'light', i); light.position.set(-2.15, 1.18, z); const light2 = addMesh(new THREE.Mesh(lightGeo, whiteMat.clone()), 'light', i); light2.position.set(2.15, 1.18, z); }
        if (i % 6 === 2) { const sign = addMesh(new THREE.Mesh(signGeo, redMat.clone()), 'sign', i); sign.position.set(-3.86, 0.75, z); sign.rotation.y = Math.PI / 2; }
        if (i % 7 === 3) { [-3.25, 3.25].forEach((x, side) => { const rack = addMesh(new THREE.Mesh(rackGeo, darkMat.clone()), 'equipment', i); rack.position.set(x, -0.95, z - 0.35); const bar = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.05, 0.05), whiteMat.clone()), 'equipment', i); bar.position.set(x + (side ? -0.2 : 0.2), -0.55, z - 0.35); [-0.34, 0.34].forEach((dy) => { const plate = addMesh(new THREE.Mesh(plateGeo, redMat.clone()), 'equipment', i); plate.position.set(x, -0.55 + dy, z - 0.32); plate.rotation.z = Math.PI / 2; }); }); }
        if (i % 9 === 0) { const doorway = addMesh(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.9, 0.05), glassMat.clone()), 'doorway', i); doorway.position.set(i % 18 === 0 ? -3.88 : 3.88, -0.45, z - 0.7); doorway.rotation.y = Math.PI / 2; }
      }
      const particleGeo = new THREE.BufferGeometry();
      const count = 520;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) { pos[i * 3] = (Math.random() - 0.5) * 6.6; pos[i * 3 + 1] = -1.45 + Math.random() * 2.25; pos[i * 3 + 2] = -Math.random() * 78; }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.018, transparent: true, opacity: 0.35 }));
      scene.add(particles); objects.push({ mesh: particles, kind: 'particles', phase: 0 });
    } else {
      const geometry = new THREE.IcosahedronGeometry(1.6, 96);
      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        vertexShader: `
          uniform float uTime; uniform float uScroll; uniform vec2 uMouse;
          varying vec3 vNormal; varying vec3 vPosition;
          void main(){
            vNormal = normal; vPosition = position;
            float seams = sin(position.x*11.0 + uScroll*10.0 + uTime*1.1) * 0.18;
            float fabric = cos(position.y*9.0 - uTime*1.4) * 0.12;
            float buckle = sin(length(position.xy)*8.0 + uScroll*13.0) * 0.2;
            vec3 p = position + normal * (seams + fabric + buckle + length(uMouse)*0.16 + uScroll*0.38);
            p.x += sin(uScroll*6.283 + position.y*3.0) * 0.34 * uScroll;
            p.z += cos(position.x*4.0 + uScroll*8.0) * 0.28 * uScroll;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
          }`,
        fragmentShader: `
          uniform float uTime; uniform float uScroll; uniform vec3 uColorA; uniform vec3 uColorB;
          varying vec3 vNormal; varying vec3 vPosition;
          void main(){
            float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0,0.0,1.0)), 2.0);
            float bands = sin((vPosition.y + vPosition.x)*10.0 + uTime*2.0 + uScroll*11.0)*0.5+0.5;
            vec3 color = mix(uColorA, uColorB, bands) + fresnel*(0.6+uScroll*0.45);
            gl_FragColor = vec4(color, .92);
          }`,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh); objects.push({ mesh, kind: 'morph', phase: 0 });
      for (let i = 0; i < 9; i += 1) {
        const halo = new THREE.Mesh(new THREE.TorusGeometry(2.05 + i * 0.2, 0.006, 8, 128), new THREE.MeshBasicMaterial({ color: i % 2 ? '#73f5ff' : '#9b5cff', transparent: true, opacity: 0.1, wireframe: true }));
        halo.rotation.x = Math.PI / 2 + i * 0.12;
        halo.rotation.z = i * 0.6;
        scene.add(halo); objects.push({ mesh: halo, kind: 'halo', phase: i });
      }
      const light = new THREE.PointLight('#ffffff', 45, 18);
      light.position.set(2, 3, 5); scene.add(light);
    }

    const resize = () => {
      const width = host.clientWidth || 600;
      const height = host.clientHeight || 420;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const onPointer = (event) => {
      const rect = host.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.current.y = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };
    host.addEventListener('pointermove', onPointer);
    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      const t = (performance.now() - startedAt) / 1000;
      const p = active ? progress.current : 0;
      uniforms.uTime.value = t; uniforms.uScroll.value = p; uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
      if (variant === 'fly') {
        camera.position.x += (Math.sin(p * 5.6) * 0.72 + mouse.current.x * 0.22 - camera.position.x) * 0.055;
        camera.position.y += (-0.34 + Math.sin(p * 3.8) * 0.18 + mouse.current.y * 0.16 - camera.position.y) * 0.055;
        camera.position.z += (11.5 - p * 68 - camera.position.z) * 0.08;
        camera.lookAt(Math.sin(p * 5.4) * 0.58, -0.42 + Math.cos(p * 3.2) * 0.14, camera.position.z - 13);
        objects.forEach(({ mesh, kind, phase }, i) => {
          const station = Math.max(0, Math.sin((p * 38 - phase) * 0.72));
          if (kind === 'floor') mesh.material.opacity = 0.72 + station * 0.18;
          if (kind === 'wall') mesh.material.opacity = 0.42 + station * 0.2;
          if (kind === 'beam' || kind === 'light') mesh.material.opacity = 0.16 + station * 0.62;
          if (kind === 'lane') mesh.material.opacity = 0.16 + station * 0.5;
          if (kind === 'sign' || kind === 'doorway') mesh.material.opacity = 0.22 + station * 0.54;
          if (kind === 'equipment') mesh.rotation.y += Math.sin(t + i) * 0.0004;
          if (kind === 'particles') { mesh.rotation.y += 0.00035; mesh.material.opacity = 0.24 + Math.sin(t * 0.7) * 0.06; }
        });
      } else {
        objects.forEach(({ mesh, kind, phase }) => {
          if (kind === 'morph') { mesh.rotation.y = t * 0.34 + mouse.current.x * 0.5 + p * Math.PI * 1.7; mesh.rotation.x = Math.sin(t * 0.45) * 0.25 + mouse.current.y * 0.32 - p * 0.6; mesh.scale.setScalar(0.9 + p * 0.45); }
          if (kind === 'halo') { mesh.rotation.z += 0.004 + p * 0.014; mesh.rotation.y = Math.sin(t * 0.35 + phase) * 0.25; mesh.material.opacity = 0.07 + p * 0.13; }
        });
        camera.position.z += (6.2 - p * 1.8 - camera.position.z) * 0.06;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      objects.forEach(({ mesh }) => { mesh.geometry?.dispose?.(); Array.isArray(mesh.material) ? mesh.material.forEach((m) => m.dispose?.()) : mesh.material?.dispose?.(); });
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [variant, active]);

  return <div ref={mount} className="three-shell absolute inset-0" aria-hidden="true" />;
}

function PortfolioApp() {
  const [selected, setSelected] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const activeSite = useMemo(() => byId[selected], [selected]);

  useEffect(() => {
    const onDocClick = (event) => {
      const close = event.target.closest?.('[data-close-site]');
      if (close) { setSelected(null); return; }
      const opener = event.target.closest?.('[data-site-id]');
      if (opener?.dataset?.siteId) { setScrollProgress(0); setSelected(opener.dataset.siteId); }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    document.documentElement.style.overflow = selected ? 'hidden' : '';
    const onKey = (event) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; document.documentElement.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [selected]);

  return (
    <main className="showroom-shell relative min-h-screen overflow-hidden px-4 py-5 text-[#ffe6cb] sm:px-6 lg:px-10">
      <header className="relative z-10 mx-auto grid max-w-7xl gap-8 border-b border-[#ffe6cb]/10 pb-10 pt-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
        <div className="max-w-4xl animate-slide-up">
          <div className="eyebrow mb-6 inline-flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-[#ffbd38]" /> Interactive website portfolio</div>
          <h1 className="max-w-5xl text-4xl font-semibold leading-[0.94] tracking-[-0.055em] text-[#fff8ec] sm:text-6xl lg:text-7xl">Seven brand worlds, not seven template skins.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#ffe6cb]/68 sm:text-lg">A vertical showroom of clicked-in website demos: cinematic imagery, distinct typography, real business sections, SVG drawing, scroll motion, and WebGL where it earns its place.</p>
          <div className="mt-7 flex flex-wrap gap-3"><span className="trace-chip">Brand-specific</span><span className="trace-chip">Image-rich</span><span className="trace-chip">Scroll / SVG / WebGL</span></div>
        </div>
        <div className="system-card relative z-10 p-5 text-sm text-[#ffe6cb]/72">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#fff8ec]">Portfolio thesis</p>
          <p className="mt-3 leading-6">The shell stays cohesive. The inner sites prove range: different visitor, different conversion logic, different visual system, different motion idea.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-[#ffe6cb]/45"><span>Astro</span><span>React</span><span>Tailwind</span><span>Three.js</span></div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-5 pb-24">
        {sites.map((site, index) => <PreviewCard key={site.id} site={site} index={index} onOpen={() => setSelected(site.id)} />)}
      </section>

      {activeSite && (
        <div className="site-modal fixed inset-0 z-50 overflow-y-auto bg-black/82 p-2 backdrop-blur-xl sm:p-4" role="dialog" aria-modal="true" aria-label={`${activeSite.title} expanded preview`} onScroll={(event) => setScrollProgress(progressFrom(event.currentTarget))}>
          <button data-close-site className="focus-visible-ring fixed right-4 top-4 z-[60] inline-flex items-center gap-2 rounded-lg border border-[#ffe6cb]/15 bg-[#041c1c]/80 px-4 py-3 text-sm font-medium text-[#fff8ec] shadow-2xl backdrop-blur-xl transition hover:border-[#ffbd38]/45 hover:bg-[#092626]" onClick={() => setSelected(null)}><X size={17} /> Exit site</button>
          <div className="expanded-site portal-enter relative min-h-full overflow-visible rounded-xl border border-[#ffe6cb]/12 bg-black shadow-[0_40px_140px_rgba(0,0,0,.75)]">
            <SiteRenderer site={activeSite} expanded scrollProgress={scrollProgress} />
          </div>
        </div>
      )}
    </main>
  );
}

function PreviewCard({ site, index, onOpen }) {
  const Icon = site.Icon;
  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };
  return (
    <article data-site-id={site.id} role="button" tabIndex={0} onClick={onOpen} onKeyDown={onKeyDown} className="focus-visible-ring group showroom-card relative grid min-h-[28rem] w-full cursor-pointer overflow-hidden text-left transition duration-500 hover:-translate-y-1 hover:border-[#ffe6cb]/24 hover:bg-[#ffe6cb]/[0.045] lg:grid-cols-[21rem_1fr]" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="relative z-10 flex flex-col justify-between border-b border-[#ffe6cb]/10 p-6 lg:border-b-0 lg:border-r">
        <div><div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#ffe6cb]/12 bg-[#ffe6cb]/[0.035]" style={{ color: site.accent }}><Icon size={22} /></div><p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-[#ffe6cb]/44">{site.category}</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-[#fff8ec] sm:text-3xl">{site.title}</h2><p className="mt-4 max-w-xs text-sm leading-6 text-[#ffe6cb]/58">{site.one}</p></div>
        <div className="mt-7 flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.16em] text-[#ffe6cb]/45"><span>{site.palette}</span><span className="trace-button inline-flex items-center gap-2 text-[#fff8ec]">Enter <ArrowUpRight size={14} /></span></div>
      </div>
      <div className="preview-mask relative h-[27rem] overflow-hidden lg:h-auto"><div className="absolute inset-x-0 top-0 origin-top scale-[0.62] sm:scale-[0.72] lg:scale-[0.66] xl:scale-[0.74]"><div className="pointer-events-none h-[70rem] w-[142%] -translate-x-[15%] rounded-xl border border-[#ffe6cb]/10 bg-black shadow-2xl"><SiteRenderer site={site} /></div></div><div className="pointer-events-none absolute inset-x-6 bottom-5 z-20 rounded-lg border border-[#ffe6cb]/12 bg-[#041c1c]/70 px-4 py-3 text-center text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#ffe6cb]/68 backdrop-blur-xl">standalone brand demo — opens inline</div></div>
    </article>
  );
}

function SiteRenderer({ site, expanded = false, scrollProgress = 0 }) {
  switch (site.id) {
    case 'pulseforge': return <PulseForge site={site} expanded={expanded} scrollProgress={scrollProgress} />;
    case 'atlas': return <AtlasEstate site={site} scrollProgress={scrollProgress} />;
    case 'verdant': return <VerdantWorks site={site} scrollProgress={scrollProgress} />;
    case 'orbit': return <OrbitSupply site={site} expanded={expanded} scrollProgress={scrollProgress} />;
    case 'margin': return <TheMargin site={site} />;
    case 'ember': return <EmberTable site={site} />;
    case 'luma': return <LumaSpa site={site} />;
    default: return null;
  }
}

function PulseForge({ site, expanded, scrollProgress }) {
  return <div className="site-canvas pulse-site text-white"><ThreeScene variant="fly" active={expanded} scrollProgress={scrollProgress} /><nav className="pulse-nav"><b>PF/06</b><span>Zones</span><span>Coaches</span><span>Recovery</span><button>Trial pass</button></nav><section className="pulse-hero"><BrandImage site={site} className="pulse-photo" /><div className="pulse-copy"><p>South Austin performance club</p><h3>Strength. Speed. Return.</h3><div className="pulse-actions"><button>Start 7-day trial</button><button>See tonight's classes</button></div></div><div className="pulse-meter"><span>Live class load</span><strong>84%</strong><i /></div></section><section className="pulse-zones"><h4>Follow the floor plan.</h4>{['Engine Room', 'Iron Floor', 'Recovery Lab', 'Sprint Turf'].map((z, i) => <article key={z}><span>0{i+1}</span><h5>{z}</h5><p>{['Intervals, sled pushes, ropes, assault bikes, and heart-rate based coaching.', 'Olympic racks, dumbbell bays, spotter-led strength blocks, and form checks.', 'Cold plunge, compression, breath tables, and post-session mobility.', 'Speed work, jumps, carries, and small-group conditioning.'][i]}</p></article>)}</section><section className="pulse-coaches"><div><h4>Coaches who correct you before the rep gets ugly.</h4><p>Book a trial and train with a floor lead, not a sales rep. Every session starts with movement screening and ends with a recovery recommendation.</p></div>{['Mara — Strength', 'Dev — Conditioning', 'Anika — Mobility'].map((c) => <span key={c}>{c}</span>)}</section><section className="pulse-pricing"><h4>Choose the rhythm.</h4>{['Trial week / $0', 'Unlimited / $189 mo', 'Semi-private / $340 mo'].map((p) => <article key={p}><h5>{p}</h5><p>Includes coaching notes, class booking, and recovery access.</p></article>)}</section></div>;
}

function AtlasEstate({ site, scrollProgress }) {
  const listings = [
    ['Glass House No. 8', '$6.2M · 4 bed · ocean path', '/brand-images/atlas-interior.webp'],
    ['Cliff Road Villa', '$8.9M · gated bluff', '/brand-images/atlas-cliff-villa.webp'],
    ['Juniper Courtyard', '$3.7M · courtyard retreat', '/brand-images/atlas-courtyard.webp'],
  ];
  return <div className="site-canvas atlas-site"><nav className="atlas-nav"><span>Atlas Estate</span><span>Private list · Coastal advisory · Buyer concierge</span></nav><section className="atlas-hero"><div className="atlas-title"><p>By-appointment coastal brokerage</p><h3>Homes that rarely reach the open market.</h3><button>Request the private list</button></div><BrandImage site={site} className="atlas-photo" /><aside><strong>$4.8M</strong><span>average private transaction</span><strong>37</strong><span>quiet listings this quarter</span></aside></section><section className="atlas-route"><ScrollDrawSvg viewBox="0 0 900 320" progress={scrollProgress} paths={[{ d: 'M40 260 C 180 80, 320 240, 450 120 S 680 80, 850 210', stroke: '#c7985c', strokeWidth: 5, start: .08, end: .42 }]}><circle cx="450" cy="120" r="8" /><circle cx="710" cy="130" r="8" /></ScrollDrawSvg><div><h4>A guided route through neighborhoods, not a feed of listings.</h4><p>We start with schools, shoreline, privacy, guest-house rules, airport time, and the difference between beautiful photos and a livable week.</p></div></section><section className="atlas-listings">{listings.map(([name, meta, src]) => <article key={name}><Photo src={src} alt={`${name} property photography`} shade={false} /><p>Private residence</p><h5>{name}</h5><span>{meta}</span></article>)}</section><section className="atlas-intake"><h4>Tell us what should never hit Zillow.</h4><div>{['Budget range', 'Timeline', 'School / commute', 'Privacy needs'].map((f) => <span key={f}>{f}</span>)}</div><button>Begin buyer intake</button></section></div>;
}


function VerdantWorks({ site, scrollProgress }) {
  const transformations = [
    ['Before: patchy slope', '/brand-images/verdant-before.webp'],
    ['After: stone steps + meadow', '/brand-images/verdant-after.webp'],
    ['Care: monthly cutback', '/brand-images/verdant-care.webp'],
  ];
  return <div className="site-canvas verdant-site"><header><div><p>Outdoor rooms for real weather</p><h3>Courtyards, patios, and native gardens that settle in beautifully.</h3><button>Schedule a yard walk</button></div><BrandImage site={site} /></header><section className="verdant-plan"><div><h4>From rough lot to living plan.</h4><p>We map shade, drainage, privacy, circulation, and plant maintenance before anyone starts hauling stone.</p></div><ScrollDrawSvg viewBox="0 0 620 360" progress={scrollProgress} paths={[{ d: 'M62 290 C150 120 260 295 365 105 S530 80 578 230', stroke: '#486b32', strokeWidth: 6, start: .1, end: .46 }, { d: 'M95 175 C190 210 310 110 500 150', stroke: '#9c6d3c', strokeWidth: 3, start: .22, end: .58 }]} /></section><section className="verdant-wipe">{transformations.map(([x, src]) => <article key={x}><Photo src={src} alt={`${x} landscaping photography`} shade={false} /><h5>{x}</h5></article>)}</section><section className="verdant-services"><h4>What homeowners actually need.</h4>{['Outdoor room design', 'Native planting', 'Stone + water', 'Seasonal care plans', 'Lighting', 'Storm cleanup'].map((service) => <span key={service}>{service}</span>)}</section><section className="verdant-estimate"><h4>Get a useful estimate.</h4><p>Send yard size, photos, sun exposure, budget range, and the outdoor room you wish existed.</p><button>Start estimate</button></section></div>;
}


function OrbitSupply({ site, expanded, scrollProgress }) {
  return <div className="site-canvas orbit-site text-white"><nav><span>ORBIT SUPPLY / DROP 04</span><button>Cart — $248</button></nav><section className="orbit-hero"><div><p>Adaptive carry system</p><h3>AeroShell Pack</h3><p>Weather shell, carbon frame, removable grid pouch, and strap hardware built for commuters who pack like field operators.</p><button>Reserve the drop</button></div><div className="orbit-object"><BrandImage site={site} shade={false} /><ThreeScene variant="morph" active={expanded} scrollProgress={scrollProgress} /></div></section><section className="orbit-specs"><h4>Material states change with the day.</h4>{['Iridescent rain shell', 'Carbon load frame', 'Magnetic grid pouch', 'Thermal laptop sleeve'].map((s) => <article key={s}><h5>{s}</h5><p>Scroll the object: seams pull open, shell bands shift, and the silhouette gets more technical.</p></article>)}</section><section className="orbit-variants">{['Graphite', 'Ion blue', 'Field clay', 'Night violet'].map((v, i) => <button key={v} style={{ '--swatch': ['#24262d','#73f5ff','#9b7b5a','#7d5cff'][i] }}>{v}</button>)}</section><section className="orbit-cart"><Photo src="/brand-images/orbit-packaging.webp" alt="Orbit Supply packaging and components" shade={false} /><h4>Build the kit.</h4><div>{['AeroShell Pack — $248', 'Grid pouch — $48', 'Rain skin — $36'].map((i) => <span key={i}>{i}</span>)}</div><button>Checkout mockup</button></section></div>;
}

function TheMargin({ site }) {
  return <div className="site-canvas margin-site"><section className="margin-mast"><p>Issue 09 / Work, attention, small teams</p><h3>The Margin</h3><BrandImage site={site} className="margin-cover" /></section><section className="margin-lede"><article><span>Cover essay</span><h4>The craft hiding in boring tools.</h4><p>Why useful software often looks quiet before it becomes indispensable.</p></article><article><span>Interview</span><h4>Small teams, big taste.</h4><p>A conversation on constraint, distribution, and refusing generic polish.</p></article></section><section className="margin-rail"><h4>Read the issue</h4>{['Field notes', 'Essays', 'Interviews', 'Archive', 'Letters'].map((c) => <span key={c}>{c}</span>)}</section><section className="margin-layout"><div><h4>A slower place to read about building.</h4><p>Monthly issue, editor notes, research links, and a small archive that rewards returning instead of refreshing.</p><button>Subscribe for the next issue</button></div><Photo src="/brand-images/margin-spread.webp" alt="The Margin open issue spread" shade={false} /></section></div>;
}

function EmberTable({ site }) {
  return <div className="site-canvas ember-site text-white"><section className="ember-hero"><BrandImage site={site} /><nav><span>Ember Table</span><button>Reserve</button></nav><div><p>Wood fire dining · East side</p><h3>Smoke, citrus, and a table close to the hearth.</h3><button>Reserve tonight</button></div></section><section className="ember-courses"><h4>Tonight's tasting sequence</h4>{['Hearth bread + cultured butter', 'Charred citrus salad', 'Coal-roasted chicken', 'Saffron panna cotta'].map((c, i) => <article key={c}><span>{i+1}</span><h5>{c}</h5><p>{['Warm pull-apart loaf, black salt.', 'Bitter greens, ember oil, orange.', 'Fermented chili, winter herbs.', 'Olive oil, sea salt, smoke.'][i]}</p></article>)}</section><section className="ember-room"><Photo src="/brand-images/ember-room.webp" alt="Ember Table dining room and hearth" shade={false} /><div><h4>The room glows differently after 7pm.</h4><p>Counter seats face the fire. Booths are quieter. Private dining takes over the back room for twelve.</p></div></section><section className="ember-reserve"><h4>Book dinner or private fire-room events.</h4><div>{['Party size', 'Date', 'Occasion', 'Dietary notes'].map((f) => <span key={f}>{f}</span>)}</div><button>Find a table</button></section></div>;
}

function LumaSpa({ site }) {
  return <div className="site-canvas luma-site"><section className="luma-hero"><div><p>Skin · sauna · nervous system</p><h3>Leave quieter than you arrived.</h3><p>Guided treatments, warm rooms, practitioner-led rituals, and booking that feels as calm as the visit.</p><button>Find your treatment</button></div><BrandImage site={site} shade={false} /></section><section className="luma-breathe"><div className="breath-orb" /><h4>Start with how you want to feel.</h4><div>{['Reset tension', 'Calm skin', 'Recover deeply', 'Gift a ritual'].map((x) => <span key={x}>{x}</span>)}</div></section><section className="luma-treatments">{[['The Quiet Facial', '/brand-images/luma-facial.webp'], ['Sauna + cold rinse', '/brand-images/luma-sauna.webp'], ['Stone table recovery', '/brand-images/luma-stone.webp'], ['Monthly glow membership', '/brand-images/luma-membership.webp']].map(([t, src]) => <article key={t}><Photo src={src} alt={`${t} ritual photography`} shade={false} /><h5>{t}</h5><p>Soft light, practitioner notes, duration, and what to expect.</p></article>)}</section><section className="luma-book"><h4>Book without rushing.</h4><p>Choose pressure, focus, room preference, and practitioner. Gift cards and memberships live beside the same calm booking path.</p><button>Open booking mockup</button></section></div>;
}

export default PortfolioApp;
