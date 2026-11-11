// Glass V3 — intro screen object: the REAL V3UV3 logo artwork (img/landing-mark.png,
// the cracked orange/teal glass render the user provided) wrapped onto extruded 3D
// glass shards, cut into the same irregular grid the old CSS version used, and sent
// flying the same way on click — but as real WebGL glass with real depth, bevels and
// lighting instead of a flat image. Built with the Premium 3D Glass engine's own
// techniques (bevelled extrusion, physical glass material), trimmed to a one-shot
// "explode once, never recompose" intro: no multi-chapter scroll, no shape morph.
// Source engine: .claude/skills/premium-3d-glass (MIT three.js, see js/vendor/).
import * as THREE from './vendor/three.module.js';

const container = document.querySelector('.landing__mark');
const canvas = document.querySelector('#introGlass');
const fallback = document.querySelector('.landing__fallback');

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TEXTURE_URL = 'img/landing-mark.png';
const MARK_HEIGHT = 2.7;           // world units, mapped to the full image height
const SHARD_DEPTH = 0.16;
const BEVEL = { size: 0.014, thickness: 0.018 };
const COLS = 6, ROWS = 4;
const EXPLODE_MS = 1300;
const STAGGER_MS = 220;            // per-shard start delay, same spirit as the old CSS version
const EXPLODE_DIST = 1.5;          // world units at full separation
const easeOutCubic = t => 1 - Math.pow(1 - t, 2.1);   // gentler than true cubic: less front-loaded

// ---- same seeded PRNG + irregular grid as the original CSS shatter -----------
function buildGridWeights() {
    let seed = 1337;
    const rnd = () => {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    const weights = (n, jitter) => {
        const w = [];
        for (let i = 0; i < n; i++) w.push(1 + (rnd() - 0.5) * jitter);
        const s = w.reduce((a, b) => a + b, 0);
        return w.map(x => x / s);
    };
    return { rnd, colW: weights(COLS, 0.7), rowH: weights(ROWS, 0.7) };
}

// ---- load the artwork once: a GPU texture + a CPU-readable alpha channel -----
async function loadArtwork(url) {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    const canvas2d = document.createElement('canvas');
    canvas2d.width = img.naturalWidth;
    canvas2d.height = img.naturalHeight;
    const ctx = canvas2d.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas2d.width, canvas2d.height);
    const texture = new THREE.CanvasTexture(canvas2d);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return { texture, pixels, width: canvas2d.width, height: canvas2d.height };
}

function meanAlpha(pixels, W, x0, y0, x1, y1, samples = 5) {
    let total = 0, n = 0;
    for (let i = 0; i < samples; i++) {
        for (let j = 0; j < samples; j++) {
            const px = Math.min(W - 1, Math.round(x0 + (x1 - x0) * (i + 0.5) / samples));
            const py = Math.min(pixels.height - 1, Math.round(y0 + (y1 - y0) * (j + 0.5) / samples));
            total += pixels.data[(py * W + px) * 4 + 3];
            n++;
        }
    }
    return total / n;
}

// Rectangular glass shard, UV-mapped to its slice of the artwork. alphaTest on the
// shared material discards the transparent background per-pixel on every face (top,
// bottom, bevel), so a plain rectangular prism still reads as the logo's own silhouette.
function buildShardGeometry(u0, v0, u1, v1, w, h, depth = SHARD_DEPTH, bevel = BEVEL) {
    const shape = new THREE.Shape([
        new THREE.Vector2(-w / 2, -h / 2), new THREE.Vector2(w / 2, -h / 2),
        new THREE.Vector2(w / 2, h / 2), new THREE.Vector2(-w / 2, h / 2)
    ]);
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth, steps: 1, bevelEnabled: bevel.size > 0,
        bevelSize: bevel.size, bevelThickness: bevel.thickness, bevelSegments: 3, curveSegments: 1
    });
    geometry.translate(0, 0, -depth / 2);
    // Derive UV straight from local XY instead of trusting ExtrudeGeometry's default UV
    // generator (not normalized to 0..1 in this three.js build — using it as such was
    // the actual bug behind the "wrong crop" render: fine by accident on tiny shards,
    // way off on one big merged plaque where it showed).
    const pos = geometry.attributes.position, uv = geometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        const nx = THREE.MathUtils.clamp((pos.getX(i) + w / 2) / w, 0, 1);
        const ny = THREE.MathUtils.clamp((pos.getY(i) + h / 2) / h, 0, 1);
        uv.setXY(i, u0 + nx * (u1 - u0), v0 + ny * (v1 - v0));
    }
    uv.needsUpdate = true;
    return geometry;
}

