import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, MapPin, Coffee } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STACK = [
  { label: 'React 19',      color: '#61DAFB' },
  { label: 'Vite 7',        color: '#646CFF' },
  { label: 'TypeScript',    color: '#3178C6' },
  { label: 'Hono',          color: '#E36002' },
  { label: 'tRPC v11',      color: '#2596BE' },
  { label: 'Drizzle ORM',   color: '#C5F74F' },
  { label: 'MySQL',         color: '#4479A1' },
  { label: 'Aiven Cloud',   color: '#FF5252' },
  { label: 'GSAP',          color: '#88CE02' },
  { label: 'Tailwind CSS',  color: '#06B6D4' },
  { label: 'Google OAuth',  color: '#EA4335' },
  { label: 'Vercel',        color: '#f3f2f2' },
];

export default function DeveloperGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.creator-card',
        { opacity: 0, y: 48 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play none none none' },
        }
      );
      gsap.fromTo('.stack-tag',
        { opacity: 0, scale: 0.75 },
        {
          opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)', stagger: 0.04,
          scrollTrigger: { trigger: '.stack-tags', start: 'top 88%', toggleActions: 'play none none none' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="community" className="relative bg-[#050507] py-24 md:py-32 px-6 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #e1ff00 0px, #e1ff00 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, #e1ff00 0px, #e1ff00 1px, transparent 1px, transparent 64px)',
      }} />
      {/* Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(225,255,0,0.05) 0%, transparent 70%)' }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="font-mono text-xs text-[#00ffff] tracking-[0.25em] mb-4 block">EL PROYECTO</span>
          <h2 className="font-medium text-[#f3f2f2] mb-4" style={{ fontSize: 'clamp(28px, 4vw, 50px)', letterSpacing: '-1.5px' }}>
            Un solo desarrollador.<br /><span className="text-[#e1ff00]">Un stack completo.</span>
          </h2>
          <p className="text-[#5A6680] text-base max-w-xl mx-auto">
            Sin equipo, sin inversión externa. Solo codigo, determinacion y las herramientas correctas.
          </p>
        </div>

        <div className="creator-card opacity-0 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #0A0D16 0%, #0D1117 100%)',
          border: '1px solid #1E2535',
        }}>
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #e1ff00, transparent)' }}
          />
          {/* Corner decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]"
            style={{ background: 'radial-gradient(circle at top right, #e1ff00, transparent 70%)' }}
          />

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-32 h-32 rounded-full overflow-hidden"
                  style={{
                    border: '2px solid rgba(225,255,0,0.35)',
                    boxShadow: '0 0 32px rgba(225,255,0,0.2), 0 0 64px rgba(225,255,0,0.08)',
                  }}
                >
                  <img
                    src="/images/logo-solocara.png"
                    alt="Eddy Trejo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#22C55E', border: '2px solid #0A0D16' }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                  <h3 className="text-[#f3f2f2] font-black text-2xl tracking-tight">Eddy Trejo</h3>
                  <span className="text-[#3D4E68] font-mono text-sm">@eddyjosuetr-coder</span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4 mb-5 text-xs font-mono">
                  <span className="text-[#e1ff00]">FULL STACK DEVELOPER</span>
                  <span className="flex items-center gap-1 text-[#5A6680]">
                    <MapPin size={10} />
                    Venezuela
                  </span>
                  <span className="flex items-center gap-1 text-[#5A6680]">
                    <Coffee size={10} />
                    1 dev
                  </span>
                </div>

                <p className="text-[#8B9AB0] text-sm leading-relaxed mb-6 max-w-lg">
                  Construi DevConnect completamente solo: servidor Hono con tRPC v11, base de datos MySQL real en Aiven Cloud con Drizzle ORM, autenticacion Google OAuth 2.0, y un frontend React 19 con GSAP. Cada feature que ves en la app la programe yo.
                </p>

                <a
                  href="https://github.com/eddyjosuetr-coder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-mono px-4 py-2 transition-all hover:bg-[#e1ff00]/10"
                  style={{
                    color: '#e1ff00',
                    border: '1px solid rgba(225,255,0,0.3)',
                  }}
                >
                  <Github size={14} />
                  github.com/eddyjosuetr-coder
                </a>
              </div>
            </div>

            {/* Stack */}
            <div className="stack-tags mt-8 pt-8" style={{ borderTop: '1px solid #1E2535' }}>
              <p className="text-[10px] font-mono text-[#3D4E68] tracking-[0.2em] mb-4">STACK TECNOLÓGICO UTILIZADO</p>
              <div className="flex flex-wrap gap-2">
                {STACK.map((tech) => (
                  <span
                    key={tech.label}
                    className="stack-tag text-[11px] font-mono px-3 py-1.5 opacity-0 transition-all hover:scale-105 cursor-default"
                    style={{
                      color: tech.color,
                      border: `1px solid ${tech.color}28`,
                      backgroundColor: `${tech.color}08`,
                    }}
                  >
                    {tech.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(225,255,0,0.2), transparent)' }}
          />
        </div>
      </div>
    </section>
  );
}
