import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec4 uResolution;
uniform float uParallax;
uniform float uDistance;
uniform float uUvScale;

vec2 coverUv(vec2 uv, vec4 resolution) {
  vec2 s = resolution.xy / resolution.zw;
  vec2 new = vec2(uv.x * s.x, (uv.y - 0.5) * s.y + 0.5);
  return new;
}

void main() {
  vec2 uv = coverUv(vUv, uResolution);
  vec2 offset = vec2((uDistance * 0.3) * uParallax, 0.0);
  vec4 colorR = texture2D(uTexture, uv - offset);
  vec4 colorG = texture2D(uTexture, uv - offset);
  vec4 colorB = texture2D(uTexture, uv - offset);
  gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
}
`;

interface FeatureLayer {
  title: string;
  subtitle: string;
  image: string;
  parallax: number;
}

const features: FeatureLayer[] = [
  {
    title: 'COLABORACION EN TIEMPO REAL',
    subtitle: 'SYS.01',
    image: '/images/feature1.jpg',
    parallax: 0.3,
  },
  {
    title: 'GRAFO OPEN SOURCE',
    subtitle: 'SYS.02',
    image: '/images/feature2.jpg',
    parallax: 0.6,
  },
  {
    title: 'DEPLOY SIN SERVIDOR',
    subtitle: 'SYS.03',
    image: '/images/feature3.jpg',
    parallax: 0.9,
  },
];

export default function DeepZParallax() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      0.1,
      1000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '5';

    const textureLoader = new THREE.TextureLoader();
    const meshes: THREE.Mesh[] = [];
    const materials: THREE.ShaderMaterial[] = [];

    features.forEach((feature, i) => {
      const texture = textureLoader.load(feature.image);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uResolution: {
            value: new THREE.Vector4(width, height, width, height),
          },
          uParallax: { value: feature.parallax },
          uDistance: { value: 0 },
          uUvScale: { value: 1.0 },
        },
        transparent: true,
      });

      const geometry = new THREE.PlaneGeometry(width * 0.8, height * 0.6);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = -i * 30;
      scene.add(mesh);
      meshes.push(mesh);
      materials.push(material);
    });

    // Sync DOM layers with WebGL
    const syncPositions = () => {
      layersRef.current.forEach((layer, i) => {
        if (!layer || !meshes[i]) return;
        const rect = layer.getBoundingClientRect();
        const mesh = meshes[i];
        mesh.position.x = rect.left - width / 2 + rect.width / 2;
        mesh.position.y = -(rect.top - height / 2 + rect.height / 2);
      });
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=500%',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;

          // Move camera through z-space
          camera.position.z = 100 - progress * 150;

          // Update shader uniforms
          materials.forEach((mat, i) => {
            mat.uniforms.uDistance.value = progress;
            mat.uniforms.uParallax.value = features[i].parallax * progress;
          });

          syncPositions();
        },
      });
    });

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.left = w / -2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = h / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      materials.forEach((mat) => {
        mat.uniforms.uResolution.value.set(w, h, w, h);
      });

      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(w * 0.8, h * 0.6);
      });

      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      ctx.revert();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      meshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.ShaderMaterial).dispose();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#050507]"
      style={{ height: '600vh' }}
    >
      <canvas ref={canvasRef} />

      {/* Hidden DOM layers for position syncing */}
      <div className="absolute inset-0 flex items-center justify-center">
        {features.map((feature, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) layersRef.current[i] = el;
            }}
            className="absolute flex flex-col items-center justify-center text-center"
            style={{
              width: '80vw',
              height: '60vh',
              opacity: 0,
              pointerEvents: 'none',
              top: `${20 + i * 5}%`,
            }}
          >
            <div className="absolute top-0 left-0 font-mono text-xs text-[#e1ff00]">
              {feature.subtitle}
            </div>
            <h2
              className="font-medium text-[#f3f2f2] tracking-tight"
              style={{
                fontSize: 'clamp(32px, 5vw, 64px)',
                letterSpacing: '-1px',
              }}
            >
              {feature.title}
            </h2>
          </div>
        ))}
      </div>

      {/* Visible UI overlay */}
      <div className="fixed top-8 left-8 font-mono text-xs text-[#555] z-20 pointer-events-none">
        SYS.ARCH
      </div>
      <div className="fixed top-8 right-8 font-mono text-xs text-[#e1ff00] z-20 pointer-events-none">
        LIVE_FEED
      </div>
      <div className="fixed bottom-8 left-8 font-mono text-xs text-[#555] z-20 pointer-events-none">
        Z_DEPTH: ACTIVE
      </div>
      <div className="fixed bottom-8 right-8 font-mono text-xs text-[#00ffff] z-20 pointer-events-none">
        STATUS: ONLINE
      </div>
    </section>
  );
}
