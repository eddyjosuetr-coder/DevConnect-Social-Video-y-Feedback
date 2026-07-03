import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Code2, Terminal, Zap, Globe, Users, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

const HAS_OAUTH = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

function getOAuthUrl() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

export default function Login() {
  const navigate = useNavigate();
  const illRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Floating icons animation
    const icons = gsap.utils.toArray<HTMLElement>('.floating-icon');
    icons.forEach((icon, i) => {
      gsap.to(icon, {
        y: `random(-20, 20)`,
        x: `random(-15, 15)`,
        rotation: `random(-10, 10)`,
        duration: `random(2, 4)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3,
      });
    });

    // Entrance animations
    gsap.fromTo('.login-illustration', { opacity: 0, scale: 0.9, x: -50 }, { opacity: 1, scale: 1, x: 0, duration: 1, ease: 'expo.out', delay: 0.2 });
    gsap.fromTo('.login-form-panel', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1, ease: 'expo.out', delay: 0.4 });
    gsap.fromTo('.login-stat-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1, delay: 0.8 });
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] flex">
      {/* ── Left Side: Illustration + Stats ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e1ff00]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00ffff]/5 rounded-full blur-[100px]" />

        {/* Floating icons */}
        <div ref={floatingRef} className="absolute inset-0 pointer-events-none">
          <div className="floating-icon absolute top-[15%] left-[10%] text-[#e1ff00]/20"><Code2 size={32} /></div>
          <div className="floating-icon absolute top-[25%] right-[15%] text-[#00ffff]/20"><Terminal size={28} /></div>
          <div className="floating-icon absolute bottom-[20%] left-[15%] text-[#ff1493]/20"><Zap size={24} /></div>
          <div className="floating-icon absolute top-[60%] right-[10%] text-[#e1ff00]/20"><Globe size={26} /></div>
          <div className="floating-icon absolute bottom-[35%] right-[25%] text-[#00ffff]/20"><Users size={22} /></div>
        </div>

        <div ref={illRef} className="login-illustration relative z-10 max-w-md w-full opacity-0">
          {/* Illustration */}
          <div className="relative mb-10">
            <img src="/images/login-illustration.jpg" alt="Developer workspace" className="w-full rounded-lg border border-[#2A3347]/50" />
            {/* Terminal overlay */}
            <div className="absolute -bottom-6 -right-6 bg-[#151A27] border border-[#2A3347] p-4 font-mono text-xs">
              <div className="text-[#5A6680] mb-1">$ npm run dev</div>
              <div className="text-[#22C55E]">Starting DevConnect...</div>
              <div className="text-[#e1ff00]">Ready on localhost:3000</div>
              <div className="text-[#00ffff] mt-1">50,000+ devs online</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            {[
              { icon: Users, value: '50K+', label: 'Devs activos' },
              { icon: Code2, value: '12K+', label: 'Proyectos' },
              { icon: Zap, value: '3.2K+', label: 'Colabs' },
            ].map((s) => (
              <div key={s.label} className="login-stat-item text-center opacity-0">
                <s.icon size={18} className="text-[#e1ff00] mx-auto mb-2" />
                <div className="text-[#f3f2f2] font-bold font-mono text-lg">{s.value}</div>
                <div className="text-[#5A6680] text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="login-stat-item mt-8 border-l-2 border-[#e1ff00] pl-4 opacity-0">
            <p className="text-[#8B9AB0] text-sm italic leading-relaxed">"DevConnect me ayudo a encontrar colaboradores para mi proyecto open source. Ahora tenemos 200+ contribuidores."</p>
            <div className="flex items-center gap-2 mt-3">
              <img src="/images/profile3.jpg" alt="User" className="w-8 h-8 rounded-full object-cover" />
              <div><div className="text-[#f3f2f2] text-sm font-medium">Miguel Rios</div><div className="text-[#5A6680] text-xs">Full Stack Developer</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Side: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#5A6680] hover:text-[#e1ff00] transition-colors mb-10 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Volver al inicio</span>
          </button>

          <div ref={formRef} className="login-form-panel opacity-0">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/images/logo-solocara.png"
                alt="DevConnect"
                className="w-12 h-12 object-contain"
                style={{ filter: 'drop-shadow(0 0 10px rgba(225,255,0,0.7))' }}
              />
              <div>
                <h1 className="text-2xl font-bold text-[#f3f2f2]">DevConnect</h1>
                <p className="text-[#5A6680] text-sm">La red social para desarrolladores</p>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-medium text-[#f3f2f2] mt-8 mb-2" style={{ letterSpacing: '-1px' }}>Bienvenido de vuelta</h2>
            <p className="text-[#5A6680] mb-8">Inicia sesion para acceder a tu feed y conectar con otros devs.</p>

            {/* OAuth Button — only shown when OAuth is configured */}
            {HAS_OAUTH && (
              <button
                onClick={() => { window.location.href = getOAuthUrl(); }}
                className="w-full bg-[#e1ff00] text-[#050507] font-bold py-4 px-6 flex items-center justify-center gap-3 hover:bg-[#f3f2f2] transition-all group text-sm tracking-wide"
              >
                <span>Continuar con Google</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-[#2A3347]" />
              <span className="text-[#5A6680] text-xs font-mono">O</span>
              <div className="flex-1 h-px bg-[#2A3347]" />
            </div>

            {/* Demo accounts */}
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#5A6680] tracking-wider mb-3">CUENTAS DE PRUEBA</p>
              {[
                { name: 'Alejandro Marin', role: 'Frontend Dev', avatar: '/images/profile1.jpg' },
                { name: 'Sofia Jimenez', role: 'UI Engineer', avatar: '/images/profile2.jpg' },
              ].map((demo) => (
                <button
                  key={demo.name}
                  onClick={() => {
                    if (HAS_OAUTH) window.location.href = getOAuthUrl();
                    else window.location.href = '/api/dev-login';
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-[#151A27] border border-[#2A3347] hover:border-[#e1ff00]/40 transition-all group text-left"
                >
                  <img src={demo.avatar} alt={demo.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="text-[#f3f2f2] text-sm font-medium group-hover:text-[#e1ff00] transition-colors">{demo.name}</div>
                    <div className="text-[#5A6680] text-xs">{demo.role}</div>
                  </div>
                  <ChevronRight size={16} className="text-[#5A6680] group-hover:text-[#e1ff00] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            {/* Demo login — visible when OAuth is not configured */}
            {!HAS_OAUTH && (
              <a
                href="/api/dev-login"
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-[#e1ff00]/40 text-[#e1ff00] font-mono text-xs hover:bg-[#e1ff00]/5 transition-colors"
              >
                <Terminal size={13} />
                DEMO LOGIN — entrar como usuario de prueba
              </a>
            )}

            {/* Info */}
            <div className="mt-8 p-4 bg-[#0F131D] border border-[#2A3347]/50">
              <div className="flex items-start gap-3">
                <Terminal size={16} className="text-[#00ffff] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#8B9AB0] text-xs leading-relaxed">
                    Al iniciar sesion, aceptas nuestros <span className="text-[#e1ff00] cursor-pointer">Terminos</span> y{' '}
                    <span className="text-[#e1ff00] cursor-pointer">Politica de Privacidad</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
