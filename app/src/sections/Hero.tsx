import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface HeroProps {
  onRegister: () => void;
  onLogin: () => void;
}

const HERO_HOOKS = [
  { label: 'Código Primero', sub: 'Diseñado para devs' },
  { label: 'Auth Real',      sub: 'Google OAuth 2.0' },
  { label: '1 Desarrollador', sub: 'Lo construí yo' },
  { label: 'Funciona Ya',    sub: 'En producción' },
];

export default function Hero({ onRegister, onLogin }: HeroProps) {
  const logoRef   = useRef<HTMLImageElement>(null);
  const metaRef   = useRef<HTMLDivElement>(null);
  const titleRef  = useRef<HTMLHeadingElement>(null);
  const subRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);
  const stackRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(logoRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' })
      .fromTo(titleRef.current, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1,   ease: 'expo.out' }, '-=0.5')
      .fromTo(subRef.current,   { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, '-=0.6')
      .fromTo(ctaRef.current,   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, '-=0.4')
      .fromTo(stackRef.current, { opacity: 0 },        { opacity: 1, duration: 0.6 }, '-=0.2');
    return () => { tl.kill(); };
  }, []);

  return (
    <section id="hero" className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Video BG */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          src="/videos/hero.mp4"
          autoPlay loop muted playsInline
          poster="/images/feature1.jpg"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(5,5,7,0.55) 0%, rgba(5,5,7,0.88) 65%, #050507 100%)',
        }} />
      </div>

      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse, rgba(225,255,0,0.07) 0%, transparent 70%)' }}
      />

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24 pb-36">
        {/* Logo with name */}
        <div className="flex justify-center mb-8" ref={metaRef}>
          <span
            ref={logoRef}
            className="font-mono text-xs tracking-[0.3em] text-[#e1ff00] uppercase opacity-0"
          >
            DevConnect
          </span>
        </div>

        <h1
          ref={titleRef}
          className="font-medium text-[#f3f2f2] mb-6 opacity-0"
          style={{ fontSize: 'clamp(38px, 7.5vw, 84px)', letterSpacing: '-2.5px', lineHeight: 1.04 }}
        >
          Conecta. Colabora.<br />
          <span className="text-[#e1ff00]">Construye.</span>
        </h1>

        <p
          ref={subRef}
          className="text-[#8B9AB0] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-0"
        >
          La plataforma donde los desarrolladores comparten codigo, colaboran en proyectos y crecen juntos. Real, open, construido desde cero.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0">
          <button
            onClick={onRegister}
            className="bg-[#e1ff00] text-[#050507] font-bold px-9 py-4 text-sm tracking-wide hover:bg-[#f3f2f2] active:scale-95 transition-all"
            style={{ borderRadius: '9999px', boxShadow: '0 0 24px rgba(225,255,0,0.3)' }}
          >
            Empezar
          </button>
          <button
            onClick={onLogin}
            className="text-[#8B9AB0] font-medium px-9 py-4 text-sm tracking-wide border border-[#2A3347] hover:border-[#e1ff00] hover:text-[#e1ff00] transition-all active:scale-95"
            style={{ borderRadius: '9999px' }}
          >
            Ver el Feed →
          </button>
        </div>
      </div>

      {/* Tech stack bar */}
      <div
        ref={stackRef}
        className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#2A3347]/50 bg-[#050507]/85 backdrop-blur-sm opacity-0"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {HERO_HOOKS.map((t) => (
            <div key={t.label} className="text-center">
              <div className="text-[#e1ff00] font-mono font-bold text-sm">{t.label}</div>
              <div className="text-[#5A6680] text-[10px] font-mono tracking-wider uppercase">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
