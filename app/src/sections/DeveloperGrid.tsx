import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PROOF_POINTS = [
  { stat: '1',  label: 'Desarrollador',    desc: 'Solo yo. Ningún equipo, ningún colaborador externo.' },
  { stat: '∞',  label: 'Horas de código',  desc: 'Noches y fines de semana convirtiendo ideas en features reales.' },
  { stat: '0',  label: 'Inversión externa', desc: 'Proyecto personal 100%. Sin empresa, sin VC, sin nadie mas.' },
];

export default function DeveloperGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.manifesto-text',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 76%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo('.creator-card',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1.1, ease: 'expo.out', delay: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 76%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo('.proof-item',
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
          scrollTrigger: { trigger: '.proof-row', start: 'top 88%', toggleActions: 'play none none none' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="community" className="relative bg-[#050507] py-24 md:py-32 px-6 overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.022]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,#e1ff00 0,#e1ff00 1px,transparent 1px,transparent 64px),repeating-linear-gradient(90deg,#e1ff00 0,#e1ff00 1px,transparent 1px,transparent 64px)',
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse,rgba(225,255,0,0.045) 0%,transparent 65%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg,transparent,#1E2535)' }} />
          <span className="font-mono text-xs text-[#e1ff00] tracking-[0.25em]">EL PROYECTO</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg,#1E2535,transparent)' }} />
        </div>

        {/* Main: manifesto (left) + card (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-center mb-20">

          {/* Manifesto */}
          <div className="manifesto-text lg:col-span-3 opacity-0">
            <p className="font-mono text-xs text-[#3D4E68] tracking-widest mb-6">// 2026 — proyecto personal</p>
            <h2
              className="text-[#f3f2f2] font-black mb-8 leading-[1.05]"
              style={{ fontSize: 'clamp(30px, 4.5vw, 60px)', letterSpacing: '-2px' }}
            >
              GitHub guarda tu código.<br />
              LinkedIn vende tu perfil.<br />
              <span className="text-[#e1ff00]">DevConnect te conecta.</span>
            </h2>
            <p className="text-[#5A6680] text-base leading-relaxed max-w-lg mb-8">
              Ninguna red existente fue construida pensando en developers. GitHub es un repositorio. LinkedIn es un CV. DevConnect es el espacio que faltaba: donde compartir lo que estás construyendo, conectar con quien lo entiende, y crecer como dev.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-[#e1ff00]" />
              <span className="text-[#8B9AB0] text-sm italic">"Si no existe, constrúyelo."</span>
            </div>
          </div>

          {/* Creator card */}
          <div className="creator-card lg:col-span-2 opacity-0">
            <div className="relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg,#0A0D16 0%,#0D1117 100%)', border: '1px solid #1E2535' }}
            >
              {/* Top glow */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,#e1ff00,transparent)' }}
              />

              <div className="p-6">
                {/* Terminal dots */}
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-3 font-mono text-xs text-[#3D4E68]">developer.json</span>
                </div>

                {/* Avatar + name */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden"
                      style={{ border: '2px solid rgba(225,255,0,0.3)', boxShadow: '0 0 24px rgba(225,255,0,0.18)' }}
                    >
                      <img src="/images/logo-solocara.png" alt="Eddy Trejo" className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#22C55E]"
                      style={{ border: '2px solid #0A0D16' }}
                    />
                  </div>
                  <div>
                    <div className="text-[#f3f2f2] font-bold text-lg leading-tight">Eddy Trejo</div>
                    <div className="text-[#3D4E68] font-mono text-xs">@eddyjosuetr-coder</div>
                    <div className="text-[#e1ff00] font-mono text-[10px] tracking-wider mt-1">FULL STACK DEV · VE 🇻🇪</div>
                  </div>
                </div>

                {/* Code-style bio */}
                <div className="mb-5 font-mono text-[11px] leading-relaxed p-4"
                  style={{ background: '#060911', border: '1px solid #1E2535' }}
                >
                  <span className="text-[#e1ff00]">const</span>
                  <span className="text-[#f3f2f2]"> dev </span>
                  <span className="text-[#00ffff]">= </span>
                  <span className="text-[#f3f2f2]">{'{'}</span>
                  <br />
                  <span className="pl-4 text-[#5A6680]">proyecto: </span>
                  <span className="text-[#A5D6FF]">"DevConnect"</span>,<br />
                  <span className="pl-4 text-[#5A6680]">equipo&nbsp;&nbsp;: </span>
                  <span className="text-[#e1ff00]">1</span>,
                  <span className="text-[#3D4E68]"> // solo yo</span><br />
                  <span className="pl-4 text-[#5A6680]">inversion: </span>
                  <span className="text-[#22C55E]">false</span>,<br />
                  <span className="pl-4 text-[#5A6680]">funciona: </span>
                  <span className="text-[#22C55E]">true</span><br />
                  <span className="text-[#f3f2f2]">{'}'}</span>
                </div>

                <a
                  href="https://github.com/eddyjosuetr-coder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm font-mono py-2.5 transition-all hover:bg-[#e1ff00]/10 active:scale-95"
                  style={{ color: '#e1ff00', border: '1px solid rgba(225,255,0,0.25)' }}
                >
                  <Github size={14} />
                  Ver mi GitHub
                </a>
              </div>

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(225,255,0,0.15),transparent)' }}
              />
            </div>
          </div>
        </div>

        {/* Proof points */}
        <div className="proof-row grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROOF_POINTS.map((p) => (
            <div
              key={p.stat}
              className="proof-item opacity-0 p-7 relative overflow-hidden transition-all duration-300 cursor-default"
              style={{ background: '#0A0D16', border: '1px solid #1E2535' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(225,255,0,0.25)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1E2535'; }}
            >
              <div
                className="text-6xl font-black mb-3 text-[#e1ff00] leading-none"
                style={{ textShadow: '0 0 24px rgba(225,255,0,0.45)' }}
              >
                {p.stat}
              </div>
              <div className="text-[#f3f2f2] font-bold text-base mb-2">{p.label}</div>
              <p className="text-[#5A6680] text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
