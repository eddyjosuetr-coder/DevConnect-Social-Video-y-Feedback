import { useRef, useEffect } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const handleMouseEnterInteractive = () => {
      isHovering = true;
    };

    const handleMouseLeaveInteractive = () => {
      isHovering = false;
    };

    const addInteractiveListeners = () => {
      const interactives = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, .profile-card, .kinetic-item'
      );
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnterInteractive);
        el.addEventListener('mouseleave', handleMouseLeaveInteractive);
      });
      return interactives;
    };

    let interactives = addInteractiveListeners();

    // MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(() => {
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnterInteractive);
        el.removeEventListener('mouseleave', handleMouseLeaveInteractive);
      });
      interactives = addInteractiveListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const animate = () => {
      x += (targetX - x) * 0.15;
      y += (targetY - y) * 0.15;

      const size = isHovering ? 40 : 4;
      const offset = size / 2;

      cursor.style.transform = `translate(${x - offset}px, ${y - offset}px)`;
      cursor.style.width = `${size}px`;
      cursor.style.height = `${size}px`;
      cursor.style.mixBlendMode = isHovering ? 'exclusion' : 'normal';

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      observer.disconnect();
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnterInteractive);
        el.removeEventListener('mouseleave', handleMouseLeaveInteractive);
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-[#e1ff00] hidden md:block"
      style={{
        width: '4px',
        height: '4px',
        transition: 'width 0.3s, height 0.3s',
        willChange: 'transform',
      }}
    />
  );
}
