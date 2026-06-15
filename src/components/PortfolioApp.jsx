import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ArrowUpRight,
  Dumbbell,
  Home,
  Leaf,
  ShoppingBag,
  Newspaper,
  Utensils,
  Waves,
  X,
} from 'lucide-react';

const sites = [
  {
    id: 'pulseforge',
    title: 'PulseForge Gym',
    category: 'Performance gym',
    one: 'Scroll-driven 3D tunnel, aggressive conversion flow, class proof, coach trust, and membership pricing.',
    palette: 'Crimson / graphite / white',
    accent: '#ff2d55',
    Icon: Dumbbell,
  },
  {
    id: 'atlas',
    title: 'Atlas Estate',
    category: 'Luxury real estate',
    one: 'Editorial brokerage site with drawn market routes, premium listings, neighborhood intelligence, and private intake.',
    palette: 'Stone / espresso / brass',
    accent: '#b78342',
    Icon: Home,
  },
  {
    id: 'verdant',
    title: 'Verdant Works',
    category: 'Landscaping',
    one: 'Organic services site with animated growth paths, before/after systems, maintenance plans, and estimate flow.',
    palette: 'Moss / clay / sun',
    accent: '#91d36b',
    Icon: Leaf,
  },
  {
    id: 'orbit',
    title: 'Orbit Supply',
    category: 'E-commerce',
    one: 'Premium product drop with scroll-reactive shader morphing, variants, bundle builder, and cart moments.',
    palette: 'Violet / cyan / black',
    accent: '#73f5ff',
    Icon: ShoppingBag,
  },
  {
    id: 'margin',
    title: 'The Margin',
    category: 'Editorial blog',
    one: 'Print-inspired publication with real article systems, issue navigation, author modules, and subscription surface.',
    palette: 'Cream / ink / oxblood',
    accent: '#8c2f39',
    Icon: Newspaper,
  },
  {
    id: 'ember',
    title: 'Ember Table',
    category: 'Restaurant',
    one: 'Moody hospitality site with kinetic menu, seasonal tasting flow, private events, chef note, and booking UI.',
    palette: 'Char / saffron / paprika',
    accent: '#ffb703',
    Icon: Utensils,
  },
  {
    id: 'luma',
    title: 'Luma Spa',
    category: 'Wellness studio',
    one: 'Soft luxury wellness site with treatment finder, practitioner trust, rituals, membership, and booking flow.',
    palette: 'Mist / jade / charcoal',
    accent: '#7de2bd',
    Icon: Waves,
  },
];