function createShardMaterial(texture) {
    const material = new THREE.MeshPhysicalMaterial({
        map: texture, transparent: false, alphaTest: 0.1, side: THREE.DoubleSide,
        roughness: 0.16, metalness: 0.0, clearcoat: 0.55, clearcoatRoughness: 0.1,
        envMapIntensity: 1.1, emissiveMap: texture, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.35
    });
    return material;
}

// Procedural studio: softbox panels tinted with the V3UV3 accents so the glass's
// own reflections carry the brand on top of the printed artwork.
function createEnvironment(renderer, scene) {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color('#05070a');
    const panels = [
        [2.6, 7, -4, 2, 3, '#ffffff', 2.2],
        [0.6, 6, 3, 1, 2, '#ffd9c4', 3.0],
        [4.5, 0.6, 0, 5, -1, '#ffffff', 3.0],
        [0.5, 5, -2, 0, -4, '#ff6a3d', 2.6],
        [0.9, 4.5, 3, -1, -3, '#2dd4a8', 2.4],
        [0.16, 5, -3, 0, 2, '#ffffff', 4.5]
    ];
    for (const [w, h, x, y, z, color, intensity] of panels) {
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
        panel.position.set(x, y, z);
        panel.lookAt(0, 0, 0);
        studio.add(panel);
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(studio, 0.03, 0.1, 100);
    scene.environment = environment.texture;
    studio.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    pmrem.dispose();
}

// ---- build + run --------------------------------------------------------------
async function init() {
    if (!container || !canvas) return;
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (e) { showFallback(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

    let artwork;
    try {
        artwork = await loadArtwork(TEXTURE_URL);
    } catch (e) { console.warn('[v3glass]', e); showFallback(); return; }

    let pivot, shards, wholeBody, objW = MARK_HEIGHT, objH = MARK_HEIGHT;
    try {
        createEnvironment(renderer, scene);
        pivot = new THREE.Group();
        scene.add(pivot);

        const { width: W, height: H } = artwork;
        const scale = MARK_HEIGHT / H;
        objW = W * scale; objH = H * scale;
        const cx = W / 2, cy = H / 2;
        const material = createShardMaterial(artwork.texture);

        // Assembled state: ONE merged plaque, not 24 touching shards — bevelled pieces
        // placed edge to edge still show a seam at every join (each bevel is its own
        // normal), so a true seamless "at rest" needs a single piece. Fragments (below)
        // only appear once the explosion starts, exactly like the engine's own wholeBody/
        // fragment split.
        {
            // Near-flat and bevel-less: a real bevel rim would trace the RECTANGLE,
            // not the logo's own silhouette (the artwork isn't rectangular), so a
            // thick beveled plaque shows a visible box around the letters. Shards
            // (below) keep the full bevel — their small rim reads as "glass chunk",
            // not "frame", and matters once things are already flying apart.
            const geometry = buildShardGeometry(0, 0, 1, 1, W * scale, H * scale, 0.02, { size: 0, thickness: 0 });
            wholeBody = new THREE.Mesh(geometry, material);
            pivot.add(wholeBody);
        }

        const { rnd, colW, rowH } = buildGridWeights();
        const colX = [], rowY = [];
        let acc = 0; colW.forEach(w => { colX.push(acc); acc += w; });
        acc = 0; rowH.forEach(h => { rowY.push(acc); acc += h; });

        shards = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const x0f = colX[c], x1f = colX[c] + colW[c], y0f = rowY[r], y1f = rowY[r] + rowH[r];
                const px0 = x0f * W, px1 = x1f * W, py0 = y0f * H, py1 = y1f * H;
                if (meanAlpha(artwork.pixels, W, px0, py0, px1, py1) < 10) continue; // empty cell, skip

                const u0 = px0 / W, u1 = px1 / W, v0 = 1 - py1 / H, v1 = 1 - py0 / H;
                const wx0 = (px0 - cx) * scale, wx1 = (px1 - cx) * scale;
                const wy0 = (cy - py1) * scale, wy1 = (cy - py0) * scale;
                const home = new THREE.Vector3((wx0 + wx1) / 2, (wy0 + wy1) / 2, 0);
                const geometry = buildShardGeometry(u0, v0, u1, v1, wx1 - wx0, wy1 - wy0);
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(home);
                pivot.add(mesh);

                const ncx = x0f + colW[c] / 2 - 0.5, ncy = y0f + rowH[r] / 2 - 0.5;
                const ang = Math.atan2(ncy, ncx) + (rnd() - 0.5) * 0.7;
                const dist = (0.45 + rnd() * 0.65) * EXPLODE_DIST;
                shards.push({
                    mesh, home,
                    offset: new THREE.Vector3(Math.cos(ang) * dist, -Math.sin(ang) * dist, (rnd() - 0.5) * 1.4),
                    spin: new THREE.Vector3((rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.7, (rnd() - 0.5) * 1.3),
                    delay: rnd() * STAGGER_MS
                });
            }
        }
    } catch (e) { console.warn('[v3glass]', e); showFallback(); return; }

    // Computed from the object's real size + the container's aspect, with a margin —
    // not hand-tuned: a magic distance constant drifted out of sync (and cropped the
    // logo) the moment the container's own size/ratio changed.
    let camDist = 5;
    const FRAME_MARGIN = 1.18;
    function sizeToContainer(w, h) {
        if (!w || !h) { const r = container.getBoundingClientRect(); w = r.width; h = r.height; }
        if (!w || !h) return false;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const distForHeight = (objH / 2 * FRAME_MARGIN) / Math.tan(vFov / 2);
        const distForWidth = (objW / 2 * FRAME_MARGIN) / (Math.tan(vFov / 2) * camera.aspect);
        camDist = Math.max(distForHeight, distForWidth);
        return true;
    }
    // getBoundingClientRect() can read 0x0 on the very first tick after navigation in
    // this pane, before the initial layout settles — ResizeObserver fires once it's real.
    let sized = sizeToContainer();
    new ResizeObserver(entries => {
        const box = entries[0].contentBoxSize ? entries[0].contentBoxSize[0] : null;
        const w = box ? box.inlineSize : entries[0].contentRect.width;
        const h = box ? box.blockSize : entries[0].contentRect.height;
        if (sizeToContainer(w, h)) { sized = true; renderer.render(scene, camera); }
    }).observe(container);

    for (const shard of shards) shard.mesh.visible = false;
    let sway = 0, running = !REDUCED, raf = null, startedAt = 0, exploding = false, forcedP = null;

    function layout(now) {
        for (const shard of shards) {
            let p = 0;
            if (forcedP !== null) p = forcedP;
            else if (exploding) p = Math.min(1, Math.max(0, (now - startedAt - shard.delay) / EXPLODE_MS));
            const s = easeOutCubic(p);
            shard.mesh.position.set(
                shard.home.x + shard.offset.x * s,
                shard.home.y + shard.offset.y * s,
                shard.home.z + shard.offset.z * s
            );
            shard.mesh.rotation.set(shard.spin.x * s, shard.spin.y * s, shard.spin.z * s);
        }
        camera.position.set(Math.sin(sway) * 0.35, 0.1, camDist);
        camera.lookAt(0, 0, 0);
    }

    function frame(now) {
        if (!document.body.contains(canvas)) { running = false; return; }
        sway += 0.0022;
        layout(now);
        renderer.render(scene, camera);
        if (running) raf = requestAnimationFrame(frame);
    }

    layout(0);
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);

    window.__v3glass = {
        explode() {
            if (REDUCED) return;
            forcedP = null;
            exploding = true;
            wholeBody.visible = false;
            for (const shard of shards) shard.mesh.visible = true;
            startedAt = performance.now();
            if (!running) { running = true; raf = requestAnimationFrame(frame); }
        },
        // debug only: pin the explosion at a given 0..1 progress without animating
        snap(p) {
            forcedP = p;
            wholeBody.visible = p <= 0;
            for (const shard of shards) shard.mesh.visible = p > 0;
            layout(0);
            renderer.render(scene, camera);
        }
    };
}

function showFallback() {
    canvas && (canvas.style.display = 'none');
    fallback && (fallback.style.display = 'block');
    window.__v3glass = { explode() {} };
}

init();
