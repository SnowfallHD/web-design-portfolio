import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowUpRight, Dumbbell, Home, Leaf, ShoppingBag, Newspaper, Utensils, Waves, X } from 'lucide-react';

const sites = [
  {
    id: 'pulseforge',
    title: 'PulseForge Gym',
    category: 'Performance gym',
    one: 'Cinematic dark fitness site with a camera fly-through, glowing class cards, and hard-edged conversion copy.',
    palette: 'Crimson / graphite / white',
    accent: '#ff2d55',
    Icon: Dumbbell,
  },
  {
    id: 'atlas',
    title: 'Atlas Estate',
    category: 'Luxury real estate',
    one: 'Editorial property brokerage with SVG path-drawn neighborhood routes and premium listing surfaces.',
    palette: 'Stone / espresso / brass',
    accent: '#b78342',
    Icon: Home,
  },
  {
    id: 'verdant',
    title: 'Verdant Works',
    category: 'Landscaping',
    one: 'Organic outdoor-services site with animated seed paths, texture, and lush before/after panels.',
    palette: 'Moss / clay / sun',
    accent: '#91d36b',
    Icon: Leaf,
  },
  {
    id: 'orbit',
    title: 'Orbit Supply',
    category: 'E-commerce',
    one: 'Futuristic product drop with an interactive shader object, product rail, and glass checkout UI.',
    palette: 'Violet / cyan / black',
    accent: '#73f5ff',
    Icon: ShoppingBag,
  },
  {
    id: 'margin',
    title: 'The Margin',
    category: 'Editorial blog',
    one: 'Warm, print-inspired blog with big typography, layered paper cards, and slow reading rhythm.',
    palette: 'Cream / ink / oxblood',
    accent: '#8c2f39',
    Icon: Newspaper,
  },
  {
    id: 'ember',
    title: 'Ember Table',
    category: 'Restaurant',
    one: 'Moody restaurant homepage with flame gradients, a kinetic menu strip, and reservation-first flow.',
    palette: 'Char / saffron / paprika',
    accent: '#ffb703',
    Icon: Utensils,
  },
  {
    id: 'luma',
    title: 'Luma Spa',
    category: 'Wellness studio',
    one: 'Soft luxury wellness site with calm motion, tactile cards, and an immersive treatment finder.',
    palette: 'Mist / jade / charcoal',
    accent: '#7de2bd',
    Icon: Waves,
  },
];

const depthContent = {
  pulseforge: {
    eyebrow: 'Membership engine',
    title: 'From first trial to recurring training blocks.',
    copy: 'A complete gym homepage needs class discovery, coach trust, social proof, and a pass flow that stays visible after the cinematic hero.',
    cta: 'Claim trial pass',
    items: ['Class schedule with intensity tags', 'Coach credibility wall', 'Transformation proof + pricing'],
    dark: true,
  },
  atlas: {
    eyebrow: 'Brokerage depth',
    title: 'Listings, market intelligence, and private intake.',
    copy: 'The real estate example continues past the hero with property cards, neighborhood proof, and a high-touch buyer qualification path.',
    cta: 'Request private list',
    items: ['Featured residences', 'Neighborhood route map', 'Buyer profile intake'],
    dark: false,
  },
  verdant: {
    eyebrow: 'Outdoor services funnel',
    title: 'Proof-led estimates for homeowners.',
    copy: 'Landscaping needs trust fast: before/after evidence, service packages, seasonal care, and a clean estimate request path.',
    cta: 'Plan my yard',
    items: ['Before / after gallery', 'Seasonal maintenance plans', 'Estimate checklist'],
    dark: true,
  },
  orbit: {
    eyebrow: 'Commerce drop system',
    title: 'Product story, variants, cart, and drop urgency.',
    copy: 'The shop expands into product storytelling, material details, bundles, and checkout UI rather than stopping at a shader object.',
    cta: 'Build bundle',
    items: ['Texture morph product story', 'Variant selector rail', 'Sticky cart conversion'],
    dark: true,
  },
  margin: {
    eyebrow: 'Publication system',
    title: 'A reading surface with subscription gravity.',
    copy: 'The blog example includes editorial sections, article cards, author modules, and a paid-subscription style CTA.',
    cta: 'Read the latest',
    items: ['Featured issue', 'Essay grid', 'Subscriber letter'],
    dark: false,
  },
  ember: {
    eyebrow: 'Hospitality flow',
    title: 'Menu, atmosphere, proof, and reservation.',
    copy: 'The restaurant site keeps the warmth but adds a menu system, chef note, private events, and a repeated booking path.',
    cta: 'Reserve table',
    items: ['Seasonal menu cards', 'Chef story module', 'Events inquiry'],
    dark: true,
  },
  luma: {
    eyebrow: 'Wellness booking path',
    title: 'Quiet luxury with service clarity.',
    copy: 'The spa example continues with treatment categories, therapist trust, membership rituals, and a low-pressure booking flow.',
    cta: 'Find treatment',
    items: ['Treatment matcher', 'Practitioner trust cards', 'Membership rituals'],
    dark: false,
  },
};

