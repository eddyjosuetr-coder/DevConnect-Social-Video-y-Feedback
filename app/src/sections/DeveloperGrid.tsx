import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Github, ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const developers = [
  {
    name: 'Alejandro Marin',
    username: '@alexmarin',
    role: 'Senior Frontend Dev',
    image: '/images/profile1.jpg',
    location: 'Madrid, ES',
    github: 'alexmarin',
    tags: ['React', 'TypeScript', 'WebGL'],
    bio: 'Especialista en animaciones complejas y experiencias interactivas. 8+ anos construyendo interfaces.',
  },
  {
    name: 'Sofia Jimenez',
    username: '@sofiaj',
    role: 'UI Engineer',
    image: '/images/profile2.jpg',
    location: 'Barcelona, ES',
    github: 'sofiajimenez',
    tags: ['Vue', 'CSS', 'A11Y'],
    bio: 'Apasionada por el diseno inclusivo y las microinteracciones. Lidera sistemas de componentes.',
  },
  {
    name: 'Miguel Rios',
    username: '@mrios',
    role: 'Full Stack Dev',
    image: '/images/profile3.jpg',
    location: 'Mexico City, MX',
    github: 'miguelrios',
    tags: ['Next.js', 'GraphQL', 'Node'],
    bio: 'Full-stack enfocado en arquitecturas escalables. Contribuidor open source en el ecosistema React.',
  },
  {
    name: 'Divya Krishnan',
    username: '@divyak',
    role: 'Creative Developer',
    image: '/images/profile4.jpg',
    location: 'Bangalore, IN',
    github: 'divyakrishnan',
    tags: ['Three.js', 'GSAP', 'Shaders'],
    bio: 'Combina arte y codigo para crear experiencias web immersivas. Speaker internacional.',
  },
  {
    name: 'Carlos Mendez',
    username: '@cmendez',
    role: 'Backend Engineer',
    image: '/images/profile5.jpg',
    location: 'Buenos Aires, AR',
    github: 'carlosmendez',
    tags: ['Rust', 'Go', 'Kubernetes'],
    bio: 'Arquitecto de sistemas distribuidos. Experto en microservicios a escala.',
  },
  {
    name: 'Yuki Tanaka',
    username: '@yukit',
    role: 'DevOps Lead',
    image: '/images/profile6.jpg',
    location: 'Tokyo, JP',
    github: 'yukitanaka',
    tags: ['AWS', 'Terraform', 'CI/CD'],
    bio: 'Automatizadora compulsiva. Reduce tiempos de deploy de horas a minutos.',
  },
  {
    name: 'Daniel Okafor',
    username: '@dokafor',
    role: 'Data Engineer',
    image: '/images/profile7.jpg',
    location: 'Lagos, NG',
    github: 'danielokafor',
    tags: ['Python', 'Spark', 'ML'],
    bio: 'Transforma datos en insights accionables. Especialista en pipelines de datos.',
  },
  {
    name: 'Ravi Patel',
    username: '@ravipatel',
    role: 'Security Engineer',
    image: '/images/profile8.jpg',
    location: 'London, UK',
    github: 'ravipatel',
    tags: ['Go', 'Crypto', 'Pentest'],
    bio: 'Caza vulnerabilidades por diversion. Construye sistemas seguros sin sacrificar UX.',
  },
];

export default function DeveloperGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>('.dev-card');
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
            delay: (i % 4) * 0.08,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="community" className="relative bg-[#050507] py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-xs text-[#00ffff] tracking-widest mb-4 block">COMUNIDAD</span>
            <h2 className="font-medium text-[#f3f2f2]" style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1px' }}>
              Desarrolladores destacados
            </h2>
            <p className="text-[#5A6680] text-base mt-2 max-w-lg">
              Conoce a los profesionales que estan construyendo el futuro del software en DevConnect.
            </p>
          </div>
          <button className="text-[#e1ff00] font-mono text-sm border border-[#e1ff00]/30 px-4 py-2 hover:bg-[#e1ff00]/10 transition-colors self-start md:self-auto">
            VER TODOS →
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {developers.map((dev) => (
            <div
              key={dev.username}
              className="dev-card bg-[#151A27] border border-[#2A3347] overflow-hidden hover:border-[#3B82F6]/40 transition-all duration-300 group opacity-0"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={dev.image}
                  alt={dev.name}
                  className="w-full aspect-[3/4] object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href="#" className="w-8 h-8 bg-[#050507]/80 flex items-center justify-center hover:bg-[#e1ff00] hover:text-[#050507] transition-colors">
                    <Github size={14} />
                  </a>
                  <a href="#" className="w-8 h-8 bg-[#050507]/80 flex items-center justify-center hover:bg-[#e1ff00] hover:text-[#050507] transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-[#f3f2f2] font-bold text-sm group-hover:text-[#e1ff00] transition-colors">
                  {dev.name}
                </h3>
                <p className="text-[#5A6680] text-xs font-mono mt-0.5">{dev.role}</p>

                <div className="flex items-center gap-1 mt-2 text-[#5A6680]">
                  <MapPin size={10} />
                  <span className="text-xs">{dev.location}</span>
                </div>

                <p className="text-[#5A6680] text-xs mt-2 leading-relaxed line-clamp-2">
                  {dev.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {dev.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono border border-[#2A3347] text-[#8B9AB0] px-2 py-0.5 group-hover:border-[#e1ff00]/30 group-hover:text-[#e1ff00] transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
