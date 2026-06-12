import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  user: { name: string; username: string; avatar: string } | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onSearchOpen: () => void;
}

export default function Navbar({ user, onLogin, onRegister, onLogout, onSearchOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#hero' },
    { label: 'Caracteristicas', href: '#features' },
    { label: 'Comunidad', href: '#community' },
    { label: 'Feed', href: '#feed' },
  ];

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#050507]/90 backdrop-blur-md border-b border-[#2A3347]/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => scrollTo('#hero')} className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="DevConnect" className="w-8 h-8 object-contain" />
            <span className="text-[#f3f2f2] font-bold text-lg tracking-tight hidden sm:inline">DevConnect</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-sm text-[#8B9AB0] hover:text-[#f3f2f2] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onSearchOpen}
              className="w-9 h-9 flex items-center justify-center text-[#5A6680] hover:text-[#e1ff00] hover:bg-[#1a1a1e] transition-colors border border-transparent hover:border-[#2A3347]"
            >
              <Search size={16} />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-[#2A3347]" />
                  <span className="text-sm text-[#f3f2f2]">{user.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="w-9 h-9 flex items-center justify-center text-[#5A6680] hover:text-[#EF4444] hover:bg-[#1a1a1e] transition-colors border border-transparent hover:border-[#2A3347]"
                  title="Cerrar sesion"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogin}
                  className="text-sm text-[#8B9AB0] hover:text-[#f3f2f2] transition-colors px-4 py-2"
                >
                  Iniciar sesion
                </button>
                <button
                  onClick={onRegister}
                  className="text-sm bg-[#e1ff00] text-[#050507] font-bold px-4 py-2 hover:bg-[#f3f2f2] transition-colors"
                >
                  Unirse
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onSearchOpen}
              className="w-9 h-9 flex items-center justify-center text-[#5A6680]"
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 flex items-center justify-center text-[#f3f2f2]"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#050507]/98 backdrop-blur-lg md:hidden pt-20">
          <div className="flex flex-col items-center gap-6 p-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-xl text-[#f3f2f2] font-medium"
              >
                {link.label}
              </button>
            ))}

            <div className="w-full border-t border-[#2A3347] mt-4 pt-6 flex flex-col items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="text-left">
                      <div className="text-[#f3f2f2] font-medium">{user.name}</div>
                      <div className="text-[#5A6680] text-sm">{user.username}</div>
                    </div>
                  </div>
                  <button onClick={onLogout} className="text-[#EF4444] font-medium">Cerrar sesion</button>
                </>
              ) : (
                <>
                  <button onClick={() => { onLogin(); setMobileOpen(false); }} className="text-[#8B9AB0] text-lg">
                    Iniciar sesion
                  </button>
                  <button
                    onClick={() => { onRegister(); setMobileOpen(false); }}
                    className="bg-[#e1ff00] text-[#050507] font-bold px-8 py-3 w-full text-center"
                  >
                    Unirse
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