function ThreeScene({ variant = 'fly', active = false }) {
  const mount = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.set(0, 0, variant === 'fly' ? 9 : 4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    host.appendChild(renderer.domElement);

    let raf = 0;
    const startedAt = performance.now();
    const objects = [];
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color(variant === 'fly' ? '#ff2d55' : '#73f5ff') },
      uColorB: { value: new THREE.Color(variant === 'fly' ? '#ffffff' : '#9b5cff') },
    };

    if (variant === 'fly') {
      scene.fog = new THREE.FogExp2('#07070a', 0.055);
      const ringMat = new THREE.MeshBasicMaterial({ color: '#ff2d55', transparent: true, opacity: 0.36, wireframe: true });
      for (let i = 0; i < 26; i++) {
        const geo = new THREE.TorusGeometry(2.2 + Math.sin(i) * 0.18, 0.014, 8, 72);
        const mesh = new THREE.Mesh(geo, ringMat.clone());
        mesh.position.z = -i * 2.15;
        mesh.rotation.x = Math.PI / 2 + i * 0.08;
        mesh.rotation.z = i * 0.35;
        mesh.material.opacity = 0.18 + (i % 5) * 0.04;
        scene.add(mesh);
        objects.push(mesh);
      }
      const starGeo = new THREE.BufferGeometry();
      const count = 900;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 10;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
        pos[i * 3 + 2] = -Math.random() * 56;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.026, transparent: true, opacity: 0.65 }));
      scene.add(stars);
      objects.push(stars);
    } else {
      const geometry = new THREE.IcosahedronGeometry(1.55, 72);
      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        vertexShader: `
          uniform float uTime;
          uniform vec2 uMouse;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normal;
            vPosition = position;
            float wave = sin(position.x * 4.0 + uTime * 1.7) * 0.12 + cos(position.y * 5.0 - uTime * 1.3) * 0.10;
            float mousePush = length(uMouse) * 0.22;
            vec3 morphed = position + normal * (wave + mousePush);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(morphed, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0,0.0,1.0)), 2.4);
            float bands = sin((vPosition.y + vPosition.x) * 7.0 + uTime * 2.0) * 0.5 + 0.5;
            vec3 color = mix(uColorA, uColorB, bands) + fresnel * 0.35;
            gl_FragColor = vec4(color, 0.88);
          }
        `,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      objects.push(mesh);
      const light = new THREE.PointLight('#ffffff', 30, 14);
      light.position.set(2, 3, 4);
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
      uniforms.uTime.value = t;
      uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
      if (variant === 'fly') {
        camera.position.x += (mouse.current.x * 0.65 - camera.position.x) * 0.025;
        camera.position.y += (mouse.current.y * 0.42 - camera.position.y) * 0.025;
        camera.position.z = active ? 6.2 + Math.sin(t * 0.5) * 0.8 : 8.8;
        objects.forEach((obj, i) => {
          if (obj.isMesh) {
            obj.position.z += active ? 0.035 : 0.012;
            if (obj.position.z > 3) obj.position.z = -54;
            obj.rotation.z += 0.0025 + i * 0.00008;
          } else {
            obj.rotation.z += 0.0007;
          }
        });
      } else {
        const mesh = objects[0];
        mesh.rotation.y = t * 0.42 + mouse.current.x * 0.45;
        mesh.rotation.x = Math.sin(t * 0.45) * 0.25 + mouse.current.y * 0.35;
        mesh.scale.setScalar(active ? 1.08 + Math.sin(t * 1.2) * 0.025 : 0.9);
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
      objects.forEach((obj) => {
        obj.geometry?.dispose?.();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
        else obj.material?.dispose?.();
      });
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [variant, active]);

  return <div ref={mount} className="three-shell absolute inset-0" aria-hidden="true" />;
}

