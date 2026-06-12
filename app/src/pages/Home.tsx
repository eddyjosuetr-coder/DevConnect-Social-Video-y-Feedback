import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import Navbar from '@/components/Navbar';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';
import Hero from '@/sections/Hero';
import Features from '@/sections/Features';
import DeveloperGrid from '@/sections/DeveloperGrid';
import FeedPreview from '@/sections/FeedPreview';
import CTASection from '@/sections/CTASection';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) navigate('/app');
  }, [isAuthenticated, navigate]);

  const goToLogin = () => navigate('/login');

  return (
    <div className="bg-[#050507]">
      <Navbar
        user={null}
        onLogin={goToLogin}
        onRegister={goToLogin}
        onLogout={() => {}}
        onSearchOpen={() => {}}
      />
      <ScrollToTop />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Hero onRegister={goToLogin} onLogin={goToLogin} />
      <Features />
      <DeveloperGrid />
      <FeedPreview addToast={addToast} />
      <CTASection onRegister={goToLogin} />
      <Footer />
    </div>
  );
}
