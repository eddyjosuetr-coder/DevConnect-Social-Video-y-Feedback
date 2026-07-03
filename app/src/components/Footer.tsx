import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-[#1E2535] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/images/logo-solocara.png"
                alt="DevConnect"
                className="w-9 h-9 object-contain"
                style={{ filter: 'drop-shadow(0 0 6px rgba(225,255,0,0.5))' }}
              />
              <span className="text-[#f3f2f2] font-bold text-lg tracking-tight">DevConnect</span>
            </div>
            <p className="text-sm text-[#5A6680] leading-relaxed mb-4">
              La red social para desarrolladores. Codigo, comunidad y colaboracion.
            </p>
            <a
              href="https://github.com/eddyjosuetr-coder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D4E68] hover:text-[#e1ff00] transition-colors"
            >
              <Github size={12} />
              eddyjosuetr-coder
            </a>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-xs font-mono text-[#e1ff00] mb-4 tracking-wider">PRODUCTO</h4>
            <ul className="space-y-2.5">
              {['Feed', 'Perfiles', 'Comentarios', 'Explorar', 'Guardados'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[#5A6680] hover:text-[#e1ff00] transition-colors cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stack */}
          <div>
            <h4 className="text-xs font-mono text-[#e1ff00] mb-4 tracking-wider">STACK</h4>
            <ul className="space-y-2.5">
              {['React 19 + Vite 7', 'Hono + tRPC v11', 'Drizzle ORM', 'MySQL (Aiven)', 'TypeScript'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[#5A6680] font-mono">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-mono text-[#e1ff00] mb-4 tracking-wider">LEGAL</h4>
            <ul className="space-y-2.5">
              {['Privacidad', 'Terminos', 'Cookies'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#5A6680] hover:text-[#e1ff00] transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#1E2535] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#3D4E68] font-mono">&copy; 2026 DevConnect — Construido por <span className="text-[#5A6680]">Eddy Trejo</span></span>
          <span className="text-xs text-[#2A3347] font-mono">React 19 · Hono · tRPC · Drizzle · MySQL · GSAP</span>
        </div>
      </div>
    </footer>
  );
}
