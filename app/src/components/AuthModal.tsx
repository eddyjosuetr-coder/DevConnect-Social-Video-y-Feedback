import { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password: string) => boolean;
  onRegister: (name: string, email: string, password: string) => boolean;
  onSwitchMode: () => void;
}

export default function AuthModal({ isOpen, mode, onClose, onLogin, onRegister, onSwitchMode }: AuthModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (mode === 'register') {
        if (!name.trim()) { setError('El nombre es obligatorio'); setLoading(false); return; }
        if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres'); setLoading(false); return; }
        onRegister(name, email, password);
      } else {
        onLogin(email, password);
      }
      setName('');
      setEmail('');
      setPassword('');
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#151A27] border border-[#2A3347] w-full max-w-md p-8">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[#5A6680] hover:text-[#f3f2f2] transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-[#f3f2f2] mb-1">
          {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
        </h2>
        <p className="text-[#5A6680] text-sm mb-8">
          {mode === 'login' ? 'Inicia sesion para continuar' : 'Unete a la comunidad de desarrolladores'}
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm px-4 py-3 mb-6">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-[#5A6680] mb-2">NOMBRE COMPLETO</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6680]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-[#0F131D] border border-[#2A3347] text-[#f3f2f2] pl-10 pr-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#3A4460]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-[#5A6680] mb-2">EMAIL</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6680]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-[#0F131D] border border-[#2A3347] text-[#f3f2f2] pl-10 pr-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#3A4460]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#5A6680] mb-2">CONTRASENA</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6680]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="w-full bg-[#0F131D] border border-[#2A3347] text-[#f3f2f2] pl-10 pr-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#3A4460]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e1ff00] text-[#050507] font-bold py-3 hover:bg-[#f3f2f2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar Sesion' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-[#5A6680] mt-6">
          {mode === 'login' ? (
            <>
              No tienes cuenta?{' '}
              <button onClick={onSwitchMode} className="text-[#e1ff00] hover:underline">
                Registrate
              </button>
            </>
          ) : (
            <>
              Ya tienes cuenta?{' '}
              <button onClick={onSwitchMode} className="text-[#e1ff00] hover:underline">
                Inicia sesion
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