const siteContent = {
  pulseforge: {
    dark: true,
    nav: ['Classes', 'Coaches', 'Proof', 'Pricing'],
    kicker: 'Scroll wheel drives the tunnel',
    title: 'Train like the room is moving.',
    copy: 'A performance gym site that turns intensity into interface: camera fly-through, live class state, recovery proof, coach authority, and a trial pass that stays one tap away.',
    primary: 'Claim 7-day pass',
    secondary: 'Watch the path',
    stats: ['42 weekly classes', '11 coaches', '4.9 member score'],
    sections: [
      ['Class engine', 'Filter by intensity, modality, recovery load, and open capacity. The schedule behaves like a product surface, not a PDF.'],
      ['Coach authority', 'Each coach has a proof block: specialty, certification, transformation notes, and intro video slot.'],
      ['Membership math', 'Trial pass, unlimited, semi-private, and recovery add-ons are framed as clear paths instead of hidden pricing.'],
    ],
    cards: ['Velocity Circuit', 'Iron Form', 'Cold Reset', 'Mobility Lab', 'Engine Room', 'Grip + Core'],
  },
  atlas: {
    dark: false,
    nav: ['Residences', 'Markets', 'Private list', 'Advisory'],
    kicker: 'Off-market routes / coastal inventory',
    title: 'Find the address before it becomes obvious.',
    copy: 'A luxury brokerage website built like a private briefing: editorial market routes, featured residences, neighborhood context, and a buyer-intake path that feels concierge-level.',
    primary: 'Request private list',
    secondary: 'View residences',
    stats: ['$4.8M average', '37 off-market', '12 coastal towns'],
    sections: [
      ['Private inventory', 'A polished listing grid with scarcity, context, and image-led hierarchy instead of generic real-estate cards.'],
      ['Market intelligence', 'Path-drawn neighborhood movement makes price, school, and shoreline data feel spatial and premium.'],
      ['Buyer intake', 'A high-touch form captures budget, timeline, lifestyle, and must-have criteria without feeling transactional.'],
    ],
    cards: ['Glass House No. 8', 'Cliff Road Villa', 'Juniper Courtyard', 'Harbor Loft', 'Cedar Ridge', 'Marble Lane'],
  },
  verdant: {
    dark: true,
    nav: ['Work', 'Plans', 'Seasonal care', 'Estimate'],
    kicker: 'Outdoor rooms / living systems',
    title: 'Landscapes with a pulse.',
    copy: 'A landscaping site that makes homeowners trust the crew before they call: before/after stories, maintenance plans, plant logic, and an estimate flow that asks the right questions.',
    primary: 'Plan my yard',
    secondary: 'See transformations',
    stats: ['6 service paths', '24 month care plans', 'Native-first installs'],
    sections: [
      ['Before / after proof', 'Large tactile cards compare messy lots, design sketches, and finished outdoor rooms.'],
      ['Seasonal maintenance', 'Plans are structured around homeowner outcomes: shade, privacy, water, texture, and care cadence.'],
      ['Estimate clarity', 'The request flow gathers yard size, sun exposure, drainage, budget, and inspiration in one guided screen.'],
    ],
    cards: ['Courtyard reset', 'Native meadow', 'Stone + water', 'Privacy wall', 'Lighting pass', 'Winter prep'],
  },
  orbit: {
    dark: true,
    nav: ['Drop', 'Material', 'Bundles', 'Cart'],
    kicker: 'Scroll-reactive shader object',
    title: 'Gear that changes under light.',
    copy: 'A product-drop website that treats the product as an artifact: shader morphing, variant rails, material storytelling, bundle logic, and a cart that feels expensive.',
    primary: 'Shop the drop',
    secondary: 'Morph material',
    stats: ['Drop 04', '3 shells', '248 USD'],
    sections: [
      ['Material story', 'The object bends from matte shell to iridescent membrane as the page scrolls through construction details.'],
      ['Variant rail', 'Colorways, strap systems, and capacity options are previewed as tactile cards with strong product hierarchy.'],
      ['Cart moment', 'A sticky bundle builder combines pack, pouch, and weather shell without interrupting the visual story.'],
    ],
    cards: ['AeroShell Pack', 'Grid Pouch', 'Rain Skin', 'Carbon Sling', 'Thermal Tag', 'Field Clip'],
  },
  margin: {
    dark: false,
    nav: ['Issue 09', 'Essays', 'Interviews', 'Subscribe'],
    kicker: 'Field notes / essays / interviews',
    title: 'A magazine for slower internet thoughts.',
    copy: 'A publication site with a real editorial system: issue cover, story rails, author notes, reading rhythm, archive structure, and a subscription ask that feels earned.',
    primary: 'Read issue 09',
    secondary: 'Browse archive',
    stats: ['9 issues', '32 essays', '4 columns'],
    sections: [
      ['Issue architecture', 'A cover story, secondary essays, and sidebars create an actual publication hierarchy.'],
      ['Author modules', 'Bylines, disciplines, notes, and reading-time metadata help the reader decide what to open next.'],
      ['Subscriber letter', 'The paid ask is editorial: receive the issue, notes from the editor, and reading lists.'],
    ],
    cards: ['The craft hiding in boring tools', 'Small teams, big taste', 'A field guide to useful friction', 'Notes on attention', 'Against infinite feeds', 'The quiet launch'],
  },
  ember: {
    dark: true,
    nav: ['Menu', 'Room', 'Events', 'Reserve'],
    kicker: 'Wood fire / seasonal menu',
    title: 'Dinner should glow before it arrives.',
    copy: 'A hospitality website with atmosphere and utility: kinetic menu, seasonal tasting story, chef perspective, event inquiries, and a reservation module that stays obvious.',
    primary: 'Reserve tonight',
    secondary: 'View menu',
    stats: ['18 seat hearth room', '5 course fire menu', 'Private events'],
    sections: [
      ['Seasonal menu', 'Dish cards are written like sensory notes and organized by fire, smoke, acid, and sweet.'],
      ['Room story', 'Interior, sound, and service details sell the experience before the booking widget appears.'],
      ['Events inquiry', 'A private-dining module captures party size, mood, menu style, and timing.'],
    ],
    cards: ['Smoked beet tartare', 'Coal-roasted chicken', 'Hearth bread', 'Charred citrus', 'Juniper spritz', 'Saffron panna cotta'],
  },
  luma: {
    dark: false,
    nav: ['Treatments', 'Practitioners', 'Rituals', 'Book'],
    kicker: 'Skin / sauna / quiet systems',
    title: 'A softer booking flow for nervous systems.',
    copy: 'A wellness site that reduces friction: guided treatment finder, practitioner trust cards, memberships framed as rituals, and booking copy that feels calm instead of salesy.',
    primary: 'Find treatment',
    secondary: 'Meet practitioners',
    stats: ['12 treatments', '4 ritual paths', 'Quiet-first booking'],
    sections: [
      ['Treatment matcher', 'A soft questionnaire routes visitors by pressure, skin, recovery, stress, and time.'],
      ['Practitioner trust', 'Calm biography cards show modalities, certifications, and what each session feels like.'],
      ['Membership rituals', 'Monthly plans are framed around recovery rhythms: reset, glow, decompress, and maintain.'],
    ],
    cards: ['60 min reset', 'Sauna circuit', 'Skin ritual', 'Quiet facial', 'Breath table', 'Recovery membership'],
  },
};

