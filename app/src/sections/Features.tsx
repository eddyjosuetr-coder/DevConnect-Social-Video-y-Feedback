import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Users, MessageSquare, Heart, Search, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Code2,
    title: 'Posts con Codigo',
    description: 'Comparte snippets con syntax highlighting, numeros de linea y boton de copiar. Soporta TypeScript, Python, Rust, Go y mas.',
    color: '#e1ff00',
    tag: 'DISPONIBLE',
  },
  {
    icon: Users,
    title: 'Perfiles Reales',
    description: 'Auth con Google OAuth. Tu nombre, foto y posts en un perfil publico. Ve el historial de publicaciones de cualquier usuario.',
    color: '#00ffff',
    tag: 'DISPONIBLE',
  },
  {
    icon: MessageSquare,
    title: 'Comentarios',
    description: 'Comenta en los posts de otros devs. Discusiones tecnicas, feedback de codigo y conversaciones directas en el feed.',
    color: '#ff1493',
    tag: 'DISPONIBLE',
  },
  {
    icon: Heart,
    title: 'Likes y Reposts',
    description: 'Da like y repostea el contenido que te parece valioso. Metricas reales guardadas en base de datos MySQL en la nube.',
    color: '#e1ff00',
    tag: 'DISPONIBLE',
  },
  {
    icon: Search,
    title: 'Busqueda en el Feed',
    description: 'Filtra posts por contenido, autor, tags o lenguaje de programacion. Encuentra exactamente lo que necesitas.',
    color: '#00ffff',
    tag: 'DISPONIBLE',
  },
  {
    icon: ShieldCheck,
    title: 'Auth Segura',
    description: 'Google OAuth 2.0. Sin passwords que guardar, sin vulnerabilidades de credenciales. Login con un click.',
    color: '#ff1493',
    tag: 'DISPONIBLE',
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 36 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 86%', toggleActions: 'play none none none' },
            delay: (i % 3) * 0.07,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative bg-[#050507] py-24 md:py-32 px-6 overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #e1ff00 0px, #e1ff00 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #e1ff00 0px, #e1ff00 1px, transparent 1px, transparent 80px)',
      }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-[#e1ff00] tracking-[0.25em] mb-4 block">FUNCIONALIDADES REALES</span>
          <h2 className="font-medium text-[#f3f2f2] mb-4" style={{ fontSize: 'clamp(28px, 4vw, 50px)', letterSpacing: '-1.5px' }}>
            Todo funciona.<br />Todo esta en produccion.
          </h2>
          <p className="text-[#5A6680] text-base max-w-xl mx-auto">
            No mockups. No demos vacias. Cada feature que ves es real y esta conectado a una base de datos en la nube.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="feature-card relative bg-[#0A0D16] border border-[#1E2535] p-6 group opacity-0 overflow-hidden transition-all duration-300 hover:border-opacity-60"
                style={{ '--accent': f.color } as React.CSSProperties}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${f.color}40`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1E2535'; }}
              >
                {/* Left accent on hover */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: f.color, boxShadow: `0 0 12px ${f.color}` }}
                />

                {/* Icon */}
                <div
                  className="w-11 h-11 flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${f.color}10`,
                    border: `1px solid ${f.color}25`,
                    boxShadow: `0 0 0 0 ${f.color}00`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${f.color}30`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <Icon size={20} style={{ color: f.color }} strokeWidth={1.5} />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[#f3f2f2] font-bold text-[15px] transition-colors duration-300 group-hover:text-[#e1ff00]">{f.title}</h3>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 border"
                    style={{ color: f.color, borderColor: `${f.color}30`, backgroundColor: `${f.color}08` }}
                  >
                    {f.tag}
                  </span>
                </div>
                <p className="text-[#5A6680] text-sm leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
