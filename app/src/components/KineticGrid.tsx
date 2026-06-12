import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function KineticGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  const items = ['React', 'System', 'Node', 'Vercel', 'API', 'Graph', 'Query', 'Cache', 'Deploy'];

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const gridItems = gsap.utils.toArray<HTMLDivElement>('.kinetic-item', el);
    const charsArray: HTMLSpanElement[][] = gridItems.map((item) =>
      [...item.querySelectorAll<HTMLSpanElement>('.kinetic-char')]
    );
    const originalChars = charsArray.flat();

    const tl = gsap.timeline({
      defaults: { ease: 'power2' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=150%',
        scrub: true,
        pin: true,
      },
    });

    tl.fromTo(
      el,
      { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 },
      { rotateX: 50, rotateY: -15, scale: 0.7 },
      0
    );

    tl.fromTo(
      '.kinetic-char',
      { gap: '0.5rem' },
      {
        gap: '2rem',
        ease: 'power3',
        stagger: { amount: 0.5, from: 'center' },
      },
      0
    );

    tl.to(
      originalChars,
      {
        filter: 'brightness(300%)',
        ease: 'power3',
        yPercent: -40,
        stagger: { amount: 0.5, from: 'center' },
      },
      0
    );

    tl.to(
      originalChars,
      {
        filter: 'brightness(100%)',
        ease: 'power2.inOut',
        yPercent: 0,
        stagger: { amount: 0.5, from: 'center' },
      },
      0.5
    );

    tl.to(el, { opacity: 0, startAt: { opacity: 1 } }, 0.7);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={gridRef} className="relative z-10 pointer-events-none">
      <div className="kinetic-grid">
        {items.map((item, idx) => (
          <div key={idx} className="kinetic-item">
            {item.split('').map((char, cidx) => (
              <span key={cidx} className="kinetic-char">
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
