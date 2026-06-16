import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const BEATS = [
  { name: 'Entrance', copy: 'Branded reception, concrete desk, wall mark, first view into the training floor.' },
  { name: 'Turf', copy: 'Green turf lane, sled rails, rubber floor seams, overhead strip lighting.' },
  { name: 'Strength', copy: 'Rack line, dumbbell wall, benches, steel framing, mirrors, plates.' },
  { name: 'Conditioning', copy: 'Rower row, bike silhouettes, ropes, kettlebells, coach lane.' },
  { name: 'Recovery', copy: 'Glass partition, cold plunge, recovery table, compression-chair silhouettes.' },
  { name: 'Trial Pass', copy: 'Final desk view with a clean handoff into the trial-pass conversion.' },
];

const CAMERA_POINTS = [
  new THREE.Vector3(1.9, 1.55, 11.3),
  new THREE.Vector3(-.4, 1.45, 2.5),
  new THREE.Vector3(-1.95, 1.28, -10.2),
  new THREE.Vector3(.7, 1.42, -22.5),
  new THREE.Vector3(2.15, 1.38, -34.5),
  new THREE.Vector3(.35, 1.35, -47.8),
  new THREE.Vector3(-1.55, 1.32, -59.5),
  new THREE.Vector3(0, 1.55, -68.5),
];
const TARGET_POINTS = [
  new THREE.Vector3(-2.7, 1.3, 7.3),
  new THREE.Vector3(-2.0, .8, -4.5),
  new THREE.Vector3(-2.1, .75, -18),
  new THREE.Vector3(3.6, 1.25, -25),
  new THREE.Vector3(.5, 1.05, -43),
  new THREE.Vector3(2.2, 1.0, -50.5),
  new THREE.Vector3(-1.2, 1.0, -62.3),
  new THREE.Vector3(0, 1.75, -71.1),
];
const CAMERA_CURVE = new THREE.CatmullRomCurve3(CAMERA_POINTS, false, 'catmullrom', .35);
const TARGET_CURVE = new THREE.CatmullRomCurve3(TARGET_POINTS, false, 'catmullrom', .35);

