import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#050507] py-24 md:py-32 px-6">
      <div className="cta-content max-w-3xl mx-auto text-center border border-[#2A3347] p-8 md:p-12 opacity-0">
        <span className="font-mono text-xs text-[#e1ff00] tracking-widest mb-6 block">UNETE HOY</span>
        <h2 className="font-medium text-[#f3f2f2] mb-4" style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-1px' }}>
          Tu proximo proyecto<br />empieza aqui
        </h2>
        <p className="text-[#5A6680] text-base max-w-lg mx-auto mb-8">
          Unete a 50,000+ desarrolladores que ya estan construyendo el futuro. Gratis para siempre.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onRegister} className="bg-[#e1ff00] text-[#050507] font-bold px-8 py-4 text-sm tracking-wide hover:bg-[#f3f2f2] transition-colors w-full sm:w-auto" style={{ borderRadius: '9999px' }}>
            Crear Cuenta Gratis
          </button>
          <button className="text-[#8B9AB0] font-medium px-8 py-4 text-sm tracking-wide border border-[#2A3347] hover:border-[#e1ff00] hover:text-[#e1ff00] transition-colors w-full sm:w-auto" style={{ borderRadius: '9999px' }}>
            Ver Documentacion
          </button>
        </div>
        <p className="text-[#5A6680] text-xs font-mono mt-6">NO REQUIERE TARJETA DE CREDITO</p>
      </div>
    </section>
  );
}
