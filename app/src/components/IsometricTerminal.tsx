import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SQRT3 = Math.pow(3, 0.5);
const ROW_COUNT = 8;
const ITEMS_PER_ROW = 10;
const SPACING = 1.2;
const LETTERS = ['0', '1', 'A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'Z'];

function createTextTexture(): THREE.CanvasTexture {
  const size = 64;
  const cvs = document.createElement('canvas');
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext('2d')!;

  ctx.fillStyle = '#1a1a1e';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const char = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  ctx.fillText(char, size / 2, size / 2);

  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  return tex;
}

function createGraphTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 64;
  const cvs = document.createElement('canvas');
  cvs.width = w;
  cvs.height = h;
  const ctx = cvs.getContext('2d')!;

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#e1ff00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < w; x += 4) {
    const y = h / 2 + Math.sin(x * 0.1 + Math.random() * 2) * (h * 0.3);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  return tex;
}

function createWireframeCube(): THREE.Group {
  const group = new THREE.Group();

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const edges = new THREE.EdgesGeometry(geo);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xe1ff00, linewidth: 1 });
  const wire = new THREE.LineSegments(edges, lineMat);

  const facesMat = new THREE.MeshBasicMaterial({
    color: 0x1a1a1e,
    transparent: true,
    opacity: 0.3,
  });
  const faces = new THREE.Mesh(geo, facesMat);

  group.add(faces);
  group.add(wire);
  return group;
}

function createDataRow(index: number): THREE.Group {
  const row = new THREE.Group();
  row.userData.index = index;
  row.userData.isRow = true;

  for (let i = 0; i < ITEMS_PER_ROW; i++) {
    const type = i % 3;
    const x = (i - ITEMS_PER_ROW / 2) * SPACING + (index % 2 === 0 ? 0 : SPACING * 0.5);

    if (type === 0) {
      // Text plane
      const geo = new THREE.PlaneGeometry(1, 1);
      const mat = new THREE.MeshBasicMaterial({
        map: createTextTexture(),
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0, 0);
      mesh.rotation.x = -Math.PI / 2;
      mesh.userData.type = 'text';
      row.add(mesh);
    } else if (type === 1) {
      // Wireframe cube
      const cube = createWireframeCube();
      cube.position.set(x, 0.5, 0);
      cube.userData.type = 'cube';
      row.add(cube);
    } else {
      // Graph plane
      const geo = new THREE.PlaneGeometry(1.5, 0.75);
      const mat = new THREE.MeshBasicMaterial({
        map: createGraphTexture(),
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0, 0);
      mesh.rotation.x = -Math.PI / 2;
      mesh.userData.type = 'graph';
      row.add(mesh);
    }
  }

  return row;
}

export default function IsometricTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!container || !canvasContainer) return;

    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);

    // Camera - isometric angle
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(-20, (20 * SQRT3) / 3, 20);
    camera.lookAt(0, 0, 0);
    camera.rotation.reorder('ZXY');
    camera.rotation.z = Math.PI / 4;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    canvasContainer.appendChild(renderer.domElement);

    // Group for all rows
    const gridGroup = new THREE.Group();
    scene.add(gridGroup);

    // Create rows
    const rows: THREE.Group[] = [];
    for (let i = 0; i < ROW_COUNT; i++) {
      const row = createDataRow(i);
      row.position.y = -(i * SPACING);
      gridGroup.add(row);
      rows.push(row);
    }

    // Animation state
    let time = 0;
    let scrollSpeed = 0;

    // ScrollTrigger for the section
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          scrollSpeed = self.getVelocity() / 1000;
          time = self.progress * 20;
        },
      });
    });

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      time += 0.005 + scrollSpeed * 0.01;
      scrollSpeed *= 0.95;

      // Move grid up
      gridGroup.position.y = (time * 2) % (ROW_COUNT * SPACING);

      // Apply modulo trick for infinite scroll
      rows.forEach((row) => {
        const baseY = row.userData.index * SPACING;
        const cycle = ROW_COUNT * SPACING;
        let visualY = (baseY + time * 2) % cycle;
        if (visualY < 0) visualY += cycle;
        row.position.y = visualY - cycle / 2;

        // Spin cubes
        row.children.forEach((child) => {
          if (child.userData.type === 'cube') {
            child.rotation.y += 0.01;
            child.rotation.x += 0.005;
          }
        });
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvasContainer.clientWidth;
      const h = canvasContainer.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      ctx.revert();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      canvasContainer.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative bg-[#050507]" style={{ height: '400vh' }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="font-medium text-[#f3f2f2] tracking-tight"
              style={{ fontSize: 'clamp(32px, 5vw, 64px)', letterSpacing: '-1px' }}
            >
              LA TERMINAL
            </h2>
            <p className="font-mono text-xs text-[#777] mt-2">
              ACCESO AL SISTEMA EN TIEMPO REAL
            </p>
          </div>
          <div className="font-mono text-xs text-[#e1ff00] border border-[#e1ff00] px-4 py-2">
            CONEXION ESTABLECIDA
          </div>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0"
        style={{ top: '100px' }}
      />

      {/* Overlay Labels */}
      <div className="absolute bottom-8 left-8 font-mono text-xs text-[#555] z-10">
        NODOS ACTIVOS: 2,847
      </div>
      <div className="absolute bottom-8 right-8 font-mono text-xs text-[#00ffff] z-10">
        LATENCIA: 12ms
      </div>
    </section>
  );
}
