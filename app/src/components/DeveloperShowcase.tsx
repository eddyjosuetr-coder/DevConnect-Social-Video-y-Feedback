import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Profile {
  id: string;
  name: string;
  role: string;
  image: string;
  tags: string[];
  bio: string;
}

interface ColumnData {
  header: string;
  profiles: Profile[];
}

const columns: ColumnData[] = [
  {
    header: 'SYS.ENGS / FRONTEND_01',
    profiles: [
      {
        id: 'alex',
        name: 'ALEX M.',
        role: 'SR. FRONTEND DEV',
        image: '/images/profile1.jpg',
        tags: ['REACT', 'TS', 'WEBGL'],
        bio: 'Especialista en animaciones complejas y experiencias interactivas. 8+ anos construyendo interfaces de alto rendimiento.',
      },
      {
        id: 'sarah',
        name: 'SARAH J.',
        role: 'UI ENGINEER',
        image: '/images/profile2.jpg',
        tags: ['VUE', 'CSS', 'A11Y'],
        bio: 'Apasionada por el diseño inclusivo y las microinteracciones. Lidera el sistema de componentes de la empresa.',
      },
      {
        id: 'mike',
        name: 'MIKE R.',
        role: 'REACT DEVELOPER',
        image: '/images/profile3.jpg',
        tags: ['NEXT.JS', 'GRAPHQL'],
        bio: 'Full-stack con enfoque en arquitecturas escalables. Contribuidor open source en el ecosistema React.',
      },
      {
        id: 'divya',
        name: 'DIVYA K.',
        role: 'CREATIVE DEV',
        image: '/images/profile4.jpg',
        tags: ['THREE.JS', 'GSAP'],
        bio: 'Combina arte y codigo para crear experiencias web immersivas. Speaker internacional en conferencias de frontend.',
      },
    ],
  },
  {
    header: 'SYS.ENGS / BACKEND_02',
    profiles: [
      {
        id: 'james',
        name: 'JAMES T.',
        role: 'SR. BACKEND DEV',
        image: '/images/profile1.jpg',
        tags: ['NODE', 'RUST', 'K8S'],
        bio: 'Arquitecto de sistemas distribuidos. Experto en microservicios y optimizacion de bases de datos a escala.',
      },
      {
        id: 'priya',
        name: 'PRIYA S.',
        role: 'DEVOPS LEAD',
        image: '/images/profile2.jpg',
        tags: ['AWS', 'TERRAFORM', 'CI/CD'],
        bio: 'Automatizadora compulsiva. Reduce tiempos de deploy de horas a minutos con pipelines inteligentes.',
      },
      {
        id: 'lucas',
        name: 'LUCAS B.',
        role: 'DATA ENGINEER',
        image: '/images/profile3.jpg',
        tags: ['PYTHON', 'SPARK', 'SQL'],
        bio: 'Transforma datos en insights accionables. Especialista en pipelines de datos y machine learning.',
      },
      {
        id: 'elena',
        name: 'ELENA V.',
        role: 'SECURITY ENG',
        image: '/images/profile4.jpg',
        tags: ['GO', 'CRYPTO', 'PENTEST'],
        bio: 'Caza vulnerabilidades por diversion. Construye sistemas seguros sin sacrificar la experiencia de usuario.',
      },
    ],
  },
];

export default function DeveloperShowcase() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [, setOffset] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const rail = railRef.current;
    if (!wrapper || !rail) return;

    const ctx = gsap.context(() => {
      gsap.to('.profile-column', {
        x: () => -(rail.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => '+=' + (rail.scrollWidth - window.innerWidth),
          scrub: 0.5,
          pin: '.showcase-frame',
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.width = self.progress * 100 + '%';
            }
          },
        },
      });

      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: () => '+=' + (rail.scrollWidth - window.innerWidth),
        onUpdate: (self) => {
          setOffset(Math.round(self.progress * (rail.scrollWidth - window.innerWidth)));
        },
      });

      const handleResize = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="showcase-wrapper">
      <div className="showcase-frame">
        <div ref={railRef} className="showcase-rail">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="profile-column">
              <div className="col-header">
                <span>{col.header}</span>
                <span>STATUS: ONLINE</span>
              </div>
              <div className="col-body">
                {col.profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="profile-card border border-[#333] p-4 bg-[#1a1a1e] flex flex-col"
                  >
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-32 object-cover mb-4 grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <h3 className="font-bold text-lg">{profile.name}</h3>
                    <p className="text-xs text-[#777] font-mono mb-2">
                      {profile.role}
                    </p>
                    <p className="text-sm text-[#f3f2f2] opacity-70 mb-4 flex-grow">
                      {profile.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {profile.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono border border-[#e1ff00] text-[#e1ff00] px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="showcase-utility">
        <span>SCROLL_OFFSET: DYNAMIC</span>
        <div className="w-[200px] h-[2px] bg-[#333] relative">
          <div
            ref={progressRef}
            className="absolute top-0 left-0 h-full bg-[#e1ff00]"
            style={{ width: '0%' }}
          />
        </div>
        <span>DEVCONNECT_ENGINE_v2.4</span>
      </div>
    </div>
  );
}
