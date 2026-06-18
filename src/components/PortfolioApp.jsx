import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowUpRight, Dumbbell, Home, Leaf, ShoppingBag, Newspaper, Utensils, Waves, X } from 'lucide-react';

const sites = [
  { id: 'pulseforge', title: 'PulseForge', category: 'Performance gym', palette: 'Portfolio piece', accent: '#ff2d55', image: '/brand-images/pulseforge-hyperreal-gym.webp', Icon: Dumbbell, one: 'A high-performance training club website.' },
  { id: 'atlas', title: 'Atlas Estate', category: 'Luxury real estate', palette: 'Portfolio piece', accent: '#b78342', image: '/brand-images/atlas-estate.webp', Icon: Home, one: 'A private coastal real estate website.' },
  { id: 'verdant', title: 'Verdant Works', category: 'Outdoor living', palette: 'Portfolio piece', accent: '#7ba95b', image: '/brand-images/verdant-works.webp', Icon: Leaf, one: 'A grounded outdoor living website.' },
  { id: 'orbit', title: 'Orbit Supply', category: 'Product drop', palette: 'Portfolio piece', accent: '#73f5ff', image: '/brand-images/orbit-supply.webp', Icon: ShoppingBag, one: 'A product drop website.' },
  { id: 'margin', title: 'The Margin', category: 'Magazine', palette: 'Portfolio piece', accent: '#8c2f39', image: '/brand-images/the-margin.webp', Icon: Newspaper, one: 'A magazine website.' },
  { id: 'ember', title: 'Ember Table', category: 'Restaurant', palette: 'Portfolio piece', accent: '#ffb347', image: '/brand-images/ember-table.webp', Icon: Utensils, one: 'A restaurant website.' },
  { id: 'luma', title: 'Luma Spa', category: 'Wellness spa', palette: 'Portfolio piece', accent: '#72c7ad', image: '/brand-images/luma-spa.webp', Icon: Waves, one: 'A wellness spa website.' },
];

