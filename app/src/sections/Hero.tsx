import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface HeroProps {
  onRegister: () => void;
  onLogin: () => void;
}

export default function Hero({ onRegister, onLogin }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 1.4 });
    tl.fromTo(titleRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' })
      .fromTo(subtitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, '-=0.6')
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.4')
      .fromTo(metaRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.2');
    return () => { tl.kill(); };
  }, []);

  return (
    <section id="hero" className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video className="w-full h-full object-cover" src="/videos/hero.mp4" autoPlay loop muted playsInline poster="/images/feature1.jpg" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,5,7,0.4) 0%, rgba(5,5,7,0.85) 70%, #050507 100%)' }} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div ref={metaRef} className="mb-6 opacity-0">
          <span className="inline-block font-mono text-xs tracking-widest text-[#e1ff00] border border-[#e1ff00]/30 px-4 py-2">
            RED SOCIAL PARA DESARROLLADORES
          </span>
        </div>

        <h1 ref={titleRef} className="font-medium text-[#f3f2f2] mb-6 opacity-0" style={{ fontSize: 'clamp(36px, 7vw, 80px)', letterSpacing: '-2px', lineHeight: 1.05 }}>
          Conecta. Colabora.<br /><span className="text-[#e1ff00]">Construye.</span>
        </h1>

        <p ref={subtitleRef} className="text-[#8B9AB0] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-0">
          La plataforma profesional donde los desarrolladores comparten proyectos,
          colaboran en codigo abierto y construyen el futuro del software juntos.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0">
          <button onClick={onRegister} className="bg-[#e1ff00] text-[#050507] font-bold px-8 py-4 text-sm tracking-wide hover:bg-[#f3f2f2] transition-colors" style={{ borderRadius: '9999px' }}>
            Crear Cuenta Gratis
          </button>
          <button onClick={onLogin} className="text-[#8B9AB0] font-medium px-8 py-4 text-sm tracking-wide border border-[#2A3347] hover:border-[#e1ff00] hover:text-[#e1ff00] transition-colors" style={{ borderRadius: '9999px' }}>
            Explorar Comunidad
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#2A3347]/50 bg-[#050507]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { value: '50K+', label: 'Desarrolladores' },
            { value: '12K+', label: 'Proyectos' },
            { value: '3.2K+', label: 'Colaboraciones' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[#e1ff00] font-bold text-lg md:text-xl font-mono">{stat.value}</div>
              <div className="text-[#5A6680] text-xs font-mono tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
