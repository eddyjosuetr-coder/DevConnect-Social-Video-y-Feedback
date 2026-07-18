import { useState, useRef, useCallback } from 'react';
import { Code2, ImagePlus, X, Loader2, Film } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { uploadMedia, cloudinaryConfigured } from '@/lib/cloudinary';
import type { Toast } from '@/hooks/useToast';
import type { User } from '@db/schema';

const CODE_LANGUAGES = [
  'typescript', 'javascript', 'python', 'go', 'rust',
  'java', 'sql', 'bash', 'json', 'yaml', 'css', 'html', 'tsx', 'dockerfile',
];

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 100;
const MAX_CHARS = 2000;

function CharRing({ count, max }: { count: number; max: number }) {
  const r = 10;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(count / max, 1);
  const remaining = max - count;
  const nearLimit = remaining <= 200;
  const danger = remaining <= 50;
  const stroke = danger ? '#EF4444' : nearLimit ? '#FEBC2E' : '#e1ff00';

  return (
    <svg width="28" height="28" className="shrink-0" aria-label={`${remaining} caracteres restantes`}>
      <circle cx="14" cy="14" r={r} fill="none" stroke="#1E2535" strokeWidth="2.5" />
      <circle
        cx="14" cy="14" r={r} fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 14 14)"
        style={{ transition: 'stroke-dashoffset 0.15s ease, stroke 0.3s ease' }}
      />
      {nearLimit && (
        <text
          x="14" y="18.5" textAnchor="middle"
          fontSize="7.5" fill={stroke}
          fontFamily="monospace" fontWeight="700"
        >
          {remaining}
        </text>
      )}
    </svg>
  );
}

interface ToolBtnProps {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  disabled?: boolean;
  title?: string;
}