function getScrollProgress(el) {
  if (!el) return 0;
  const max = Math.max(1, el.scrollHeight - el.clientHeight);
  return Math.min(1, Math.max(0, el.scrollTop / max));
}

function ThreeScene({ variant = 'fly', active = false, scrollProgress = 0 }) {
  const mount = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const progress = useRef(scrollProgress);

  useEffect(() => {
    progress.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 180);
    camera.position.set(0, 0, variant === 'fly' ? 12 : 5.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    host.appendChild(renderer.domElement);

    let raf = 0;
    const startedAt = performance.now();
    const objects = [];
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uColorA: { value: new THREE.Color(variant === 'fly' ? '#ff2d55' : '#73f5ff') },
      uColorB: { value: new THREE.Color(variant === 'fly' ? '#ffffff' : '#9b5cff') },
    };

    if (variant === 'fly') {
      scene.fog = new THREE.FogExp2('#050407', 0.038);
      const ringGeo = new THREE.TorusGeometry(2.35, 0.018, 8, 96);
      const gateGeo = new THREE.BoxGeometry(0.08, 2.4, 0.08);
      for (let i = 0; i < 34; i += 1) {
        const ringMat = new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? '#ffffff' : '#ff2d55', transparent: true, opacity: 0.16 + (i % 6) * 0.045, wireframe: true });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(Math.sin(i * 0.7) * 0.42, Math.cos(i * 0.55) * 0.28, -i * 2.35);
        ring.rotation.x = Math.PI / 2 + i * 0.065;
        ring.rotation.z = i * 0.38;
        scene.add(ring);
        objects.push({ mesh: ring, kind: 'ring', baseZ: ring.position.z, phase: i });

        if (i % 5 === 0) {
          const gateMat = new THREE.MeshBasicMaterial({ color: '#ff2d55', transparent: true, opacity: 0.34 });
          for (let side of [-1, 1]) {
            const gate = new THREE.Mesh(gateGeo, gateMat.clone());
            gate.position.set(side * (1.65 + (i % 3) * 0.24), 0, -i * 2.35 - 0.55);
            gate.rotation.z = i * 0.2;
            scene.add(gate);
            objects.push({ mesh: gate, kind: 'gate', baseZ: gate.position.z, phase: i });
          }
        }
      }

      const particleGeo = new THREE.BufferGeometry();
      const count = 1500;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const radius = 1.4 + Math.random() * 4.8;
        const a = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * radius;
        pos[i * 3 + 1] = Math.sin(a) * radius * 0.65;
        pos[i * 3 + 2] = -Math.random() * 86;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.025, transparent: true, opacity: 0.62 }));
      scene.add(particles);
      objects.push({ mesh: particles, kind: 'particles', baseZ: 0, phase: 0 });
    } else {
      const geometry = new THREE.IcosahedronGeometry(1.65, 92);
      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        vertexShader: `
          uniform float uTime;
          uniform float uScroll;
          uniform vec2 uMouse;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normal;
            vPosition = position;
            float tear = sin(position.x * 8.0 + uTime * 1.4 + uScroll * 8.0) * 0.18;
            float band = cos(position.y * 10.0 - uTime * 1.1) * 0.12;
            float pulse = sin(length(position.xy) * 7.0 + uScroll * 12.0) * 0.16;
            float mousePush = length(uMouse) * 0.18;
            vec3 morphed = position + normal * (tear + band + pulse + mousePush + uScroll * 0.42);
            morphed.x += sin(uScroll * 6.283 + position.y * 3.0) * 0.32 * uScroll;
            morphed.y += cos(uScroll * 6.283 + position.x * 3.0) * 0.24 * uScroll;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(morphed, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uScroll;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0,0.0,1.0)), 2.0);
            float bands = sin((vPosition.y + vPosition.x) * 9.0 + uTime * 2.0 + uScroll * 10.0) * 0.5 + 0.5;
            vec3 color = mix(uColorA, uColorB, bands) + fresnel * (0.55 + uScroll * 0.45);
            gl_FragColor = vec4(color, 0.9);
          }
        `,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      objects.push({ mesh, kind: 'morph' });

      const haloMat = new THREE.MeshBasicMaterial({ color: '#73f5ff', transparent: true, opacity: 0.12, wireframe: true });
      for (let i = 0; i < 7; i += 1) {
        const halo = new THREE.Mesh(new THREE.TorusGeometry(2.15 + i * 0.22, 0.006, 8, 120), haloMat.clone());
        halo.rotation.x = Math.PI / 2 + i * 0.1;
        halo.rotation.z = i * 0.7;
        scene.add(halo);
        objects.push({ mesh: halo, kind: 'halo', phase: i });
      }
      const light = new THREE.PointLight('#ffffff', 40, 18);
      light.position.set(2.2, 3.2, 4.2);
      scene.add(light);
    }

    const onPointer = (event) => {
      const rect = host.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.current.y = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };
    const resize = () => {
      const width = host.clientWidth || 600;
      const height = host.clientHeight || 380;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    host.addEventListener('pointermove', onPointer);
    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      const t = (performance.now() - startedAt) / 1000;
      const p = active ? progress.current : 0;
      uniforms.uTime.value = t;
      uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
      uniforms.uScroll.value = p;
      if (variant === 'fly') {
        const pathZ = 12 - p * 64;
        camera.position.x += (Math.sin(p * Math.PI * 2.1) * 1.1 + mouse.current.x * 0.42 - camera.position.x) * 0.045;
        camera.position.y += (Math.cos(p * Math.PI * 1.4) * 0.42 + mouse.current.y * 0.28 - camera.position.y) * 0.045;
        camera.position.z += (pathZ - camera.position.z) * 0.075;
        camera.lookAt(Math.sin(p * Math.PI * 2.4) * 1.2, Math.cos(p * Math.PI * 1.7) * 0.25, camera.position.z - 16);
        objects.forEach((obj, i) => {
          const m = obj.mesh;
          if (obj.kind === 'ring') {
            m.rotation.z += 0.005 + p * 0.018;
            m.rotation.x += 0.0015;
            m.material.opacity = 0.13 + Math.max(0, Math.sin((p * 34 - obj.phase) * 0.65)) * 0.35;
          } else if (obj.kind === 'gate') {
            m.rotation.z += 0.003;
            m.scale.y = 1 + Math.max(0, Math.sin((p * 34 - obj.phase) * 0.75)) * 0.65;
          } else if (obj.kind === 'particles') {
            m.rotation.z += 0.0008 + p * 0.002;
            m.rotation.y += 0.0006;
          }
          if (i % 7 === 0) m.position.x += Math.sin(t + i) * 0.0008;
        });
      } else {
        objects.forEach((obj) => {
          const m = obj.mesh;
          if (obj.kind === 'morph') {
            m.rotation.y = t * 0.38 + mouse.current.x * 0.45 + p * Math.PI * 1.5;
            m.rotation.x = Math.sin(t * 0.45) * 0.22 + mouse.current.y * 0.35 - p * 0.55;
            m.scale.setScalar(0.95 + p * 0.38 + Math.sin(t * 1.2) * 0.025);
          } else if (obj.kind === 'halo') {
            m.rotation.z += 0.004 + p * 0.012;
            m.rotation.y = Math.sin(t * 0.3 + obj.phase) * 0.22;
            m.material.opacity = 0.08 + p * 0.1;
          }
        });
        camera.position.z += (5.6 - p * 1.55 - camera.position.z) * 0.05;
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
        if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose?.());
        else mesh.material?.dispose?.();
      });
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [variant, active]);

  return <div ref={mount} className="three-shell absolute inset-0" aria-hidden="true" />;
}

