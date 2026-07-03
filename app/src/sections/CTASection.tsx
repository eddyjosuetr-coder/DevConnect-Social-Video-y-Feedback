import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CTASectionProps {
  onRegister: () => void;
}

export default function CTASection({ onRegister }: CTASectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-content',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#050507] py-24 md:py-32 px-6 overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(225,255,0,0.06) 0%, transparent 70%)' }}
      />

      <div className="cta-content max-w-3xl mx-auto text-center relative overflow-hidden opacity-0 p-8 md:p-14"
        style={{ background: 'linear-gradient(135deg, #0A0D16 0%, #0D1117 100%)', border: '1px solid #1E2535' }}
      >
        {/* Top line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #e1ff00, transparent)' }}
        />

        <span className="font-mono text-xs text-[#e1ff00] tracking-[0.25em] mb-6 block">ÚNETE HOY</span>
        <h2 className="font-medium text-[#f3f2f2] mb-4" style={{ fontSize: 'clamp(28px, 4vw, 54px)', letterSpacing: '-1.5px' }}>
          Se parte desde<br />el primer dia
        </h2>
        <p className="text-[#5A6680] text-base max-w-lg mx-auto mb-8 leading-relaxed">
          DevConnect esta creciendo. Crea tu cuenta con Google, sube tu primer post de codigo y forma parte de la comunidad desde el inicio.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <button
            onClick={onRegister}
            className="bg-[#e1ff00] text-[#050507] font-bold px-9 py-4 text-sm tracking-wide hover:bg-[#f3f2f2] active:scale-95 transition-all w-full sm:w-auto"
            style={{ borderRadius: '9999px', boxShadow: '0 0 24px rgba(225,255,0,0.25)' }}
          >
            Crear Cuenta Gratis
          </button>
          <a
            href="https://github.com/eddyjosuetr-coder/DevConnect-Social-Video-y-Feedback"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-[#8B9AB0] font-medium px-9 py-4 text-sm tracking-wide border border-[#2A3347] hover:border-[#e1ff00] hover:text-[#e1ff00] transition-all w-full sm:w-auto active:scale-95"
            style={{ borderRadius: '9999px' }}
          >
            <Github size={15} />
            Ver Repositorio
          </a>
        </div>

        <p className="text-[#3D4E68] text-xs font-mono">GRATIS · SOLO REQUIERE UNA CUENTA GOOGLE</p>

        {/* Bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(225,255,0,0.2), transparent)' }}
        />
      </div>
    </section>
  );
}
