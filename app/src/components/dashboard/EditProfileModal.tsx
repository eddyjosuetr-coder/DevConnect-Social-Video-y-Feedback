import { useState, useRef, useCallback } from 'react';
import { X, Camera, Loader2, Globe, Github, MapPin } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import type { User } from '@db/schema';
import type { Toast } from '@/hooks/useToast';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

const MAX_BIO_CHARS = 300;

function compressImage(file: File, maxPx: number, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type ExtendedUser = User & { website?: string | null; githubUrl?: string | null; location?: string | null; banner?: string | null };

export default function EditProfileModal({ user, onClose, addToast }: EditProfileModalProps) {
  const extUser = user as ExtendedUser;
  const [name,          setName]          = useState(extUser.name      ?? '');
  const [bio,           setBio]           = useState(extUser.bio       ?? '');
  const [website,       setWebsite]       = useState(extUser.website   ?? '');
  const [githubUrl,     setGithubUrl]     = useState(extUser.githubUrl ?? '');
  const [location,      setLocation]      = useState(extUser.location  ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(extUser.avatar ?? null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(extUser.banner ?? null);
  const [newAvatarData, setNewAvatarData] = useState<string | undefined>(undefined);
  const [newBannerData, setNewBannerData] = useState<string | undefined>(undefined);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const mutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      addToast('Perfil actualizado', 'success');
      onClose();
    },
    onError: () => {
      addToast('Error al actualizar el perfil', 'error');
    },
  });

  const handleImageFile = useCallback(async (
    file: File,
    maxPx: number,
    setPreview: (v: string) => void,
    setData: (v: string) => void,
  ) => {
    if (!file.type.startsWith('image/')) {
      addToast('Solo se permiten imágenes', 'error');
      return;
    }
    try {
      const compressed = await compressImage(file, maxPx);
      setPreview(compressed);
      setData(compressed);
    } catch {
      addToast('Error al procesar la imagen', 'error');
    }
  }, [addToast]);

  const handleSave = () => {
    if (!name.trim()) {
      addToast('El nombre no puede estar vacío', 'error');
      return;
    }
    mutation.mutate({
      name:      name.trim(),
      bio:       bio.trim() || undefined,
      avatar:    newAvatarData,
      banner:    newBannerData,
      website:   website.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      location:  location.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#0D1117] border border-[#2A3347] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3347]">
          <h2 className="text-[#f3f2f2] font-bold text-lg">Editar perfil</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#5A6680] hover:text-[#f3f2f2] rounded-full hover:bg-[#1E2535] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Banner */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6680] uppercase tracking-wider mb-1.5">
              Portada
            </label>
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="relative group w-full h-28 rounded-xl overflow-hidden block"
              type="button"
              title="Cambiar portada"
            >
              {bannerPreview ? (
                <img src={bannerPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(135deg, #0A1020 0%, #111827 50%, #0A0E18 100%)',
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(225,255,0,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 40%)',
                  }}
                />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <div className="flex items-center gap-2 text-[#f3f2f2] text-sm font-medium">
                  <Camera size={18} />
                  <span>Cambiar portada</span>
                </div>
              </div>
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file, 1200, setBannerPreview, setNewBannerData);
                e.target.value = '';
              }}
            />
          </div>

          {/* Avatar */}
          <div className="flex justify-center">
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="relative group cursor-pointer"
              title="Cambiar foto de perfil"
              type="button"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#2A3347] group-hover:border-[#e1ff00]/40 transition-colors"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-4xl border-4 border-[#2A3347]">
                  {name.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={22} className="text-[#f3f2f2]" />
              </div>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file, 400, setAvatarPreview, setNewAvatarData);
                e.target.value = '';
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6680] uppercase tracking-wider mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              placeholder="Tu nombre"
              className="w-full bg-[#060911] border border-[#2A3347] focus:border-[#e1ff00]/50 text-[#f3f2f2] px-4 py-2.5 rounded-xl text-sm outline-none placeholder:text-[#3A4660] transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#5A6680] uppercase tracking-wider">
                Bio
              </label>
              <span className={`text-xs tabular-nums ${bio.length > MAX_BIO_CHARS - 30 ? 'text-[#EF4444]' : 'text-[#3A4660]'}`}>
                {bio.length}/{MAX_BIO_CHARS}
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_CHARS))}
              rows={3}
              placeholder="Cuéntanos algo sobre ti..."
              className="w-full bg-[#060911] border border-[#2A3347] focus:border-[#e1ff00]/50 text-[#f3f2f2] px-4 py-2.5 rounded-xl text-sm outline-none placeholder:text-[#3A4660] transition-colors resize-none"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6680] uppercase tracking-wider mb-1.5">
              Sitio web
            </label>
            <div className="relative">
              <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3A4660]" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                maxLength={255}
                placeholder="https://tu-sitio.com"
                className="w-full bg-[#060911] border border-[#2A3347] focus:border-[#e1ff00]/50 text-[#f3f2f2] pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none placeholder:text-[#3A4660] transition-colors"
              />
            </div>
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6680] uppercase tracking-wider mb-1.5">
              GitHub
            </label>
            <div className="relative">
              <Github size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3A4660]" />
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                maxLength={255}
                placeholder="github.com/tu-usuario"
                className="w-full bg-[#060911] border border-[#2A3347] focus:border-[#e1ff00]/50 text-[#f3f2f2] pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none placeholder:text-[#3A4660] transition-colors"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6680] uppercase tracking-wider mb-1.5">
              Ubicación
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3A4660]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
                placeholder="Ciudad, País"
                className="w-full bg-[#060911] border border-[#2A3347] focus:border-[#e1ff00]/50 text-[#f3f2f2] pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none placeholder:text-[#3A4660] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#2A3347] text-[#8B9AB0] text-sm font-semibold rounded-xl hover:bg-[#1E2535] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={mutation.isPending || !name.trim()}
            className="flex-1 px-4 py-2.5 bg-[#e1ff00] text-[#050507] text-sm font-bold rounded-xl hover:bg-[#f3f2f2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {mutation.isPending && <Loader2 size={15} className="animate-spin" />}
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
