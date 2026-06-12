import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Users, MessageSquare, GitBranch, Zap, Globe } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Code2, title: 'Posts con Markdown', description: 'Comparte codigo con syntax highlighting, snippets y formateo profesional. Soporta bloques de codigo en TypeScript, Python, Go y mas.', color: '#e1ff00' },
  { icon: Users, title: 'Perfiles Profesionales', description: 'Muestra tu stack tecnologico, proyectos destacados y experiencia. Conecta con otros devs que comparten tus intereses.', color: '#00ffff' },
  { icon: MessageSquare, title: 'Mensajeria Directa', description: 'Chats en tiempo real con indicadores de escritura y estado online. Comunicacion fluida sin distracciones.', color: '#ff1493' },
  { icon: GitBranch, title: 'Colaboracion Open Source', description: 'Descubre proyectos para contribuir, publica tus repositorios y encuentra colaboradores para tus ideas.', color: '#e1ff00' },
  { icon: Zap, title: 'Networking Inteligente', description: 'Sistema de seguimiento y recomendaciones basadas en tus tecnologias y proyectos favoritos.', color: '#00ffff' },
  { icon: Globe, title: 'Comunidad Global', description: 'Conecta con desarrolladores de todo el mundo. Comparte conocimiento y crece profesionalmente.', color: '#ff1493' },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>('.feature-card');
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            delay: i * 0.05,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative bg-[#050507] py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-[#e1ff00] tracking-widest mb-4 block">PLATAFORMA</span>
          <h2 className="font-medium text-[#f3f2f2] mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1px' }}>
            Todo lo que necesitas para<br />crecer como desarrollador
          </h2>
          <p className="text-[#5A6680] text-base max-w-xl mx-auto">
            Herramientas disenadas especificamente para la comunidad tech.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="feature-card bg-[#151A27] border border-[#2A3347] p-6 hover:border-[#3B82F6]/40 transition-all duration-300 group opacity-0">
                <div className="w-10 h-10 flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-[#f3f2f2] font-bold text-base mb-2 group-hover:text-[#e1ff00] transition-colors">{f.title}</h3>
                <p className="text-[#5A6680] text-sm leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