const byId = Object.fromEntries(sites.map((s) => [s.id, s]));
const PulseForgeWalkthrough = lazy(() => import('./PulseForgeWalkthrough.jsx'));
const pulseWalkthroughBeats = [
  ['Entrance', 'Branded reception'],
  ['Turf', 'Sled lane'],
  ['Strength', 'Racks + dumbbells'],
  ['Conditioning', 'Rowers + bikes'],
  ['Recovery', 'Cold + compression'],
  ['Trial Pass', 'Final step'],
];

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
      scene.fog = new THREE.FogExp2('#050306', 0.034);
      const addMesh = (mesh, kind, phase = 0) => { scene.add(mesh); objects.push({ mesh, kind, phase }); return mesh; };
      const mat = (color, opacity = 1, wireframe = false) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, wireframe });
      const rubberMat = mat('#15171b', 0.96);
      const turfMat = mat('#123f2c', 0.92);
      const steelMat = mat('#9aa1aa', 0.5);
      const mirrorMat = mat('#dce9ef', 0.24, true);
      const redMat = mat('#ff2d55', 0.82);
      const whiteMat = mat('#ffffff', 0.45);
      const darkMat = mat('#050608', 0.95);
      const greenMat = mat('#49d17a', 0.7);
      const zoneData = [
        { name: 'ENTRANCE', z: 6, color: '#ffffff' },
        { name: 'TURF LANE', z: -8, color: '#49d17a' },
        { name: 'STRENGTH', z: -23, color: '#ff2d55' },
        { name: 'CONDITIONING', z: -41, color: '#ffbd38' },
        { name: 'RECOVERY', z: -61, color: '#72c7ad' },
      ];
      const makeLabel = (text, color = '#ff2d55') => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 512, 128);
        ctx.fillStyle = 'rgba(0,0,0,.58)'; ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.strokeRect(6, 6, 500, 116);
        ctx.fillStyle = '#ffffff'; ctx.font = '700 42px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(text, 256, 66);
        const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true;
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.45, 0.62), new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.9 }));
        mesh.userData.map = texture;
        return mesh;
      };

      for (let i = 0; i < 42; i += 1) {
        const z = 7 - i * 1.78;
        const floor = addMesh(new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.05, 1.72), rubberMat.clone()), 'floor', i); floor.position.set(0, -1.72, z);
        const seam = addMesh(new THREE.Mesh(new THREE.BoxGeometry(7.7, 0.018, 0.018), whiteMat.clone()), 'rubber-seam', i); seam.position.set(0, -1.675, z - .78); seam.material.opacity = .1;
        const turf = addMesh(new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.065, 1.68), turfMat.clone()), 'turf', i); turf.position.set(-1.45, -1.66, z);
        const sledRailA = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.08, 1.6), greenMat.clone()), 'sled', i); sledRailA.position.set(-1.92, -1.59, z);
        const sledRailB = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.08, 1.6), greenMat.clone()), 'sled', i); sledRailB.position.set(-0.98, -1.59, z);
        const leftWall = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.65, 1.72), i % 5 === 0 ? mirrorMat.clone() : darkMat.clone()), 'wall', i); leftWall.position.set(-3.95, -0.35, z);
        const rightWall = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.65, 1.72), i % 6 === 0 ? mirrorMat.clone() : darkMat.clone()), 'wall', i); rightWall.position.set(3.95, -0.35, z);
        const frameTop = addMesh(new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.05, 0.05), steelMat.clone()), 'frame', i); frameTop.position.set(0, 1.02, z - .78);
        const strip = addMesh(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.035, 0.16), i % 3 === 0 ? redMat.clone() : whiteMat.clone()), 'light', i); strip.position.set(i % 2 ? -1.7 : 1.7, 1.22, z - .35);

        if (i > 10 && i < 24 && i % 3 === 0) {
          [-3.2, 2.85].forEach((x, side) => {
            const rackL = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.45, 0.08), steelMat.clone()), 'equipment', i); rackL.position.set(x, -0.92, z);
            const rackR = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.45, 0.08), steelMat.clone()), 'equipment', i); rackR.position.set(x + (side ? -0.62 : 0.62), -0.92, z);
            const bar = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.05, 0.05), whiteMat.clone()), 'equipment', i); bar.position.set(x + (side ? -0.31 : 0.31), -0.48, z);
            [-.36, .36].forEach((dx) => { const plate = addMesh(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 18), redMat.clone()), 'equipment', i); plate.position.set(x + dx, -0.48, z); plate.rotation.z = Math.PI / 2; });
          });
        }
        if (i > 17 && i < 30 && i % 4 === 0) {
          for (let d = 0; d < 5; d += 1) {
            const dumbbell = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.08), whiteMat.clone()), 'dumbbell', i + d); dumbbell.position.set(3.73, -1.25 + d * .18, z - .45);
            const bell = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.12), redMat.clone()), 'dumbbell', i + d); bell.position.set(3.74, -1.25 + d * .18, z - .62);
          }
        }
        if (i > 24 && i < 34 && i % 3 === 1) {
          const bikeBase = addMesh(new THREE.Mesh(new THREE.BoxGeometry(.72, .06, .18), steelMat.clone()), 'bike', i); bikeBase.position.set(2.45, -1.38, z);
          const wheelA = addMesh(new THREE.Mesh(new THREE.TorusGeometry(.22, .018, 8, 24), whiteMat.clone()), 'bike', i); wheelA.position.set(2.18, -1.15, z); wheelA.rotation.y = Math.PI / 2;
          const wheelB = addMesh(new THREE.Mesh(new THREE.TorusGeometry(.18, .015, 8, 24), whiteMat.clone()), 'bike', i); wheelB.position.set(2.72, -1.17, z); wheelB.rotation.y = Math.PI / 2;
          const rower = addMesh(new THREE.Mesh(new THREE.BoxGeometry(.95, .04, .12), greenMat.clone()), 'rower', i); rower.position.set(-3.0, -1.42, z);
        }
        if (i > 28 && i < 38 && i % 5 === 0) {
          const rope = addMesh(new THREE.Mesh(new THREE.TorusGeometry(.48, .026, 8, 72), redMat.clone()), 'rope', i); rope.position.set(-3.55, -0.42, z); rope.rotation.y = Math.PI / 2;
        }
        if (i > 33 && i % 3 === 0) {
          const bed = addMesh(new THREE.Mesh(new THREE.BoxGeometry(1.4, .16, .52), mat('#72c7ad', .5)), 'recovery', i); bed.position.set(i % 2 ? -2.8 : 2.8, -1.34, z);
          const sign = makeLabel('RECOVERY', '#72c7ad'); sign.position.set(i % 2 ? -3.87 : 3.87, .42, z - .2); sign.rotation.y = i % 2 ? Math.PI / 2 : -Math.PI / 2; addMesh(sign, 'sign', i);
        }
        if (i % 8 === 0) {
          const doorway = addMesh(new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.05, 0.055), mirrorMat.clone()), 'doorway', i); doorway.position.set(i % 16 === 0 ? -3.9 : 3.9, -0.43, z - 0.68); doorway.rotation.y = Math.PI / 2;
        }
      }
      zoneData.forEach((zone, idx) => {
        const label = makeLabel(zone.name, zone.color); label.position.set(0, 0.75, zone.z); addMesh(label, 'zone-label', idx);
        const gate = addMesh(new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.04, .08), mat(zone.color, .58)), 'zone-gate', idx); gate.position.set(0, 1.03, zone.z - .6);
      });
      const particleGeo = new THREE.BufferGeometry();
      const count = 420;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) { pos[i * 3] = (Math.random() - 0.5) * 6.6; pos[i * 3 + 1] = -1.45 + Math.random() * 2.2; pos[i * 3 + 2] = 9 - Math.random() * 84; }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.018, transparent: true, opacity: 0.28 }));
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
      objects.forEach(({ mesh }) => {
        mesh.geometry?.dispose?.();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((m) => { m?.map?.dispose?.(); m?.dispose?.(); });
        mesh.userData?.map?.dispose?.();
      });
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
      <header className="relative z-10 mx-auto max-w-7xl border-b border-[#ffe6cb]/10 pb-10 pt-8">
        <div className="max-w-4xl animate-slide-up">
          <div className="eyebrow mb-6 inline-flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-[#ffbd38]" /> Web Design Portfolio</div>
          <h1 className="max-w-5xl whitespace-nowrap text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-[#fff8ec] sm:text-7xl lg:text-8xl">Cooper Nusbaum</h1>
          <p className="mt-5 inline-flex rounded-full border border-[#ffbd38]/25 bg-[#ffbd38]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#ffbd38] sm:text-sm">Bring Your Business to Life</p>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-5 pb-24">
        {sites.map((site, index) => <PreviewCard key={site.id} site={site} index={index} onOpen={() => setSelected(site.id)} />)}
      </section>

      {activeSite && (
        <div className="site-modal fixed inset-0 z-50 overflow-y-auto bg-black/82 p-2 backdrop-blur-xl sm:p-4" role="dialog" aria-modal="true" aria-label={`${activeSite.title} website preview`} onScroll={(event) => setScrollProgress(progressFrom(event.currentTarget))}>
          <button data-close-site className="focus-visible-ring fixed right-4 top-4 z-[60] inline-flex items-center gap-2 rounded-lg border border-[#ffe6cb]/15 bg-[#041c1c]/80 px-4 py-3 text-sm font-medium text-[#fff8ec] shadow-2xl backdrop-blur-xl transition hover:border-[#ffbd38]/45 hover:bg-[#092626]" onClick={() => setSelected(null)}><X size={17} /> Close</button>
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
        <div><div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#ffe6cb]/12 bg-[#ffe6cb]/[0.035]" style={{ color: site.accent }}><Icon size={22} /></div><p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-[#ffe6cb]/44">{site.category}</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-[#fff8ec] sm:text-3xl">{site.title}</h2></div>
        <div className="mt-7 flex items-center justify-start text-[0.68rem] uppercase tracking-[0.16em] text-[#ffe6cb]/45"><span className="trace-button inline-flex items-center gap-2 text-[#fff8ec]">Open <ArrowUpRight size={14} /></span></div>
      </div>
      <div className="preview-mask relative h-[27rem] overflow-hidden lg:h-auto"><div className="absolute inset-x-0 top-0 origin-top scale-[0.62] sm:scale-[0.72] lg:scale-[0.66] xl:scale-[0.74]"><div className="pointer-events-none h-[70rem] w-[142%] -translate-x-[15%] rounded-xl border border-[#ffe6cb]/10 bg-black shadow-2xl"><SiteRenderer site={site} /></div></div><div className="pointer-events-none absolute inset-x-6 bottom-5 z-20 rounded-lg border border-[#ffe6cb]/12 bg-[#041c1c]/70 px-4 py-3 text-center text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#ffe6cb]/68 backdrop-blur-xl">Portfolio project</div></div>
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
  const classes = [
    ['5:40', 'Open Gym', 'Strength primer + mobility'],
    ['6:15', 'Forge 45', 'Sleds, ropes, rowers, assault bikes'],
    ['7:10', 'Hypertrophy', 'Rack work + dumbbell density'],
    ['8:00', 'Recovery', 'Compression, breath, cold rinse'],
  ];
  const programs = [
    ['Strength', 'Rack-led blocks, bar speed notes, spotter rotation.'],
    ['Conditioning', 'Heart-rate caps, sled track waves, rower intervals.'],
    ['Hypertrophy', 'Dumbbell wall, tempo sets, form videos after class.'],
    ['Recovery', 'Mobility table, cold plunge protocol, coach check-out.'],
  ];
  const walkProgress = Math.min(1, scrollProgress * 1.6);
  const beatIndex = Math.min(pulseWalkthroughBeats.length - 1, Math.floor(Math.max(0, Math.min(.999, walkProgress)) * pulseWalkthroughBeats.length));
  const activeBeat = pulseWalkthroughBeats[beatIndex];
  return <div className={`site-canvas pulse-site ${expanded ? 'pulse-site-walkthrough' : ''} text-white`}>
    {expanded && <section className="pulse-walk-stage" aria-label="PulseForge gym tour"><Suspense fallback={<div className="pulse-walkthrough pulse-walkthrough-loading">Loading gym tour</div>}><PulseForgeWalkthrough active={expanded} scrollProgress={walkProgress} /></Suspense><aside className="pulse-walk-ui" aria-label="PulseForge tour progress"><p>Gym tour</p><strong>{activeBeat[0]}</strong><span>{activeBeat[1]}</span><div>{pulseWalkthroughBeats.map(([label], i) => <i key={label} className={i <= beatIndex ? 'active' : ''}>{label}</i>)}</div></aside><div className="pulse-walk-title"><p>South Austin performance club</p><h3>Walk the gym before the trial pass.</h3><span>Reception, turf, racks, conditioning, and recovery in one tour.</span></div></section>}
    <nav className="pulse-nav"><b>PF/06</b><span>Entrance</span><span>Turf</span><span>Strength</span><span>Conditioning</span><span>Recovery</span><button>Trial pass</button></nav>
    <section className="pulse-hero pulse-walk-hero">{expanded ? <div className="pulse-scene-spacer" /> : <BrandImage site={site} className="pulse-photo" />}<div className="pulse-copy"><p>South Austin performance club</p><h3>Strength. Speed. Return.</h3><div className="pulse-actions"><button>Start 7-day trial</button><button>Tour the gym</button></div></div><div className="pulse-meter"><span>Live class load</span><strong>84%</strong><i /></div></section>
    <section className="pulse-map"><h4>Tour the club: entrance → turf lane → strength → conditioning → recovery.</h4><div>{['Reception desk + branded wall', 'rubber floor + green turf sled track', 'squat racks + dumbbell wall + benches', 'rowers + assault bikes + ropes', 'glass recovery room + cold plunge'].map((x, i) => <span key={x}><b>{String(i+1).padStart(2,'0')}</b>{x}</span>)}</div></section>
    <section className="pulse-zones"><h4>What the tour passes.</h4>{['Entrance', 'Turf Lane', 'Strength Zone', 'Conditioning Zone'].map((z, i) => <article key={z}><span>0{i+1}</span><h5>{z}</h5><p>{['Check-in desk, concrete wall, branded signage, and first view down the training floor.', 'Green turf, sled rails, hash marks, rubber flooring, and overhead strip lights.', 'Squat racks, benches, dumbbell wall, plates, mirrors, and steel frames.', 'Rower row, assault bikes, battle ropes, kettlebells, coach lane, and recovery handoff.'][i]}</p></article>)}</section>
    <section className="pulse-rhythm"><div><h4>Tonight's class rhythm.</h4><p>Every block has a coach station, equipment zone, and recovery handoff. Trial members get placed into the safest lane instead of guessing.</p></div><div>{classes.map(([time, name, note]) => <article key={time}><strong>{time}</strong><h5>{name}</h5><p>{note}</p></article>)}</div></section>
    <section className="pulse-programs"><h4>Training method.</h4>{programs.map(([name, copy]) => <article key={name}><h5>{name}</h5><p>{copy}</p></article>)}</section>
    <section className="pulse-coaches"><div><h4>Coaches who correct you before the rep gets ugly.</h4><p>Book a trial and train with a floor lead, not a sales rep. Every session starts with movement screening and ends with a recovery recommendation.</p></div>{['Mara — Strength mechanics', 'Dev — Conditioning engine', 'Anika — Mobility + return-to-training'].map((c) => <span key={c}>{c}</span>)}</section>
    <section className="pulse-pricing"><h4>Settle into the final trial-pass view.</h4>{['Trial week / $0', 'Unlimited / $189 mo', 'Semi-private / $340 mo'].map((p) => <article key={p}><h5>{p}</h5><p>Includes coaching notes, class booking, and recovery access.</p></article>)}</section>
  </div>;
}
function AtlasEstate({ site, scrollProgress }) {
  const listings = [
    ['Glass House No. 8', '$6.2M · 4 bed', 'Ocean path, library wall, morning light', '/brand-images/atlas-interior.webp'],
    ['Cliff Road Villa', '$8.9M · gated bluff', 'Bluff view, privacy drive, airport in 22', '/brand-images/atlas-cliff-villa.webp'],
    ['Juniper Courtyard', '$3.7M · retreat', 'Internal courtyard, guest casita option', '/brand-images/atlas-courtyard.webp'],
    ['Pool House Reserve', '$5.4M · guest house', 'Pool pavilion, privacy wall, shoreline walk', '/brand-images/atlas-guest-house.webp'],
    ['Library Bluff House', '$7.1M · office wing', 'Walnut library, office suite, quiet approach', '/brand-images/atlas-library.webp'],
  ];
  const process = ['Discovery', 'Route', 'Tour', 'Offer', 'Close'];
  return <div className="site-canvas atlas-site"><nav className="atlas-nav"><span>Atlas Estate</span><span>Private list · Coastal advisory · Buyer concierge</span></nav><section className="atlas-hero"><div className="atlas-title"><p>By-appointment coastal brokerage</p><h3>Homes that rarely reach the open market.</h3><button>Request the private list</button></div><BrandImage site={site} className="atlas-photo" /><aside><strong>$4.8M</strong><span>average private transaction</span><strong>37</strong><span>quiet listings this quarter</span></aside></section><section className="atlas-route"><ScrollDrawSvg viewBox="0 0 900 320" progress={scrollProgress} paths={[{ d: 'M40 260 C 180 80, 320 240, 450 120 S 680 80, 850 210', stroke: '#c7985c', strokeWidth: 5, start: .08, end: .42 }]}><circle cx="450" cy="120" r="8" /><circle cx="710" cy="130" r="8" /></ScrollDrawSvg><div><h4>A guided route through neighborhoods, not a feed of listings.</h4><p>We start with schools, shoreline, privacy, guest-house rules, airport time, and the difference between beautiful photos and a livable week.</p></div></section><section className="atlas-process"><h4>Buyer advisory path.</h4>{process.map((step, i) => <article key={step}><span>{String(i+1).padStart(2,'0')}</span><h5>{step}</h5><p>{['Budget, lifestyle, schools, privacy, non-negotiables.', 'A private driving route ordered by daily life, not price.', 'One-day tour plan with notes, comps, and seller context.', 'Quiet offer strategy, due diligence, and terms.', 'Closing calendar, vendors, insurance, and move-in brief.'][i]}</p></article>)}</section><section className="atlas-listings atlas-listings-wide">{listings.map(([name, price, angle, src]) => <article key={name}><Photo src={src} alt={`${name} property photography`} shade={false} /><p>Private residence</p><h5>{name}</h5><span>{price}</span><em>{angle}</em></article>)}</section><section className="atlas-intake"><h4>Tell us what should never hit Zillow.</h4><div>{['Budget range', 'Timeline', 'School / commute', 'Guest-house needs', 'Privacy threshold', 'Airport access'].map((f) => <span key={f}>{f}</span>)}</div><button>Begin buyer intake</button></section></div>;
}

function VerdantWorks({ site, scrollProgress }) {
  const transformations = [
    ['Before: patchy slope', '/brand-images/verdant-before.webp'],
    ['After: stone steps + meadow', '/brand-images/verdant-after.webp'],
    ['Care: monthly cutback', '/brand-images/verdant-care.webp'],
  ];
  return <div className="site-canvas verdant-site"><header><div><p>Outdoor rooms for real weather</p><h3>Courtyards, patios, and native gardens that settle in beautifully.</h3><button>Schedule a yard walk</button></div><BrandImage site={site} /></header><section className="verdant-plan"><div><h4>Site plan → phases → completion.</h4><p>The plan follows the yard: drainage, stone path, planting pockets, then final care.</p></div><ScrollDrawSvg viewBox="0 0 620 360" progress={scrollProgress} paths={[{ d: 'M62 290 C150 120 260 295 365 105 S530 80 578 230', stroke: '#486b32', strokeWidth: 6, start: .1, end: .46 }, { d: 'M95 175 C190 210 310 110 500 150', stroke: '#9c6d3c', strokeWidth: 3, start: .22, end: .58 }]}><circle cx="62" cy="290" r="7" /><circle cx="365" cy="105" r="7" /><circle cx="578" cy="230" r="7" /></ScrollDrawSvg></section><section className="verdant-wipe">{transformations.map(([x, src]) => <article key={x}><Photo src={src} alt={`${x} landscaping photography`} shade={false} /><h5>{x}</h5></article>)}</section><section className="verdant-packages"><h4>Service tiers that match the yard.</h4>{[['Foundation plan', '$1.8k design', 'Shade map, drainage notes, material board.'], ['Courtyard build', '$18k–$55k', 'Stone, beds, irrigation, lighting, install crew.'], ['Seasonal steward', '$240/mo', 'Cutback, soil, pruning, storm reset, plant health.']].map(([name, price, copy]) => <article key={name}><span>{price}</span><h5>{name}</h5><p>{copy}</p></article>)}</section><section className="verdant-services"><h4>What homeowners actually need.</h4>{['Outdoor room design', 'Native planting', 'Stone + water', 'Seasonal care plans', 'Lighting', 'Storm cleanup'].map((service) => <span key={service}>{service}</span>)}</section><section className="verdant-timeline"><h4>Seasonal care timeline.</h4>{['Spring soil + pruning', 'Summer irrigation watch', 'Fall cutback + bulbs', 'Winter storm reset'].map((x) => <span key={x}>{x}</span>)}</section><section className="verdant-estimate"><h4>Get a useful estimate.</h4><p>Send yard size, photos, sun exposure, slope/drainage notes, budget range, and the outdoor room you wish existed.</p><button>Start estimate</button></section></div>;
}

function OrbitSupply({ site, expanded, scrollProgress }) {
  const products = [
    ['OS-AERO-42', 'AeroShell Pack', '$248', '42L · carbon frame', 'commute / field'],
    ['OS-GRID-08', 'Grid Pouch', '$48', 'magnetic grid · 180g', 'daily carry'],
    ['OS-RAIN-01', 'Rain Skin', '$36', 'ripstop shell · taped seam', 'storm cover'],
    ['OS-CLIP-04', 'Rail Clips', '$18', 'anodized set of 4', 'strap mods'],
    ['OS-SLEEVE-16', 'Thermal Sleeve', '$64', '16in · insulated felt', 'laptop'],
    ['OS-BOTTLE-24', 'Vac Bottle', '$42', '24oz · matte steel', 'hydration'],
    ['OS-CUBE-12', 'Pack Cube', '$32', '12L · mesh wall', 'clothes'],
    ['OS-LIGHT-02', 'Signal Light', '$58', 'USB-C · amber/red', 'night ride'],
  ];
  return <div className="site-canvas orbit-site text-white"><nav><span>ORBIT SUPPLY / DROP 04</span><button>Cart — 3 items · $332</button></nav><section className="orbit-hero"><div><p>Adaptive carry system</p><h3>AeroShell Pack</h3><p>Weather shell, carbon frame, removable grid pouch, and strap hardware built for commuters who pack like field operators.</p><button>Reserve the drop</button></div><div className="orbit-object"><BrandImage site={site} shade={false} /><ThreeScene variant="morph" active={expanded} scrollProgress={scrollProgress} /></div></section><section className="orbit-detail"><Photo src="/brand-images/orbit-packaging.webp" alt="Orbit Supply kit packaging and components" shade={false} /><div><span>Hero item / OS-AERO-42</span><h4>AeroShell Pack detail.</h4><p>Carbon U-frame, roll-top rain shell, magnetic front grid, 16-inch thermal sleeve, removable compression straps, and repairable buckle hardware.</p><div>{['Graphite', 'Ion blue', 'Field clay', 'Night violet'].map((v, i) => <button key={v} style={{ '--swatch': ['#24262d','#73f5ff','#9b7b5a','#7d5cff'][i] }}>{v}</button>)}</div></div></section><section className="orbit-specs"><h4>Material states change with the day.</h4>{['Rain shell beads water', 'Carbon frame keeps load shape', 'Grid pouch snaps off', 'Thermal sleeve protects battery'].map((s) => <article key={s}><h5>{s}</h5><p>Product details stay clear from every angle.</p></article>)}</section><section className="orbit-filters"><span>All gear</span><span>Packs</span><span>Modular pouches</span><span>Weather</span><span>Accessories</span></section><section className="orbit-catalog">{products.map(([sku, name, price, spec, use]) => <article key={sku}><small>{sku}</small><h5>{name}</h5><strong>{price}</strong><p>{spec}</p><em>{use}</em></article>)}</section><section className="orbit-cart"><Photo src="/brand-images/orbit-packaging.webp" alt="Orbit Supply packaging and components" shade={false} /><h4>Complete the kit.</h4><div>{['AeroShell Pack — $248', 'Grid pouch — $48', 'Rain skin — $36'].map((i) => <span key={i}>{i}</span>)}<strong>Total — $332</strong></div><button>Checkout</button></section></div>;
}

function TheMargin({ site }) {
  const articles = [
    ['Essay', 'The craft hiding in boring tools.', '11 min'],
    ['Interview', 'Small teams, big taste.', '18 min'],
    ['Field notes', 'What the spreadsheet remembered.', '7 min'],
    ['Letters', 'Against launch-day theater.', '5 min'],
  ];
  return <div className="site-canvas margin-site"><section className="margin-mast"><p>Issue 09 / Work, attention, small teams</p><h3>The Margin</h3><BrandImage site={site} className="margin-cover" /></section><section className="margin-lede"><article><span>Cover essay · 11 min</span><h4>The craft hiding in boring tools.</h4><p>Why useful software often looks quiet before it becomes indispensable.</p></article><article><span>Editor letter</span><h4>Build less theater.</h4><p>Notes on useful interfaces, patient distribution, and the kind of polish that survives a Monday morning.</p></article></section><section className="margin-archive"><aside><h4>Current issue</h4><p>No. 09 · Work, attention, small teams</p>{['No. 08 Taste under constraint', 'No. 07 The useful internet', 'No. 06 Quiet software'].map((i) => <span key={i}>{i}</span>)}</aside><div>{articles.map(([cat, title, time]) => <article key={title}><span>{cat}</span><h5>{title}</h5><small>{time}</small></article>)}</div></section><section className="margin-rail"><h4>Read the issue</h4>{['Field notes', 'Essays', 'Interviews', 'Archive', 'Letters'].map((c) => <span key={c}>{c}</span>)}</section><section className="margin-layout"><div><h4>A slower place to read about building.</h4><p>Monthly issue, editor notes, research links, printable margins, and a small archive that rewards returning instead of refreshing.</p><button>Subscribe for the next issue</button></div><Photo src="/brand-images/margin-spread.webp" alt="The Margin open issue spread" shade={false} /></section><section className="margin-editor"><h4>Edited by people who still annotate PDFs.</h4><p>Subscribers get the issue, source notes, and one compact editor memo — no daily drip, no engagement bait.</p></section></div>;
}

function EmberTable({ site }) {
  return <div className="site-canvas ember-site text-white"><section className="ember-hero"><BrandImage site={site} /><nav><span>Ember Table</span><button>Reserve</button></nav><div><p>Wood fire dining · East side</p><h3>Smoke, citrus, and a table close to the hearth.</h3><button>Reserve tonight</button></div></section><section className="ember-courses"><h4>Tonight's tasting sequence</h4>{['Hearth bread + cultured butter', 'Charred citrus salad', 'Coal-roasted chicken', 'Saffron panna cotta'].map((c, i) => <article key={c}><span>{i+1}</span><h5>{c}</h5><p>{['Warm pull-apart loaf, black salt.', 'Bitter greens, ember oil, orange.', 'Fermented chili, winter herbs.', 'Olive oil, sea salt, smoke.'][i]}</p></article>)}</section><section className="ember-menu"><h4>À la carte and supplements.</h4>{[['Oysters near the coals', '$22', 'shallot smoke mignonette'], ['Charred prawns', '$28', 'calabrian butter'], ['Ribeye for two', '$86', 'bone marrow jus'], ['Wine pairing', '$58', 'four half-pours']].map(([name, price, note]) => <article key={name}><h5>{name}</h5><span>{price}</span><p>{note}</p></article>)}</section><section className="ember-room"><Photo src="/brand-images/ember-room.webp" alt="Ember Table dining room and hearth" shade={false} /><div><h4>The room glows differently after 7pm.</h4><p>Counter seats face the fire. Booths are quieter. Private dining takes over the back room for twelve, with a chef note and paired ember courses.</p></div></section><section className="ember-reserve"><h4>Book dinner or private fire-room events.</h4><div>{['Party size', 'Preferred time', 'Counter / booth / room', 'Occasion', 'Dietary notes'].map((f) => <span key={f}>{f}</span>)}</div><button>Find a table</button></section></div>;
}

function LumaSpa({ site }) {
  const treatments = [
    ['The Quiet Facial', '70 min', '/brand-images/luma-facial.webp', 'Barrier repair, lymphatic massage, warm compress.'],
    ['Sauna + cold rinse', '45 min', '/brand-images/luma-sauna.webp', 'Private sauna, rinse circuit, mineral towel service.'],
    ['Stone table recovery', '80 min', '/brand-images/luma-stone.webp', 'Heated stones, shoulder release, breath pacing.'],
    ['Monthly glow membership', '$118/mo', '/brand-images/luma-membership.webp', 'One ritual credit, product shelf discount, priority evenings.'],
  ];
  return <div className="site-canvas luma-site"><section className="luma-hero"><div><p>Skin · sauna · nervous system</p><h3>Leave quieter than you arrived.</h3><p>Guided treatments, warm rooms, practitioner-led rituals, and booking that feels as calm as the visit.</p><button>Find your treatment</button></div><BrandImage site={site} shade={false} /></section><section className="luma-breathe"><div className="breath-orb" /><h4>Start with how you want to feel.</h4><div>{['Reset tension', 'Calm skin', 'Recover deeply', 'Gift a ritual'].map((x) => <span key={x}>{x}</span>)}</div></section><section className="luma-finder"><h4>Ritual finder.</h4>{['I need skin calm', 'I need heat + cold', 'I need muscle release', 'I am booking for someone else'].map((x) => <button key={x}>{x}</button>)}</section><section className="luma-treatments">{treatments.map(([t, meta, src, copy]) => <article key={t}><Photo src={src} alt={`${t} ritual photography`} shade={false} /><h5>{t}</h5><span>{meta}</span><p>{copy}</p></article>)}</section><section className="luma-practitioners"><h4>Practitioners with notes, not scripts.</h4>{[['Mara V.', 'skin barrier + facial massage'], ['Elian S.', 'sauna circuit + recovery'], ['Nora K.', 'stone therapy + breathwork']].map(([name, note]) => <article key={name}><h5>{name}</h5><p>{note}</p></article>)}</section><section className="luma-book"><h4>Book without rushing.</h4><p>Choose pressure, focus, room preference, practitioner, gift card recipient, and whether you want quiet check-in or conversation.</p><button>Open booking</button></section></div>;
}

export default PortfolioApp;