function PortfolioApp() {
  const [selected, setSelected] = useState(null);
  const activeSite = useMemo(() => sites.find((site) => site.id === selected), [selected]);

  useEffect(() => {
    const onDocClick = (event) => {
      const close = event.target.closest?.('[data-close-site]');
      if (close) {
        setSelected(null);
        return;
      }
      const opener = event.target.closest?.('[data-site-id]');
      if (opener?.dataset?.siteId) setSelected(opener.dataset.siteId);
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
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd38]" /> Design showroom / seven mini-sites
          </div>
          <h1 className="max-w-5xl text-4xl font-semibold leading-[0.94] tracking-[-0.055em] text-[#fff8ec] sm:text-6xl lg:text-7xl">
            Web examples with taste, motion, and a real way in.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#ffe6cb]/68 sm:text-lg">
            Half-revealed homepage previews stack vertically. Open one and it expands into a scrollable inline mini-site with its own layout, animation language, SVG path work, and selective WebGL.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="trace-chip">Single page</span>
            <span className="trace-chip">Mobile scroll fixed</span>
            <span className="trace-chip">Worker-ready</span>
          </div>
        </div>
        <div className="system-card relative z-10 p-5 text-sm text-[#ffe6cb]/72">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#fff8ec]">Build notes</p>
          <p className="mt-3 leading-6">Astro 6, React islands, Tailwind 4, custom CSS motion, SVG path drawing, and lightweight Three.js scenes.</p>
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
        <div className="site-modal fixed inset-0 z-50 overflow-y-auto bg-black/82 p-2 backdrop-blur-xl sm:p-4" role="dialog" aria-modal="true" aria-label={`${activeSite.title} expanded preview`}>
          <button
            data-close-site
            className="focus-visible-ring fixed right-4 top-4 z-[60] inline-flex items-center gap-2 rounded-lg border border-[#ffe6cb]/15 bg-[#041c1c]/80 px-4 py-3 text-sm font-medium text-[#fff8ec] shadow-2xl backdrop-blur-xl transition hover:border-[#ffbd38]/45 hover:bg-[#092626]"
            onClick={() => setSelected(null)}
          >
            <X size={17} /> Exit site
          </button>
          <div className="expanded-site portal-enter relative min-h-full overflow-visible rounded-xl border border-[#ffe6cb]/12 bg-black shadow-[0_40px_140px_rgba(0,0,0,.75)]">
            <SiteRenderer site={activeSite} expanded />
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
        <div className="absolute inset-x-0 top-0 origin-top scale-[0.74] sm:scale-[0.82] lg:scale-[0.78] xl:scale-[0.86]">
          <div className="pointer-events-none h-[48rem] w-[128%] -translate-x-[11%] rounded-xl border border-[#ffe6cb]/10 bg-black shadow-2xl">
            <SiteRenderer site={site} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-6 bottom-5 z-20 rounded-lg border border-[#ffe6cb]/12 bg-[#041c1c]/70 px-4 py-3 text-center text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#ffe6cb]/68 backdrop-blur-xl">
          homepage preview — opens inline
        </div>
      </div>
    </button>
  );
}

function SiteRenderer({ site, expanded = false }) {
  const props = { expanded };
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

function DepthSections({ tone }) {
  const content = depthContent[tone];
  const text = content.dark ? 'text-white' : 'text-[#17202a]';
  const muted = content.dark ? 'text-white/62' : 'text-[#17202a]/62';
  const card = content.dark
    ? 'border-white/12 bg-white/[0.07] text-white backdrop-blur-xl'
    : 'border-black/10 bg-white/55 text-[#17202a] shadow-xl shadow-black/10 backdrop-blur-xl';

  return (
    <section className={`depth-section depth-${tone} relative z-10 mx-auto max-w-6xl px-6 pb-24 ${text}`}>
      <div className="grid gap-8 border-t border-current/10 pt-12 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] opacity-55">{content.eyebrow}</p>
          <h4 className="mt-4 max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">{content.title}</h4>
        </div>
        <p className={`max-w-xl text-base leading-7 sm:text-lg ${muted}`}>{content.copy}</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {content.items.map((item, i) => (
          <article key={item} className={`min-h-44 rounded-[1.35rem] border p-5 ${card}`}>
            <p className="text-xs uppercase tracking-[0.24em] opacity-45">0{i + 1}</p>
            <h5 className="mt-8 text-2xl font-black tracking-[-0.04em]">{item}</h5>
            <p className="mt-3 text-sm leading-6 opacity-58">Scroll depth module for a fuller homepage.</p>
          </article>
        ))}
      </div>
      <div className="mt-7 inline-flex rounded-xl border border-current/15 bg-current/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em]">
        {content.cta}
      </div>
    </section>
  );
}

function MiniNav({ dark = false, label = 'Studio' }) {
  return (
    <div className={`relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 text-xs font-bold uppercase tracking-[0.24em] ${dark ? 'text-slate-950' : 'text-white'}`}>
      <span>{label}</span>
      <div className={`hidden gap-5 md:flex ${dark ? 'text-slate-900/55' : 'text-white/52'}`}><span>Work</span><span>Proof</span><span>Contact</span></div>
      <span className={`rounded-full px-4 py-2 ${dark ? 'bg-slate-950 text-white' : 'bg-white text-black'}`}>Book</span>
    </div>
  );
}

function GymSite({ expanded }) {
  return (
    <div className="site-canvas gym-bg relative text-white">
      <ThreeScene variant="fly" active={expanded} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.76),transparent_60%),radial-gradient(circle_at_70%_25%,rgba(255,45,85,.28),transparent_28rem)]" />
      <MiniNav label="PulseForge" />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-10 md:grid-cols-[1.1fr_.9fr] md:items-center">
        <div>
          <p className="mb-5 text-xs font-black uppercase tracking-[0.42em] text-rose-300">Strength / HIIT / Recovery</p>
          <h3 className="max-w-3xl text-6xl font-black uppercase leading-[.82] tracking-[-0.09em] sm:text-8xl">Train like the room is moving.</h3>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/68">A high-contrast fitness concept with live motion, depth, and heavy conversion sections for trial passes, class packs, and trainer authority.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['Start 7-day pass', 'See class grid', 'Meet coaches'].map((item, i) => <span key={item} className={`rounded-full border border-white/15 px-5 py-3 text-sm font-bold ${i === 0 ? 'bg-rose-500 text-white' : 'bg-white/8 text-white/74'}`}>{item}</span>)}
          </div>
        </div>
        <div className="glass relative min-h-[28rem] overflow-hidden rounded-[2rem] p-5">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-rose-500/30 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.35em] text-white/42">Today</p>
          {['Velocity Circuit', 'Iron Form', 'Cold Reset'].map((item, i) => (
            <div key={item} className="mt-5 rounded-[1.5rem] border border-white/12 bg-black/35 p-5 backdrop-blur">
              <div className="flex items-center justify-between"><span className="text-xl font-black">{item}</span><span className="text-rose-300">0{8 + i}:30</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-rose-400" style={{ width: `${72 - i * 15}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
      <DepthSections tone="pulseforge" />
    </div>
  );
}

function RealEstateSite() {
  return (
    <div className="site-canvas real-bg relative overflow-hidden">
      <MiniNav dark label="Atlas Estate" />
      <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70" viewBox="0 0 1200 760" fill="none">
        <path className="draw-line" d="M83 612 C 240 430, 337 520, 445 330 S 676 160, 806 301 S 988 526, 1138 190" stroke="#b78342" strokeWidth="5" strokeLinecap="round" />
        <path className="draw-line" d="M168 210 C 390 254, 460 95, 590 182 S 788 430, 1034 374" stroke="#17202a" strokeWidth="2" strokeLinecap="round" opacity=".22" />
      </svg>
      <section className="relative z-10 mx-auto grid max-w-6xl gap-8 px-6 pb-16 pt-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#8a5b29]">Private listings / coastal markets</p>
          <h3 className="mt-5 max-w-2xl font-serif text-6xl leading-[.9] tracking-[-0.055em] text-[#17202a] sm:text-8xl">Find the address before it becomes obvious.</h3>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#17202a]/70">A luxury brokerage homepage using editorial whitespace, path-drawn market intelligence, and polished listing cards.</p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
            {['$4.8M avg', '37 off-market', '12 coastal towns'].map((x) => <div key={x} className="rounded-2xl bg-white/50 p-4 shadow-xl shadow-stone-900/10 backdrop-blur"><span className="text-sm font-black">{x}</span></div>)}
          </div>
        </div>
        <div className="relative min-h-[31rem]">
          <div className="absolute right-0 top-0 h-[28rem] w-[75%] rounded-[2rem] bg-[linear-gradient(135deg,#fbf5ec,#c6a47e)] shadow-2xl" />
          <div className="absolute left-0 top-16 h-[25rem] w-[72%] rounded-[2rem] bg-[#111923] p-5 text-white shadow-2xl">
            <div className="h-52 rounded-[1.4rem] bg-[radial-gradient(circle_at_35%_35%,#f6ead7,transparent_24%),linear-gradient(135deg,#243447,#0b1118)]" />
            <p className="mt-5 text-xs uppercase tracking-[0.32em] text-white/40">Featured residence</p>
            <div className="mt-2 flex items-end justify-between"><h4 className="text-3xl font-black tracking-[-.04em]">Glass House No. 8</h4><span className="text-[#d1a566]">$6.2M</span></div>
          </div>
        </div>
      </section>
      <DepthSections tone="atlas" />
    </div>
  );
}

function LandscapingSite() {
  return (
    <div className="site-canvas land-bg relative text-white">
      <MiniNav label="Verdant Works" />
      <div className="absolute left-[12%] top-[38%] h-3 w-3 rounded-full bg-lime-200" style={{ offsetPath: "path('M0,0 C140,-150 250,90 420,-50 S650,-10 830,-140')", animation: 'seedPath 7s ease-in-out infinite' }} />
      <div className="absolute left-[8%] top-[62%] h-2 w-2 rounded-full bg-amber-200" style={{ offsetPath: "path('M0,0 C180,-80 230,130 430,10 S660,-30 920,30')", animation: 'seedPath 8.5s ease-in-out infinite 1s' }} />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-10 md:grid-cols-[.9fr_1.1fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.42em] text-lime-200">Outdoor rooms / seasonal care</p>
          <h3 className="mt-5 text-6xl font-black leading-[.9] tracking-[-0.08em] sm:text-8xl">Landscapes with a pulse.</h3>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">An earthy services site with organic motion, tactile estimate cards, and clear proof for homeowners comparing crews.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {['Courtyard reset', 'Native meadow', 'Stone + water', 'Seasonal care'].map((item, i) => (
            <div key={item} className={`min-h-56 rounded-[2rem] border border-white/12 p-5 shadow-2xl ${i % 2 ? 'bg-lime-100/12' : 'bg-white/10'} backdrop-blur animate-floaty`} style={{ animationDelay: `${i * .7}s` }}>
              <div className="h-28 rounded-[1.4rem] bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,.55),transparent_20%),linear-gradient(135deg,#8fbf61,#244c30)]" />
              <h4 className="mt-4 text-2xl font-black tracking-[-.04em]">{item}</h4>
              <p className="mt-2 text-sm text-white/58">Before / after planning surface.</p>
            </div>
          ))}
        </div>
      </section>
      <DepthSections tone="verdant" />
    </div>
  );
}