function PortfolioApp() {
  const [selected, setSelected] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const activeSite = useMemo(() => sites.find((site) => site.id === selected), [selected]);

  useEffect(() => {
    const onDocClick = (event) => {
      const close = event.target.closest?.('[data-close-site]');
      if (close) {
        setSelected(null);
        return;
      }
      const opener = event.target.closest?.('[data-site-id]');
      if (opener?.dataset?.siteId) {
        setScrollProgress(0);
        setSelected(opener.dataset.siteId);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    document.documentElement.style.overflow = selected ? 'hidden' : '';
    const onKey = (event) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [selected]);

  return (
    <main className="showroom-shell relative min-h-screen overflow-hidden px-4 py-5 text-[#ffe6cb] sm:px-6 lg:px-10">
      <header className="relative z-10 mx-auto grid max-w-7xl gap-8 border-b border-[#ffe6cb]/10 pb-10 pt-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
        <div className="max-w-4xl animate-slide-up">
          <div className="eyebrow mb-6 inline-flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd38]" /> Interactive website portfolio
          </div>
          <h1 className="max-w-5xl text-4xl font-semibold leading-[0.94] tracking-[-0.055em] text-[#fff8ec] sm:text-6xl lg:text-7xl">
            Seven mini-sites, built like actual client directions.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#ffe6cb]/68 sm:text-lg">
            Each card opens into a longer, scrollable website concept with a distinct art direction, real sections, motion systems, SVG drawing, and selective scroll-synced WebGL.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="trace-chip">Scroll-driven 3D</span>
            <span className="trace-chip">Full inner sites</span>
            <span className="trace-chip">Worker-ready</span>
          </div>
        </div>
        <div className="system-card relative z-10 p-5 text-sm text-[#ffe6cb]/72">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#fff8ec]">Quality bar</p>
          <p className="mt-3 leading-6">Not copied from Hermes Dashboard — just the same discipline: restrained shell, precise controls, real hierarchy, and effects that earn their place.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-[#ffe6cb]/45">
            <span>Astro</span><span>React</span><span>Tailwind</span><span>Three.js</span>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-5 pb-24">
        {sites.map((site, index) => (
          <PreviewCard key={site.id} site={site} index={index} onOpen={() => setSelected(site.id)} />
        ))}
      </section>

      {activeSite && (
        <div
          className="site-modal fixed inset-0 z-50 overflow-y-auto bg-black/82 p-2 backdrop-blur-xl sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeSite.title} expanded preview`}
          onScroll={(event) => setScrollProgress(getScrollProgress(event.currentTarget))}
        >
          <button
            data-close-site
            className="focus-visible-ring fixed right-4 top-4 z-[60] inline-flex items-center gap-2 rounded-lg border border-[#ffe6cb]/15 bg-[#041c1c]/80 px-4 py-3 text-sm font-medium text-[#fff8ec] shadow-2xl backdrop-blur-xl transition hover:border-[#ffbd38]/45 hover:bg-[#092626]"
            onClick={() => setSelected(null)}
          >
            <X size={17} /> Exit site
          </button>
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
  return (
    <button
      data-site-id={site.id}
      onClick={onOpen}
      className="focus-visible-ring group showroom-card relative grid min-h-[25rem] w-full overflow-hidden text-left transition duration-500 hover:-translate-y-1 hover:border-[#ffe6cb]/24 hover:bg-[#ffe6cb]/[0.045] lg:grid-cols-[21rem_1fr]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative z-10 flex flex-col justify-between border-b border-[#ffe6cb]/10 p-6 lg:border-b-0 lg:border-r">
        <div>
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#ffe6cb]/12 bg-[#ffe6cb]/[0.035]" style={{ color: site.accent }}>
            <Icon size={22} />
          </div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-[#ffe6cb]/44">{site.category}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-[#fff8ec] sm:text-3xl">{site.title}</h2>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#ffe6cb]/58">{site.one}</p>
        </div>
        <div className="mt-7 flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.16em] text-[#ffe6cb]/45">
          <span>{site.palette}</span>
          <span className="trace-button inline-flex items-center gap-2 text-[#fff8ec]">
            Enter <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
      <div className="preview-mask relative h-[24rem] overflow-hidden lg:h-auto">
        <div className="absolute inset-x-0 top-0 origin-top scale-[0.68] sm:scale-[0.78] lg:scale-[0.72] xl:scale-[0.8]">
          <div className="pointer-events-none h-[60rem] w-[136%] -translate-x-[13%] rounded-xl border border-[#ffe6cb]/10 bg-black shadow-2xl">
            <SiteRenderer site={site} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-6 bottom-5 z-20 rounded-lg border border-[#ffe6cb]/12 bg-[#041c1c]/70 px-4 py-3 text-center text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#ffe6cb]/68 backdrop-blur-xl">
          full website preview — opens inline
        </div>
      </div>
    </button>
  );
}

function SiteRenderer({ site, expanded = false, scrollProgress = 0 }) {
  const props = { expanded, scrollProgress, site };
  switch (site.id) {
    case 'pulseforge': return <GymSite {...props} />;
    case 'atlas': return <RealEstateSite {...props} />;
    case 'verdant': return <LandscapingSite {...props} />;
    case 'orbit': return <EcommerceSite {...props} />;
    case 'margin': return <BlogSite {...props} />;
    case 'ember': return <RestaurantSite {...props} />;
    case 'luma': return <WellnessSite {...props} />;
    default: return null;
  }
}

function MiniNav({ site, dark = false }) {
  const content = siteContent[site.id];
  return (
    <div className={`relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] ${dark ? 'text-slate-950' : 'text-white'}`}>
      <span>{site.title}</span>
      <div className={`hidden gap-5 md:flex ${dark ? 'text-slate-900/55' : 'text-white/52'}`}>{content.nav.map((item) => <span key={item}>{item}</span>)}</div>
      <span className={`rounded-lg px-4 py-2 ${dark ? 'bg-slate-950 text-white' : 'bg-white text-black'}`}>{content.primary.split(' ')[0]}</span>
    </div>
  );
}

function HeroText({ site, dark = false }) {
  const content = siteContent[site.id];
  return (
    <div>
      <p className={`mb-5 text-xs font-black uppercase tracking-[0.36em] ${dark ? 'text-[#17202a]/65' : 'text-white/58'}`}>{content.kicker}</p>
      <h3 className={`max-w-3xl text-6xl font-black leading-[.86] tracking-[-0.08em] sm:text-8xl ${dark ? 'text-[#17202a]' : 'text-white'}`}>{content.title}</h3>
      <p className={`mt-7 max-w-xl text-lg leading-8 ${dark ? 'text-[#17202a]/70' : 'text-white/68'}`}>{content.copy}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {[content.primary, content.secondary].map((item, i) => <span key={item} className={`rounded-xl border px-5 py-3 text-sm font-black ${i === 0 ? 'border-transparent' : dark ? 'border-slate-900/15 bg-white/35' : 'border-white/15 bg-white/8'} ${i === 0 ? '' : dark ? 'text-[#17202a]' : 'text-white/74'}`} style={i === 0 ? { background: site.accent, color: content.dark ? '#fff' : '#0b1110' } : undefined}>{item}</span>)}
      </div>
      <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
        {content.stats.map((x) => <div key={x} className={`rounded-2xl border p-4 text-center text-xs font-black uppercase tracking-[0.12em] ${dark ? 'border-slate-900/10 bg-white/40 text-[#17202a]' : 'border-white/12 bg-black/20 text-white/72'}`}>{x}</div>)}
      </div>
    </div>
  );
}

function FullSiteSections({ site, dark = false }) {
  const content = siteContent[site.id];
  const text = dark ? 'text-[#17202a]' : 'text-white';
  const muted = dark ? 'text-[#17202a]/62' : 'text-white/62';
  const panel = dark ? 'border-black/10 bg-white/55 text-[#17202a] shadow-xl shadow-black/10' : 'border-white/12 bg-white/[0.07] text-white backdrop-blur-xl';
  return (
    <>
      <section className={`website-section relative z-10 mx-auto max-w-6xl px-6 py-20 ${text}`}>
        <div className="grid gap-10 border-t border-current/10 pt-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] opacity-45">Site architecture</p>
            <h4 className="mt-4 max-w-xl text-4xl font-black leading-[.95] tracking-[-0.06em] sm:text-6xl">Built past the hero.</h4>
            <p className={`mt-5 max-w-md text-base leading-7 ${muted}`}>These are intentionally full website directions: proof, product/service logic, conversion modules, and final contact/booking surfaces.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {content.sections.map(([title, copy], i) => (
              <article key={title} className={`min-h-64 rounded-[1.35rem] border p-5 ${panel}`}>
                <p className="text-xs uppercase tracking-[0.24em] opacity-45">0{i + 1}</p>
                <h5 className="mt-8 text-2xl font-black tracking-[-0.04em]">{title}</h5>
                <p className="mt-4 text-sm leading-6 opacity-65">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`website-section relative z-10 mx-auto max-w-6xl px-6 pb-20 ${text}`}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {content.cards.map((item, i) => (
            <article key={item} className={`group relative min-h-56 overflow-hidden rounded-[1.6rem] border p-5 ${panel}`}>
              <div className="absolute inset-x-0 top-0 h-24 opacity-45" style={{ background: `radial-gradient(circle at ${25 + i * 11}% 25%, ${site.accent}, transparent 42%)` }} />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.24em] opacity-45">{String(i + 1).padStart(2, '0')}</p>
                <ArrowUpRight className="opacity-35 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-80" size={18} />
              </div>
              <h5 className="relative z-10 mt-24 text-2xl font-black tracking-[-0.045em]">{item}</h5>
              <p className="relative z-10 mt-3 text-sm leading-6 opacity-58">A production-grade content block: image slot, concise copy, metadata, hover state, and next-step affordance.</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`website-section relative z-10 mx-auto max-w-6xl px-6 pb-24 ${text}`}>
        <div className={`overflow-hidden rounded-[2rem] border ${panel}`}>
          <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-8 sm:p-10">
              <p className="text-xs font-black uppercase tracking-[0.3em] opacity-45">Conversion surface</p>
              <h4 className="mt-5 max-w-2xl text-4xl font-black leading-none tracking-[-0.06em] sm:text-6xl">Make the next step feel obvious, not bolted on.</h4>
              <p className="mt-6 max-w-xl text-base leading-7 opacity-65">The forms are intentionally non-functional for this portfolio, but they are designed as real modules with fields a client would need.</p>
              <div className="mt-8 inline-flex rounded-xl px-5 py-3 text-sm font-black uppercase tracking-[0.14em]" style={{ background: site.accent, color: content.dark ? '#fff' : '#0b1110' }}>{content.primary}</div>
            </div>
            <div className="border-t border-current/10 p-6 lg:border-l lg:border-t-0">
              {['Name', 'Goal', 'Timeline', 'Budget / fit'].map((label) => <div key={label} className="mb-3 rounded-xl border border-current/10 bg-current/[0.035] px-4 py-4 text-sm font-semibold opacity-70">{label}</div>)}
              <div className="mt-4 rounded-xl border border-current/15 p-5 text-sm leading-6 opacity-62">A polished final module with clear affordance, readable fields, and enough detail to feel shippable without wiring a backend.</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function GymSite({ site, expanded, scrollProgress }) {
  return (
    <div className="site-canvas gym-bg relative text-white">
      <ThreeScene variant="fly" active={expanded} scrollProgress={scrollProgress} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.78),transparent_64%),radial-gradient(circle_at_70%_25%,rgba(255,45,85,.28),transparent_28rem)]" />
      <MiniNav site={site} />
      <section className="relative z-10 mx-auto grid min-h-[42rem] max-w-6xl gap-10 px-6 pb-16 pt-10 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <HeroText site={site} />
        <div className="glass relative min-h-[31rem] overflow-hidden rounded-[2rem] p-5">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-rose-500/30 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.35em] text-white/42">Scroll flight path</p>
          {['Velocity Circuit', 'Iron Form', 'Cold Reset', 'Recovery Suite'].map((item, i) => (
            <div key={item} className="mt-5 rounded-[1.4rem] border border-white/12 bg-black/35 p-5 backdrop-blur">
              <div className="flex items-center justify-between"><span className="text-xl font-black">{item}</span><span className="text-rose-300">{String(8 + i).padStart(2, '0')}:30</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-rose-400" style={{ width: `${78 - i * 13}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
      <FullSiteSections site={site} />
    </div>
  );
}

function RealEstateSite({ site }) {
  return (
    <div className="site-canvas real-bg relative overflow-hidden">
      <MiniNav site={site} dark />
      <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70" viewBox="0 0 1200 760" fill="none">
        <path className="draw-line" d="M83 612 C 240 430, 337 520, 445 330 S 676 160, 806 301 S 988 526, 1138 190" stroke="#b78342" strokeWidth="5" strokeLinecap="round" />
        <path className="draw-line" d="M168 210 C 390 254, 460 95, 590 182 S 788 430, 1034 374" stroke="#17202a" strokeWidth="2" strokeLinecap="round" opacity=".22" />
      </svg>
      <section className="relative z-10 mx-auto grid min-h-[42rem] max-w-6xl gap-8 px-6 pb-16 pt-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
        <HeroText site={site} dark />
        <div className="relative min-h-[32rem]">
          <div className="absolute right-0 top-0 h-[28rem] w-[75%] rounded-[2rem] bg-[linear-gradient(135deg,#fbf5ec,#c6a47e)] shadow-2xl" />
          <div className="absolute left-0 top-16 h-[25rem] w-[72%] rounded-[2rem] bg-[#111923] p-5 text-white shadow-2xl">
            <div className="h-52 rounded-[1.4rem] bg-[radial-gradient(circle_at_35%_35%,#f6ead7,transparent_24%),linear-gradient(135deg,#243447,#0b1118)]" />
            <p className="mt-5 text-xs uppercase tracking-[0.32em] text-white/40">Featured residence</p>
            <div className="mt-2 flex items-end justify-between"><h4 className="text-3xl font-black tracking-[-.04em]">Glass House No. 8</h4><span className="text-[#d1a566]">$6.2M</span></div>
          </div>
        </div>
      </section>
      <FullSiteSections site={site} dark />
    </div>
  );
}

function LandscapingSite({ site }) {
  return (
    <div className="site-canvas land-bg relative text-white">
      <MiniNav site={site} />
      <div className="absolute left-[12%] top-[38%] h-3 w-3 rounded-full bg-lime-200" style={{ offsetPath: "path('M0,0 C140,-150 250,90 420,-50 S650,-10 830,-140')", animation: 'seedPath 7s ease-in-out infinite' }} />
      <div className="absolute left-[8%] top-[62%] h-2 w-2 rounded-full bg-amber-200" style={{ offsetPath: "path('M0,0 C180,-80 230,130 430,10 S660,-30 920,30')", animation: 'seedPath 8.5s ease-in-out infinite 1s' }} />
      <section className="relative z-10 mx-auto grid min-h-[42rem] max-w-6xl gap-10 px-6 pb-20 pt-10 md:grid-cols-[.9fr_1.1fr] md:items-center">
        <HeroText site={site} />
        <div className="grid gap-4 sm:grid-cols-2">
          {siteContent[site.id].cards.slice(0, 4).map((item, i) => (
            <div key={item} className={`min-h-56 rounded-[2rem] border border-white/12 p-5 shadow-2xl ${i % 2 ? 'bg-lime-100/12' : 'bg-white/10'} backdrop-blur animate-floaty`} style={{ animationDelay: `${i * .7}s` }}>
              <div className="h-28 rounded-[1.4rem] bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,.55),transparent_20%),linear-gradient(135deg,#8fbf61,#244c30)]" />
              <h4 className="mt-4 text-2xl font-black tracking-[-.04em]">{item}</h4>
              <p className="mt-2 text-sm text-white/58">Before / after planning surface.</p>
            </div>
          ))}
        </div>
      </section>
      <FullSiteSections site={site} />
    </div>
  );
}

function EcommerceSite({ site, expanded, scrollProgress }) {
  return (
    <div className="site-canvas shop-bg relative text-white">
      <MiniNav site={site} />
      <section className="relative z-10 mx-auto grid min-h-[42rem] max-w-6xl gap-10 px-6 pb-16 pt-8 md:grid-cols-[.9fr_1.1fr] md:items-center">
        <HeroText site={site} />
        <div className="glass relative min-h-[35rem] overflow-hidden rounded-[2.2rem]">
          <ThreeScene variant="morph" active={expanded} scrollProgress={scrollProgress} />
          <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] border border-white/15 bg-black/45 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Shader morph object</p>
            <div className="mt-2 flex items-end justify-between"><h4 className="text-3xl font-black tracking-[-.05em]">AeroShell Pack</h4><span className="text-cyan-200">$248</span></div>
            <p className="mt-3 text-sm text-white/56">Scroll the expanded site and the object tears, bends, scales, and shifts texture bands.</p>
          </div>
        </div>
      </section>
      <FullSiteSections site={site} />
    </div>
  );
}

function BlogSite({ site }) {
  return (
    <div className="site-canvas blog-bg relative">
      <MiniNav site={site} dark />
      <section className="relative z-10 mx-auto grid min-h-[42rem] max-w-6xl gap-8 px-6 pb-16 pt-10 md:grid-cols-[1.05fr_.95fr] md:items-start">
        <HeroText site={site} dark />
        <div className="space-y-4 pt-5">
          {siteContent[site.id].cards.slice(0, 3).map((item, i) => (
            <article key={item} className="relative rounded-[2rem] bg-[#fffaf2] p-6 shadow-2xl shadow-black/15" style={{ transform: `rotate(${i === 1 ? -1.2 : i === 2 ? 1.3 : 0}deg)` }}>
              <p className="text-xs uppercase tracking-[0.25em] text-[#8c2f39]">0{i + 1} / Essay</p>
              <h4 className="mt-3 font-serif text-4xl leading-none">{item}</h4>
              <p className="mt-4 text-sm leading-6 text-[#21180f]/58">Tactile card system, editorial metadata, and clear subscription prompts.</p>
            </article>
          ))}
        </div>
      </section>
      <FullSiteSections site={site} dark />
    </div>
  );
}

function RestaurantSite({ site }) {
  return (
    <div className="site-canvas food-bg relative text-white">
      <MiniNav site={site} />
      <section className="relative z-10 mx-auto grid min-h-[42rem] max-w-6xl gap-10 px-6 pb-20 pt-10 md:grid-cols-[.85fr_1.15fr] md:items-center">
        <HeroText site={site} />
        <div className="relative overflow-hidden rounded-[2.4rem] border border-amber-200/18 bg-black/25 p-5 shadow-2xl">
          <div className="animate-marquee flex w-[200%] gap-4 text-7xl font-black uppercase tracking-[-.07em] text-white/8"><span>Charred Citrus · Ember Ribeye · Hearth Bread · </span><span>Charred Citrus · Ember Ribeye · Hearth Bread · </span></div>
          <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
            {siteContent[site.id].cards.slice(0, 4).map((item) => <div key={item} className="rounded-[1.6rem] border border-white/12 bg-white/8 p-5 backdrop-blur"><div className="mb-4 h-24 rounded-3xl bg-[radial-gradient(circle_at_35%_30%,#ffd86b,transparent_22%),linear-gradient(135deg,#7f1d1d,#150402)]" /><h4 className="text-xl font-black">{item}</h4><p className="mt-2 text-sm text-white/50">Menu tile / story hook</p></div>)}
          </div>
        </div>
      </section>
      <FullSiteSections site={site} />
    </div>
  );
}

function WellnessSite({ site }) {
  return (
    <div className="site-canvas well-bg relative">
      <MiniNav site={site} dark />
      <section className="relative z-10 mx-auto grid min-h-[42rem] max-w-6xl gap-10 px-6 pb-20 pt-10 md:grid-cols-[1fr_1fr] md:items-center">
        <HeroText site={site} dark />
        <div className="relative min-h-[32rem]">
          <div className="absolute left-8 top-0 h-72 w-72 animate-spin-slow rounded-full border border-emerald-900/10 bg-[conic-gradient(from_120deg,#ffffff,#7de2bd,#ffffff)] opacity-80 blur-sm" />
          <div className="absolute inset-x-0 bottom-0 rounded-[2.4rem] bg-[#10231f] p-6 text-white shadow-2xl">
            <div className="h-56 rounded-[1.7rem] bg-[radial-gradient(circle_at_60%_30%,#ffffff,transparent_18%),linear-gradient(135deg,#a7f3d0,#315c52)]" />
            <h4 className="mt-5 text-3xl font-black tracking-[-.04em]">Treatment finder</h4>
            <p className="mt-2 text-white/56">A guided, low-friction entry into services.</p>
          </div>
        </div>
      </section>
      <FullSiteSections site={site} dark />
    </div>
  );
}

export default PortfolioApp;