function ToolBtn({ children, onClick, active = false, activeColor = '#e1ff00', disabled, title }: ToolBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e1ff00]/40"
      style={{
        color: active ? activeColor : '#3D4E68',
        backgroundColor: active ? `${activeColor}1A` : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          const el = e.currentTarget as HTMLElement;
          el.style.color = activeColor;
          el.style.backgroundColor = `${activeColor}12`;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          const el = e.currentTarget as HTMLElement;
          el.style.color = '#3D4E68';
          el.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}

interface CreatePostFormProps {
  user: User;
  onClose: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function CreatePostForm({ user, onClose, addToast }: CreatePostFormProps) {
  const [content,      setContent]      = useState('');
  const [code,         setCode]         = useState('');
  const [lang,         setLang]         = useState('typescript');
  const [showCode,     setShowCode]     = useState(false);
  const [mediaFile,    setMediaFile]    = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType,    setMediaType]    = useState<'image' | 'video' | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [focused,      setFocused]      = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const createPost = trpc.posts.create.useMutation();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      addToast('Solo se permiten imágenes o videos', 'error');
      return;
    }

    const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (file.size > maxMB * 1024 * 1024) {
      addToast(`Archivo muy grande (máx ${maxMB}MB)`, 'error');
      return;
    }

    const preview = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview(preview);
    setMediaType(isVideo ? 'video' : 'image');
    e.target.value = '';
  }, [addToast]);

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    let uploadedUrl: string | undefined;
    let uploadedType: 'image' | 'video' | undefined;

    if (mediaFile) {
      if (!cloudinaryConfigured()) {
        addToast('Cloudinary no configurado — contacta al admin', 'error');
        return;
      }
      try {
        setUploading(true);
        const result = await uploadMedia(mediaFile);
        uploadedUrl  = result.url;
        uploadedType = result.type;
      } catch (err) {
        addToast(err instanceof Error ? err.message : 'Error al subir archivo', 'error');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    createPost.mutate(
      {
        content,
        code: code || undefined,
        codeLanguage: lang,
        mediaUrl: uploadedUrl,
        mediaType: uploadedType,
      },
      {
        onSuccess: (data) => {
          utils.posts.list.setData(undefined, (old) => {
            const newPost = {
              id: data.id,
              content,
              code: code || null,
              codeLanguage: lang,
              tags: null,
              mediaUrl: uploadedUrl ?? null,
              mediaType: uploadedType ?? null,
              likesCount: 0,
              commentsCount: 0,
              repostsCount: 0,
              createdAt: new Date(),
              authorId: user.id,
              authorName: user.name,
              authorAvatar: user.avatar,
            };
            return old ? [newPost, ...old] : [newPost];
          });
          if (mediaPreview) URL.revokeObjectURL(mediaPreview);
          addToast('Post publicado!', 'success');
          onClose();
        },
        onError: (err) => {
          addToast(`Error al publicar: ${err.message}`, 'error');
        },
      }
    );
  };

  const isPending = uploading || createPost.isPending;
  const canPost = content.trim().length > 0 && !isPending;

  return (
    <>
      <style>{`
        @keyframes dc-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dc-glow-pulse {
          0%, 100% { box-shadow: 0 0 14px rgba(225,255,0,0.15); }
          50%       { box-shadow: 0 0 28px rgba(225,255,0,0.32); }
        }
        .dc-enter   { animation: dc-slide-down 0.2s ease forwards; }
        .dc-glowing { animation: dc-glow-pulse 2.8s ease-in-out infinite; }
      `}</style>

      <div
        className="relative border-b border-[#1E2535] transition-all duration-300"
        style={{
          background: focused
            ? 'linear-gradient(180deg, rgba(10,14,24,0.9) 0%, rgba(6,9,17,0.6) 100%)'
            : 'transparent',
        }}
      >
        {/* Vertical accent rail — activates on focus */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-500"
          style={{
            background: 'linear-gradient(to bottom, transparent 5%, #e1ff00 40%, #e1ff00 60%, transparent 95%)',
            opacity: focused ? 0.75 : 0,
            transform: `scaleY(${focused ? 1 : 0.3})`,
            transformOrigin: 'center',
          }}
        />

        <div className="p-4 pl-5">
          <div className="flex items-start gap-3">

            {/* Avatar */}
            <div className="relative shrink-0 mt-0.5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover transition-all duration-300"
                  style={{
                    outline: focused ? '2px solid rgba(225,255,0,0.35)' : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-sm">
                  {user.name?.charAt(0) ?? 'U'}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#060911]" />
            </div>

            <div className="flex-1 min-w-0">

              {/* Compose textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="¿Qué estás codificando hoy?"
                className="w-full bg-transparent text-[#f3f2f2] resize-none outline-none text-[17px] leading-relaxed placeholder:text-[#2A3347] min-h-[88px] transition-colors duration-200"
                maxLength={MAX_CHARS}
                autoFocus
              />

              {/* Code block */}
              {showCode && (
                <div className="dc-enter mb-3 rounded-xl overflow-hidden border border-[#1E2535]">
                  <div className="bg-[#0B0E17] px-3 py-2.5 flex items-center gap-3 border-b border-[#1E2535]">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    </div>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      className="bg-transparent text-[#5A6680] text-xs font-mono outline-none cursor-pointer hover:text-[#8B9AB0] transition-colors"
                    >
                      {CODE_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// pega tu código aquí..."
                    className="w-full bg-[#060911] text-[#A5D6FF] font-mono text-sm p-4 resize-none outline-none min-h-[120px] placeholder:text-[#1E2535]"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Media preview */}
              {mediaPreview && mediaType && (
                <div className="dc-enter relative mb-3 rounded-xl overflow-hidden border border-[#1E2535] bg-[#060911]">
                  {mediaType === 'image' ? (
                    <img src={mediaPreview} alt="" className="w-full max-h-72 object-contain" />
                  ) : (
                    <video src={mediaPreview} controls className="w-full max-h-72" />
                  )}
                  <button
                    onClick={removeMedia}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform border border-white/10"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                  >
                    <X size={13} />
                  </button>
                  {uploading && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                      style={{ background: 'rgba(6,9,17,0.82)', backdropFilter: 'blur(6px)' }}
                    >
                      <Loader2 size={26} className="animate-spin text-[#e1ff00]" />
                      <span className="text-[#e1ff00] text-xs font-mono tracking-widest uppercase">
                        Subiendo
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1E2535] mt-1">

                {/* Left tools */}
                <div className="flex items-center gap-0.5">
                  <ToolBtn
                    onClick={() => setShowCode(!showCode)}
                    active={showCode}
                    activeColor="#3B82F6"
                    title="Agregar código"
                  >
                    <Code2 size={18} />
                  </ToolBtn>
                  <ToolBtn
                    onClick={() => fileInputRef.current?.click()}
                    active={!!mediaFile}
                    activeColor="#e1ff00"
                    disabled={!!mediaFile}
                    title="Agregar imagen o video"
                  >
                    {mediaType === 'video' ? <Film size={18} /> : <ImagePlus size={18} />}
                  </ToolBtn>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Right controls */}
                <div className="flex items-center gap-3">
                  <CharRing count={content.length} max={MAX_CHARS} />

                  <div className="w-px h-5 bg-[#1E2535]" />

                  <button
                    onClick={onClose}
                    className="text-sm text-[#3D4E68] hover:text-[#8B9AB0] transition-colors px-2 py-1 rounded-lg hover:bg-[#1E2535] focus:outline-none"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={!canPost}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e1ff00]/50 ${canPost ? 'dc-glowing' : ''}`}
                    style={{
                      background: canPost
                        ? 'linear-gradient(135deg, #e1ff00 0%, #c8e000 100%)'
                        : '#0D1117',
                      color: canPost ? '#050507' : '#3D4E68',
                      border: canPost ? 'none' : '1px solid #1E2535',
                    }}
                  >
                    {isPending && <Loader2 size={13} className="animate-spin" />}
                    <span>
                      {uploading
                        ? 'Subiendo...'
                        : createPost.isPending
                          ? 'Publicando...'
                          : 'Postear'}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