function EcommerceSite({ expanded }) {
  return (
    <div className="site-canvas shop-bg relative text-white">
      <MiniNav label="Orbit Supply" />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 md:grid-cols-[.9fr_1.1fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.42em] text-cyan-200">Drop 04 / adaptive carry</p>
          <h3 className="mt-5 text-6xl font-black leading-[.86] tracking-[-0.08em] sm:text-8xl">Gear that changes under light.</h3>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/68">An e-commerce concept with shader-morphing product art, magnetic CTAs, and a premium cart rail.</p>
          <div className="mt-8 flex gap-3"><span className="rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950">Shop drop</span><span className="rounded-full border border-white/15 px-5 py-3 font-black text-white/72">Texture story</span></div>
        </div>
        <div className="glass relative min-h-[34rem] overflow-hidden rounded-[2.2rem]">
          <ThreeScene variant="morph" active={expanded} />
          <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] border border-white/15 bg-black/45 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Interactive object</p>
            <div className="mt-2 flex items-end justify-between"><h4 className="text-3xl font-black tracking-[-.05em]">AeroShell Pack</h4><span className="text-cyan-200">$248</span></div>
            <p className="mt-3 text-sm text-white/56">Move pointer over object for shader/texture morphing.</p>
          </div>
        </div>
      </section>
      <DepthSections tone="orbit" />
    </div>
  );
}

