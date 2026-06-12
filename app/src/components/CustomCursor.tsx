import { useRef, useEffect } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovering = false;
    let isVisible = false;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const onEnter = () => { isHovering = true; };
    const onLeave = () => { isHovering = false; };

    const attachHoverListeners = () => {
      const els = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, label, .post-card, .feature-card, .dev-card, [data-cursor-hover]'
      );
      els.forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
      return els;
    };

    let hoverEls = attachHoverListeners();

    const observer = new MutationObserver(() => {
      hoverEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      hoverEls = attachHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      const ringSize = isHovering ? 48 : 32;
      const dotSize = isHovering ? 6 : 5;

      dot.style.transform = `translate(${mouseX - dotSize / 2}px, ${mouseY - dotSize / 2}px)`;
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;

      ring.style.transform = `translate(${ringX - ringSize / 2}px, ${ringY - ringSize / 2}px)`;
      ring.style.width = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.borderColor = isHovering ? '#e1ff00' : '#e1ff0060';

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      hoverEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none bg-[#e1ff00] rounded-full hidden md:block"
        style={{
          width: '5px',
          height: '5px',
          opacity: 0,
          zIndex: 2147483647,
          transition: 'width 0.15s, height 0.15s',
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none rounded-full hidden md:block"
        style={{
          width: '32px',
          height: '32px',
          border: '1.5px solid #e1ff0060',
          opacity: 0,
          zIndex: 2147483646,
          transition: 'border-color 0.2s, width 0.2s, height 0.2s',
          willChange: 'transform',
        }}
      />
      <style>{`
        @media (min-width: 768px) {
          *, *::before, *::after { cursor: none !important; }
          video, iframe, embed, object { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
