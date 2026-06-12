import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 z-40 w-10 h-10 bg-[#1a1a1e] border border-[#2A3347] flex items-center justify-center text-[#5A6680] hover:text-[#e1ff00] hover:border-[#e1ff00] transition-all"
      aria-label="Volver arriba"
    >
      <ArrowUp size={18} />
    </button>
  );
}