function BlogSite() {
  return (
    <div className="site-canvas blog-bg relative">
      <MiniNav dark label="The Margin" />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-8 px-6 pb-16 pt-10 md:grid-cols-[1.05fr_.95fr] md:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#8c2f39]">Essays / interviews / field notes</p>
          <h3 className="mt-5 max-w-3xl font-serif text-6xl leading-[.92] tracking-[-.055em] sm:text-8xl">A magazine for slower internet thoughts.</h3>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#21180f]/68">A blog direction with print gravity, beautiful hierarchy, and article previews that feel collectible instead of templated.</p>
        </div>
        <div className="space-y-4">
          {['The craft hiding in boring tools', 'Small teams, big taste', 'A field guide to useful friction'].map((item, i) => (
            <article key={item} className="relative rounded-[2rem] bg-[#fffaf2] p-6 shadow-2xl shadow-black/15" style={{ transform: `rotate(${i === 1 ? -1.2 : i === 2 ? 1.3 : 0}deg)` }}>
              <p className="text-xs uppercase tracking-[0.25em] text-[#8c2f39]">0{i + 1} / Essay</p>
              <h4 className="mt-3 font-serif text-4xl leading-none">{item}</h4>
              <p className="mt-4 text-sm leading-6 text-[#21180f]/58">Tactile card system, editorial metadata, and clear subscription prompts.</p>
            </article>
          ))}
        </div>
      </section>
      <DepthSections tone="margin" />
    </div>
  );
}

