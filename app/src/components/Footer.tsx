import { Github, ExternalLink } from 'lucide-react';

const PRODUCT_LINKS = ['Feed', 'Perfiles', 'Comentarios', 'Explorar', 'Guardados'];
const LEGAL_LINKS   = ['Privacidad', 'Términos', 'Cookies'];

export default function Footer() {
  return (
    <footer className="relative bg-[#050507] overflow-hidden">
      {/* BG grid texture */}
      <div className="absolute inset-0 opacity-[0.014]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,#e1ff00 0,#e1ff00 1px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,#e1ff00 0,#e1ff00 1px,transparent 1px,transparent 80px)',
      }} />

      {/* Top glow border */}
      <div className="h-px w-full" style={{
        background: 'linear-gradient(90deg,transparent 0%,#e1ff00 35%,rgba(225,255,0,0.35) 65%,transparent 100%)',
      }} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* EDITORIAL SIGN-OFF */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-16 pb-14 items-center border-b border-[#1E2535]">

          {/* Left: manifesto */}
          <div>
            <p className="font-mono text-[10px] text-[#3D4E68] tracking-[0.25em] mb-6">// DEVCONNECT — 2026</p>
            <h2
              className="text-[#f3f2f2] font-black leading-[1.05] mb-8"
              style={{ fontSize: 'clamp(26px, 3.2vw, 48px)', letterSpacing: '-1.5px' }}
            >
              Hecha en las noches<br />
              por un solo dev.<br />
              <span className="text-[#e1ff00]">Para todos los devs.</span>
            </h2>
            <a
              href="https://github.com/eddyjosuetr-coder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#5A6680] hover:text-[#e1ff00] transition-colors duration-200 group cursor-pointer"
            >
              <Github size={13} />
              <span className="group-hover:underline">github.com/eddyjosuetr-coder</span>
              <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            </a>
          </div>

          {/* Right: logo */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/images/logo-connombre.png"
              alt="DevConnect"
              className="w-[200px] md:w-[240px] object-contain select-none"
              style={{
                filter: 'drop-shadow(0 0 28px rgba(225,255,0,0.4)) drop-shadow(0 0 60px rgba(225,255,0,0.14))',
              }}
            />
          </div>
        </div>

        {/* NAVIGATION ROW */}
        <div className="py-7 border-b border-[#1E2535] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

          {/* Product links */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            <span className="font-mono text-[10px] text-[#3D4E68] tracking-widest uppercase mr-2">Producto</span>
            {PRODUCT_LINKS.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-sm text-[#5A6680] hover:text-[#e1ff00] cursor-pointer transition-colors duration-150">
                  {item}
                </span>
                {i < PRODUCT_LINKS.length - 1 && (
                  <span className="text-[#2A3347] text-xs select-none">·</span>
                )}
              </span>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {LEGAL_LINKS.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                <a href="#" className="text-sm text-[#5A6680] hover:text-[#e1ff00] transition-colors duration-150">
                  {item}
                </a>
                {i < LEGAL_LINKS.length - 1 && (
                  <span className="text-[#2A3347] text-xs select-none">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* COPYRIGHT BAR */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="text-[11px] text-[#3D4E68] font-mono">© 2026 DevConnect</span>
            <span className="text-[#2A3347] text-xs select-none">—</span>
            <span className="text-[11px] font-mono text-[#3D4E68]">
              Construido por{' '}
              <span className="text-[#5A6680] hover:text-[#e1ff00] transition-colors cursor-default">Eddy Trejo</span>
            </span>
            <span className="text-[11px] text-[#3D4E68] select-none">🇻🇪</span>
          </div>
          <span className="text-[10px] text-[#2A3347] font-mono tracking-wide whitespace-nowrap">
            React 19 · Hono · tRPC · Drizzle · MySQL · GSAP
          </span>
        </div>

      </div>
    </footer>
  );
}
