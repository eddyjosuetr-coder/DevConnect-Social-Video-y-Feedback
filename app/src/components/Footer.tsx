export default function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-[#2A3347] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold text-[#f3f2f2] mb-3">DevConnect</h3>
            <p className="text-sm text-[#5A6680] leading-relaxed">
              La red profesional para desarrolladores. Conecta, colabora y construye.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-xs font-mono text-[#e1ff00] mb-4 tracking-wider">PRODUCTO</h4>
            <ul className="space-y-2.5">
              {['Feed', 'Perfiles', 'Mensajeria', 'Explorar', 'Notificaciones'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#5A6680] hover:text-[#e1ff00] transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-xs font-mono text-[#e1ff00] mb-4 tracking-wider">RECURSOS</h4>
            <ul className="space-y-2.5">
              {['API Docs', 'GitHub', 'Status', 'Changelog', 'Blog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#5A6680] hover:text-[#e1ff00] transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-xs font-mono text-[#e1ff00] mb-4 tracking-wider">EMPRESA</h4>
            <ul className="space-y-2.5">
              {['Nosotros', 'Careers', 'Contacto', 'Legal'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#5A6680] hover:text-[#e1ff00] transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#2A3347] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#5A6680] font-mono">&copy; 2026 DevConnect. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            {['Privacidad', 'Terminos', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-xs text-[#5A6680] font-mono hover:text-[#e1ff00] transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