function RestaurantSite() {
  return (
    <div className="site-canvas food-bg relative text-white">
      <MiniNav label="Ember Table" />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-10 md:grid-cols-[.85fr_1.15fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.42em] text-amber-200">Wood fire / seasonal menu</p>
          <h3 className="mt-5 font-serif text-6xl leading-[.9] tracking-[-.05em] sm:text-8xl">Dinner should glow before it arrives.</h3>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/68">A moody hospitality homepage with kinetic menu strips, flame-like gradients, and a reservation flow that stays obvious.</p>
          <div className="mt-8 rounded-full bg-amber-300 px-6 py-4 text-center font-black text-[#1a0804]">Reserve tonight</div>
        </div>
        <div className="relative overflow-hidden rounded-[2.4rem] border border-amber-200/18 bg-black/25 p-5 shadow-2xl">
          <div className="animate-marquee flex w-[200%] gap-4 text-7xl font-black uppercase tracking-[-.07em] text-white/8"><span>Charred Citrus · Ember Ribeye · Hearth Bread · </span><span>Charred Citrus · Ember Ribeye · Hearth Bread · </span></div>
          <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
            {['Smoked beet tartare', 'Coal-roasted chicken', 'Saffron panna cotta', 'Juniper spritz'].map((item, i) => <div key={item} className="rounded-[1.6rem] border border-white/12 bg-white/8 p-5 backdrop-blur"><div className="mb-4 h-24 rounded-3xl bg-[radial-gradient(circle_at_35%_30%,#ffd86b,transparent_22%),linear-gradient(135deg,#7f1d1d,#150402)]" /><h4 className="text-xl font-black">{item}</h4><p className="mt-2 text-sm text-white/50">Menu tile / story hook</p></div>)}
          </div>
        </div>
      </section>
      <DepthSections tone="ember" />
    </div>
  );
}

function WellnessSite() {
  return (
    <div className="site-canvas well-bg relative">
      <MiniNav dark label="Luma Spa" />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-10 md:grid-cols-[1fr_1fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.42em] text-emerald-800/70">Rituals / skin / quiet</p>
          <h3 className="mt-5 font-serif text-6xl leading-[.92] tracking-[-.055em] text-[#10231f] sm:text-8xl">A softer booking flow for nervous systems.</h3>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#10231f]/68">A calm wellness site with soft surfaces, slow motion, and high-trust treatment discovery.</p>
          <div className="mt-8 flex flex-wrap gap-3">{['60 min reset', 'Sauna circuit', 'Skin ritual'].map((x) => <span key={x} className="rounded-full bg-white/55 px-5 py-3 text-sm font-black text-[#10231f] shadow-lg">{x}</span>)}</div>
        </div>
        <div className="relative min-h-[31rem]">
          <div className="absolute left-8 top-0 h-72 w-72 animate-spin-slow rounded-full border border-emerald-900/10 bg-[conic-gradient(from_120deg,#ffffff,#7de2bd,#ffffff)] opacity-80 blur-sm" />
          <div className="absolute inset-x-0 bottom-0 rounded-[2.4rem] bg-[#10231f] p-6 text-white shadow-2xl">
            <div className="h-56 rounded-[1.7rem] bg-[radial-gradient(circle_at_60%_30%,#ffffff,transparent_18%),linear-gradient(135deg,#a7f3d0,#315c52)]" />
            <h4 className="mt-5 text-3xl font-black tracking-[-.04em]">Treatment finder</h4>
            <p className="mt-2 text-white/56">A guided, low-friction entry into services.</p>
          </div>
        </div>
      </section>
      <DepthSections tone="luma" />
    </div>
  );
}

export default PortfolioApp;
