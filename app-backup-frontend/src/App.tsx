import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './sections/Hero';
import Features from './sections/Features';
import DeveloperGrid from './sections/DeveloperGrid';
import FeedPreview from './sections/FeedPreview';
import CTASection from './sections/CTASection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import SearchOverlay from './components/SearchOverlay';
import ToastContainer from './components/ToastContainer';
import ScrollToTop from './components/ScrollToTop';
import CustomCursor from './components/CustomCursor';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';

gsap.registerPlugin(ScrollTrigger);

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        onComplete();
      },
    });
    tl.to('.loader-line', { scaleX: 1, duration: 0.8, ease: 'expo.inOut' })
      .to('.loader-container', { yPercent: -100, duration: 0.6, ease: 'expo.inOut', delay: 0.2 });
    return () => { tl.kill(); };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="loader-container fixed inset-0 z-[100] bg-[#000000] flex items-center justify-center">
      <div className="loader-line w-48 h-[2px] bg-[#e1ff00] origin-left" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const auth = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [isLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        auth.closeModal();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [auth]);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <CustomCursor />
      <Navbar
        user={auth.user}
        onLogin={auth.openLogin}
        onRegister={auth.openRegister}
        onLogout={() => { auth.logout(); addToast('Sesion cerrada', 'info'); }}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <AuthModal
        isOpen={auth.isOpen}
        mode={auth.mode}
        onClose={auth.closeModal}
        onLogin={(email, password) => {
          const ok = auth.login(email, password);
          if (ok) addToast('Bienvenido de vuelta', 'success');
          return ok;
        }}
        onRegister={(name, email, password) => {
          const ok = auth.register(name, email, password);
          if (ok) addToast('Cuenta creada exitosamente', 'success');
          return ok;
        }}
        onSwitchMode={() => auth.setMode(auth.mode === 'login' ? 'register' : 'login')}
      />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ScrollToTop />

      <div className="relative bg-[#050507]" style={{ cursor: 'none' }}>
        <Hero onRegister={auth.openRegister} onLogin={auth.openLogin} />
        <Features />
        <DeveloperGrid />
        <FeedPreview addToast={addToast} />
        <CTASection onRegister={auth.openRegister} />
        <Footer />
      </div>
    </>
  );
}