function makeNoiseTexture({ base = '#202024', fleck = '#2b2b31', size = 256, density = 0.24 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size * density; i += 1) {
    const value = 130 + Math.random() * 80;
    ctx.fillStyle = i % 4 === 0 ? fleck : `rgba(${value},${value},${value},${0.045 + Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(14, 44);
  texture.needsUpdate = true;
  return texture;
}

function makeStripeTexture({ base = '#123f2c', stripe = '#216a45', size = 256 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 8) {
    ctx.fillStyle = y % 16 === 0 ? stripe : 'rgba(255,255,255,.035)';
    ctx.fillRect(0, y, size, 2);
  }
  for (let i = 0; i < 900; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.07})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 28);
  texture.needsUpdate = true;
  return texture;
}

function makeLabelTexture(text, sub = '', color = '#ff2d55') {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 768, 256);
  ctx.fillStyle = 'rgba(4,4,6,.82)';
  ctx.fillRect(0, 0, 768, 256);
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 744, 232);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 76px Arial Narrow, Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), 46, 102);
  if (sub) {
    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.font = '700 26px Arial';
    ctx.fillText(sub.toUpperCase(), 50, 176);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function labelPlane(text, sub, color, width = 3.7, height = 1.2) {
  const texture = makeLabelTexture(text, sub, color);
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.userData.texture = texture;
  return mesh;
}

function addShadow(scene, x, z, sx = 1, sz = 1, opacity = 0.26) {
  const mat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 32), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.025, z);
  mesh.scale.set(sx, sz, 1);
  scene.add(mesh);
  return mesh;
}

function addWallLabel(scene, text, sub, color, position, rotationY = 0, size = [3.5, 1.05]) {
  const label = labelPlane(text, sub, color, size[0], size[1]);
  label.position.set(position[0], position[1], position[2]);
  label.rotation.y = rotationY;
  scene.add(label);
  return label;
}

function createRack(materials) {
  const g = new THREE.Group();
  const postGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.45, 12);
  const beamGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.15, 12);
  const barGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.8, 16);
  const pts = [[-.55, 1.22, -.38], [.55, 1.22, -.38], [-.55, 1.22, .38], [.55, 1.22, .38]];
  pts.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(postGeo, materials.darkMetal);
    post.position.set(x, y, z);
    post.castShadow = true;
    g.add(post);
  });
  [[0,2.38,-.38,Math.PI/2], [0,2.38,.38,Math.PI/2], [-.55,2.3,0,0], [.55,2.3,0,0]].forEach(([x,y,z,rz]) => {
    const beam = new THREE.Mesh(beamGeo, materials.steel);
    beam.position.set(x,y,z);
    beam.rotation.z = rz;
    beam.castShadow = true;
    g.add(beam);
  });
  const bar = new THREE.Mesh(barGeo, materials.brushedSteel);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 1.7, -.44);
  bar.castShadow = true;
  g.add(bar);
  [-.82, .82].forEach((x) => {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .07, 24), materials.plate);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(x, 1.7, -.44);
    plate.castShadow = true;
    g.add(plate);
  });
  const bench = new THREE.Mesh(new THREE.BoxGeometry(.42, .12, 1.18), materials.matteBlack);
  bench.position.set(0, .48, .05);
  bench.castShadow = true;
  g.add(bench);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.45,10), materials.darkMetal);
  leg.position.set(0,.24,.05);
  leg.castShadow = true;
  g.add(leg);
  return g;
}

function createDumbbellWall(materials) {
  const g = new THREE.Group();
  const railGeo = new THREE.BoxGeometry(3.2, .055, .12);
  for (let row = 0; row < 4; row += 1) {
    const rail = new THREE.Mesh(railGeo, materials.darkMetal);
    rail.position.set(0, .52 + row * .34, 0);
    rail.castShadow = true;
    g.add(rail);
    for (let i = 0; i < 9; i += 1) {
      const x = -1.42 + i * .36;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.22,8), materials.brushedSteel);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(x, .62 + row * .34, -.08);
      handle.castShadow = true;
      g.add(handle);
      [-.13,.13].forEach((dx) => {
        const head = new THREE.Mesh(new THREE.BoxGeometry(.105,.105,.105), materials.matteBlack);
        head.position.set(x + dx, .62 + row * .34, -.08);
        head.castShadow = true;
        g.add(head);
      });
    }
  }
  return g;
}

function createRower(materials) {
  const g = new THREE.Group();
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1.45, .05, .09), materials.darkMetal);
  rail.position.set(0, .18, 0);
  rail.castShadow = true;
  g.add(rail);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(.26,.08,.22), materials.matteBlack);
  seat.position.set(-.22,.28,0);
  seat.castShadow = true;
  g.add(seat);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.12,32), materials.plate);
  fan.rotation.z = Math.PI / 2;
  fan.position.set(.72,.36,0);
  fan.castShadow = true;
  g.add(fan);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.65,10), materials.brushedSteel);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(.15,.55,0);
  handle.castShadow = true;
  g.add(handle);
  return g;
}

function createAssaultBike(materials) {
  const g = new THREE.Group();
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(.38,.045,12,42), materials.matteBlack);
  wheel.rotation.y = Math.PI / 2;
  wheel.position.set(0,.55,0);
  wheel.castShadow = true;
  g.add(wheel);
  const base = new THREE.Mesh(new THREE.BoxGeometry(.9,.06,.12), materials.darkMetal);
  base.position.set(0,.18,0);
  g.add(base);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(.25,.08,.22), materials.matteBlack);
  seat.position.set(-.55,.78,0);
  seat.castShadow = true;
  g.add(seat);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.68,10), materials.brushedSteel);
  post.position.set(-.45,.5,0);
  g.add(post);
  const bars = new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.86,10), materials.brushedSteel);
  bars.rotation.z = Math.PI / 4;
  bars.position.set(.38,.88,0);
  g.add(bars);
  return g;
}

function createBattleRopes(materials) {
  const g = new THREE.Group();
  const ropeMat = materials.rope;
  [-.18,.18].forEach((offset) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.2, .08, offset), new THREE.Vector3(-.55, .22, offset + .18), new THREE.Vector3(.1, .08, offset - .12), new THREE.Vector3(.78, .2, offset + .08), new THREE.Vector3(1.25, .08, offset),
    ]);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, .035, 8, false), ropeMat);
    mesh.castShadow = true;
    g.add(mesh);
  });
  return g;
}

function createColdPlunge(materials) {
  const g = new THREE.Group();
  const tub = new THREE.Mesh(new THREE.BoxGeometry(1.55,.58,.78), materials.recoveryWhite);
  tub.position.set(0,.32,0);
  tub.castShadow = true;
  g.add(tub);
  const water = new THREE.Mesh(new THREE.BoxGeometry(1.38,.03,.62), materials.water);
  water.position.set(0,.63,0);
  g.add(water);
  return g;
}

function createCompressionChair(materials) {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(.75,.14,.72), materials.matteBlack);
  seat.position.set(0,.32,0);
  seat.castShadow = true;
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(.75,.9,.12), materials.matteBlack);
  back.position.set(0,.82,.33);
  back.rotation.x = -.22;
  back.castShadow = true;
  g.add(back);
  const boots = new THREE.Mesh(new THREE.BoxGeometry(.62,.22,.9), materials.recoveryWhite);
  boots.position.set(0,.31,-.62);
  boots.castShadow = true;
  g.add(boots);
  return g;
}

function createScene(scene, renderer) {
  scene.background = null;
  scene.fog = new THREE.FogExp2('#111218', 0.014);

  const rubberMap = makeNoiseTexture({ base: '#18191d', fleck: 'rgba(255,255,255,.08)', density: .18 });
  const turfMap = makeStripeTexture();
  const concreteMap = makeNoiseTexture({ base: '#303037', fleck: 'rgba(255,255,255,.1)', density: .08 });
  concreteMap.repeat.set(6, 18);

  const materials = {
    rubber: new THREE.MeshStandardMaterial({ color: '#22242a', roughness: .78, metalness: .04, map: rubberMap }),
    turf: new THREE.MeshStandardMaterial({ color: '#123f2c', roughness: .9, metalness: 0, map: turfMap }),
    concrete: new THREE.MeshStandardMaterial({ color: '#34343b', roughness: .76, metalness: .02, map: concreteMap }),
    darkWall: new THREE.MeshStandardMaterial({ color: '#171921', roughness: .55, metalness: .08 }),
    matteBlack: new THREE.MeshStandardMaterial({ color: '#111318', roughness: .68, metalness: .18 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: '#15191f', roughness: .38, metalness: .72 }),
    steel: new THREE.MeshStandardMaterial({ color: '#7f8790', roughness: .31, metalness: .8 }),
    brushedSteel: new THREE.MeshStandardMaterial({ color: '#b2bac2', roughness: .22, metalness: .88 }),
    plate: new THREE.MeshStandardMaterial({ color: '#17171b', roughness: .55, metalness: .45 }),
    red: new THREE.MeshStandardMaterial({ color: '#ff2d55', roughness: .44, metalness: .12, emissive: '#2a0209', emissiveIntensity: .32 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#bfeaff', roughness: .12, metalness: .05, transmission: .12, transparent: true, opacity: .28 }),
    mirror: new THREE.MeshStandardMaterial({ color: '#b8cad0', roughness: .08, metalness: .88, transparent: true, opacity: .36 }),
    rope: new THREE.MeshStandardMaterial({ color: '#40352b', roughness: .92, metalness: .02 }),
    recoveryWhite: new THREE.MeshStandardMaterial({ color: '#d9e2df', roughness: .55, metalness: .05 }),
    water: new THREE.MeshPhysicalMaterial({ color: '#72c7ad', roughness: .04, metalness: 0, transparent: true, opacity: .72, transmission: .22 }),
    light: new THREE.MeshBasicMaterial({ color: '#fff4de', toneMapped: false }),
  };

  const disposables = [rubberMap, turfMap, concreteMap, ...Object.values(materials)];
  const objects = [];
  const add = (mesh) => { scene.add(mesh); objects.push(mesh); return mesh; };

  const floor = add(new THREE.Mesh(new THREE.BoxGeometry(12, .12, 92), materials.rubber));
  floor.position.set(0, -.06, -31);
  floor.receiveShadow = true;

  const turf = add(new THREE.Mesh(new THREE.BoxGeometry(2.15, .07, 46), materials.turf));
  turf.position.set(-2.15, .015, -23);
  turf.receiveShadow = true;

  [-3.05, -1.25].forEach((x) => {
    const rail = add(new THREE.Mesh(new THREE.BoxGeometry(.055, .04, 41), materials.steel));
    rail.position.set(x, .08, -23);
    rail.castShadow = true;
  });
  for (let z = -3; z > -43; z -= 4) {
    const hash = add(new THREE.Mesh(new THREE.BoxGeometry(1.82, .035, .045), materials.recoveryWhite));
    hash.position.set(-2.15, .105, z);
  }

  const leftWall = add(new THREE.Mesh(new THREE.BoxGeometry(.16, 4.1, 92), materials.darkWall));
  leftWall.position.set(-6.05, 2.05, -31);
  leftWall.receiveShadow = true;
  const rightWall = add(new THREE.Mesh(new THREE.BoxGeometry(.16, 4.1, 92), materials.darkWall));
  rightWall.position.set(6.05, 2.05, -31);
  rightWall.receiveShadow = true;
  const ceiling = add(new THREE.Mesh(new THREE.BoxGeometry(12.4, .16, 92), materials.darkWall));
  ceiling.position.set(0, 4.05, -31);

  for (let z = 6; z > -68; z -= 6) {
    const beam = add(new THREE.Mesh(new THREE.BoxGeometry(12.2, .12, .16), materials.darkMetal));
    beam.position.set(0, 3.82, z);
    beam.castShadow = true;
    const strip = add(new THREE.Mesh(new THREE.BoxGeometry(4.4, .045, .18), materials.light));
    strip.position.set(z % 12 === 0 ? -2.4 : 2.4, 3.7, z - 1.4);
    const light = new THREE.RectAreaLight('#fff0dd', 8.2, 4.4, .24);
    light.position.set(strip.position.x, 3.62, strip.position.z);
    light.rotation.x = -Math.PI / 2;
    scene.add(light);
  }

  for (let z = -12; z > -34; z -= 5.5) {
    const mirror = add(new THREE.Mesh(new THREE.BoxGeometry(.055, 2.35, 4.1), materials.mirror));
    mirror.position.set(5.93, 1.75, z);
  }
  for (let z = -18; z > -63; z -= 7) {
    const frame = add(new THREE.Mesh(new THREE.BoxGeometry(.11, 3.2, .14), materials.steel));
    frame.position.set(-5.88, 1.78, z);
    const frame2 = frame.clone();
    frame2.position.z = z - 3.1;
    add(frame2);
  }

  const reception = add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.05, 1), materials.concrete));
  reception.position.set(-1.5, .55, 8.1);
  reception.castShadow = true;
  addShadow(scene, -1.5, 8.1, 2.4, .9, .22);
  addWallLabel(scene, 'PULSEFORGE', 'performance club', '#ff2d55', [-5.86, 2.35, 7.8], Math.PI / 2, [3.8, 1.1]);
  addWallLabel(scene, 'ENTRANCE', 'check in / assessment', '#ffffff', [3.3, 2.15, 7.2], 0, [3.1, .92]);

  const zones = [
    ['TURF LANE', 'sled track / speed work', '#49d17a', [-5.85, 2.3, -8], Math.PI/2],
    ['STRENGTH', 'racks / dumbbells', '#ff2d55', [5.85, 2.4, -25], -Math.PI/2],
    ['CONDITIONING', 'rowers / bikes / ropes', '#ffbd38', [-5.85, 2.35, -43], Math.PI/2],
    ['RECOVERY', 'cold / compression', '#72c7ad', [5.85, 2.35, -60], -Math.PI/2],
  ];
  zones.forEach(([name, sub, color, pos, rot]) => addWallLabel(scene, name, sub, color, pos, rot, [3.9, 1.05]));
  [
    ['TURF LANE', 'sled track / speed', '#49d17a', -9],
    ['STRENGTH ZONE', 'rack line / dumbbells', '#ff2d55', -24],
    ['CONDITIONING', 'rowers / bikes / ropes', '#ffbd38', -43],
    ['RECOVERY ROOM', 'cold / compression', '#72c7ad', -60],
  ].forEach(([name, sub, color, z]) => {
    const gate = labelPlane(name, sub, color, 3.8, 1.05);
    gate.position.set(-.15, 2.65, z);
    scene.add(gate);
    const strip = add(new THREE.Mesh(new THREE.BoxGeometry(4.2, .035, .12), materials.red));
    strip.position.set(-.15, .13, z + .2);
  });

  for (let z = -17; z > -35; z -= 5.6) {
    const rack = createRack(materials);
    rack.position.set(2.25, 0, z);
    rack.rotation.y = Math.PI;
    scene.add(rack);
    objects.push(rack);
    addShadow(scene, 2.25, z, 1.2, 1, .24);
    const rack2 = createRack(materials);
    rack2.position.set(4.2, 0, z - 1.2);
    rack2.rotation.y = Math.PI;
    scene.add(rack2);
    objects.push(rack2);
    addShadow(scene, 4.2, z - 1.2, 1.2, 1, .24);
  }
  const db = createDumbbellWall(materials);
  db.position.set(5.55, .25, -29.5);
  db.rotation.y = -Math.PI / 2;
  scene.add(db); objects.push(db);
  const heroRack = createRack(materials);
  heroRack.position.set(-.25, 0, -25.8);
  heroRack.rotation.y = Math.PI;
  scene.add(heroRack); objects.push(heroRack); addShadow(scene, -.25, -25.8, 1.35, 1.05, .28);

  for (let z = -39; z > -54; z -= 4.5) {
    const rower = createRower(materials);
    rower.position.set(-.8, 0, z);
    rower.rotation.y = Math.PI / 2;
    scene.add(rower); objects.push(rower);
    addShadow(scene, -.8, z, 1, .55, .2);
    const bike = createAssaultBike(materials);
    bike.position.set(2.4, 0, z - 1.1);
    bike.rotation.y = -Math.PI / 3;
    scene.add(bike); objects.push(bike);
    addShadow(scene, 2.4, z - 1.1, .8, .7, .2);
  }
  const ropes = createBattleRopes(materials);
  ropes.position.set(-3.45, .05, -48);
  ropes.rotation.y = Math.PI / 2;
  scene.add(ropes); objects.push(ropes);

  for (let i = 0; i < 10; i += 1) {
    const kettle = new THREE.Mesh(new THREE.TorusGeometry(.13 + (i%3)*.025, .035, 10, 24), materials.matteBlack);
    kettle.position.set(3.6 + (i%5)*.36, .2, -43.4 - Math.floor(i/5)*.42);
    kettle.rotation.x = Math.PI / 2;
    kettle.castShadow = true;
    add(kettle);
  }

  const glassWall = add(new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.8, .08), materials.glass));
  glassWall.position.set(-2.4, 1.65, -55.8);
  const partition = add(new THREE.Mesh(new THREE.BoxGeometry(.12, 3.1, 8.2), materials.concrete));
  partition.position.set(-5.1, 1.55, -59.5);
  const plunge = createColdPlunge(materials);
  plunge.position.set(-2.6, 0, -62.2);
  scene.add(plunge); objects.push(plunge); addShadow(scene, -2.6, -62.2, 1.2, .7, .22);
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.65, .25, .7), materials.recoveryWhite);
  table.position.set(.1, .45, -63.4);
  table.castShadow = true;
  add(table); addShadow(scene, .1, -63.4, 1.25, .7, .18);
  const chair = createCompressionChair(materials);
  chair.position.set(2.5, 0, -60.9);
  chair.rotation.y = -.42;
  scene.add(chair); objects.push(chair); addShadow(scene, 2.5, -60.9, .9, .8, .18);

  const finalWall = add(new THREE.Mesh(new THREE.BoxGeometry(10.8, 3.5, .18), materials.darkWall));
  finalWall.position.set(0, 1.75, -71.2);
  addWallLabel(scene, '7-DAY TRIAL', 'book your floor assessment', '#ff2d55', [0, 2.1, -71.02], 0, [4.9, 1.35]);

  const ambient = new THREE.HemisphereLight('#ffffff', '#181018', 4.4);
  scene.add(ambient);
  const key = new THREE.DirectionalLight('#fff1db', 5.5);
  key.position.set(-4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 90;
  key.shadow.camera.left = -18;
  key.shadow.camera.right = 18;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -18;
  scene.add(key);
  const redRim = new THREE.PointLight('#ff2d55', 85, 24, 1.7);
  redRim.position.set(4.7, 2.6, -28);
  scene.add(redRim);
  const recoverGlow = new THREE.PointLight('#72c7ad', 70, 18, 1.8);
  recoverGlow.position.set(-2.4, 2.2, -61);
  scene.add(recoverGlow);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.85;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  return { objects, disposables };
}

function sampleCamera(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const eased = THREE.MathUtils.smoothstep(p, 0, 1);
  return { pos: CAMERA_CURVE.getPoint(eased), target: TARGET_CURVE.getPoint(eased) };
}

export function zoneForProgress(progress) {
  const idx = Math.min(BEATS.length - 1, Math.floor(Math.max(0, Math.min(.999, progress)) * BEATS.length));
  return { ...BEATS[idx], index: idx, beats: BEATS };
}

export default function PulseForgeWalkthrough({ active = false, scrollProgress = 0 }) {
  const mount = useRef(null);
  const progress = useRef(scrollProgress);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => { progress.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const set = () => setReduced(Boolean(mq?.matches));
    set();
    mq?.addEventListener?.('change', set);
    return () => mq?.removeEventListener?.('change', set);
  }, []);

  useEffect(() => {
    if (!mount.current || reduced) return undefined;
    const host = mount.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.08, 120);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    host.appendChild(renderer.domElement);
    const { objects, disposables } = createScene(scene, renderer);
    let raf = 0;
    let lastP = 0;

    const resize = () => {
      const width = host.clientWidth || 800;
      const height = host.clientHeight || 560;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);
    resize();
    setReady(true);

    const animate = () => {
      const targetP = active ? progress.current : 0;
      lastP += (targetP - lastP) * 0.16;
      const { pos, target } = sampleCamera(lastP);
      camera.position.copy(pos);
      camera.lookAt(target);
      objects.forEach((obj) => {
        if (obj.type === 'Group') obj.children.forEach((child) => { if (child.material?.emissiveIntensity) child.material.emissiveIntensity = .18 + Math.sin(performance.now() * .001) * .03; });
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      objects.forEach((mesh) => {
        mesh.traverse?.((child) => {
          child.geometry?.dispose?.();
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => { m?.map?.dispose?.(); m?.dispose?.(); });
          child.userData?.texture?.dispose?.();
        });
        mesh.geometry?.dispose?.();
      });
      disposables.forEach((d) => d?.dispose?.());
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      setReady(false);
    };
  }, [active, reduced]);

  const p = Math.max(0, Math.min(1, scrollProgress));
  const photoStyle = {
    '--walk-x': `${-2 - p * 10}%`,
    '--walk-y': `${-1 - p * 3.5}%`,
    '--walk-x-a': `${(-2 - p * 10) * 0.34}%`,
    '--walk-y-a': `${(-1 - p * 3.5) * 0.2}%`,
    '--walk-x-b': `${(-2 - p * 10) * -0.26}%`,
    '--walk-y-b': `${(-1 - p * 3.5) * 0.15}%`,
    '--walk-scale': 1.04 + p * 0.44,
    '--walk-scale-a': 1.09 + p * 0.44,
    '--walk-scale-b': 1.06 + p * 0.44,
    '--walk-focus': `${20 + p * 70}%`,
  };

  return (
    <div className="pulse-walkthrough" aria-hidden="true" style={photoStyle}>
      <div className="pulse-walkthrough-photo" />
      <div className="pulse-walkthrough-depth depth-a" />
      <div className="pulse-walkthrough-depth depth-b" />
      <div ref={mount} className="pulse-walkthrough-canvas" />
      {(!ready || reduced) && <div className="pulse-walkthrough-fallback"><span>{reduced ? 'Reduced motion: static photoreal facility preview' : 'Loading 3D gym walkthrough'}</span></div>}
    </div>
  );
}
