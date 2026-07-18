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

interface CreatePostFormProps {
  user: User;
  onClose: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function CreatePostForm({ user, onClose, addToast }: CreatePostFormProps) {
  const [content,    setContent]    = useState('');
  const [code,       setCode]       = useState('');
  const [lang,       setLang]       = useState('typescript');
  const [showCode,   setShowCode]   = useState(false);
  const [mediaFile,  setMediaFile]  = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType,  setMediaType]  = useState<'image' | 'video' | null>(null);
  const [uploading,  setUploading]  = useState(false);
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

  return (
    <div className="border-b border-[#2A3347] p-4">
      <div className="flex items-start gap-3">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold shrink-0">
            {user.name?.charAt(0) ?? 'U'}
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Que estas codificando hoy?"
            className="w-full bg-transparent text-[#f3f2f2] resize-none outline-none min-h-[100px] text-[17px] placeholder:text-[#5A6680]"
            maxLength={2000}
            autoFocus
          />
          <div className="text-right text-xs text-[#5A6680] mb-2">{content.length}/2000</div>

          {/* Code block */}
          {showCode && (
            <div className="mb-3 p-3 bg-[#0D1117] rounded-lg border border-[#2A3347]">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-[#151A27] text-[#8B9AB0] text-sm rounded px-2 py-1 mb-2 outline-none border border-[#2A3347]"
              >
                {CODE_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Pega tu codigo aqui..."
                className="w-full bg-[#0B0F17] text-[#A5D6FF] font-mono text-sm p-3 rounded resize-none outline-none min-h-[120px]"
                spellCheck={false}
              />
            </div>
          )}

          {/* Media preview */}
          {mediaPreview && mediaType && (
            <div className="relative mb-3 rounded-xl overflow-hidden border border-[#2A3347]">
              {mediaType === 'image' ? (
                <img
                  src={mediaPreview}
                  alt=""
                  className="w-full max-h-80 object-contain bg-[#060911]"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full max-h-80 bg-[#060911]"
                />
              )}
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-[#f3f2f2] hover:bg-black/90 transition-colors"
              >
                <X size={14} />
              </button>
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-[#f3f2f2] text-sm">
                  <Loader2 size={20} className="animate-spin" />
                  Subiendo...
                </div>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2A3347]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCode(!showCode)}
                title="Agregar código"
                className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                  showCode ? 'text-[#3B82F6] bg-[#3B82F6]/10' : 'text-[#3B82F6] hover:bg-[#3B82F6]/10'
                }`}
              >
                <Code2 size={20} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Agregar foto o video"
                disabled={!!mediaFile}
                className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                  mediaFile
                    ? 'text-[#e1ff00] bg-[#e1ff00]/10'
                    : 'text-[#e1ff00] hover:bg-[#e1ff00]/10'
                }`}
              >
                {mediaType === 'video' ? <Film size={20} /> : <ImagePlus size={20} />}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#5A6680] hover:text-[#f3f2f2] rounded-full"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isPending}
                className="bg-[#e1ff00] text-[#050507] font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#d4e600] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {uploading ? 'Subiendo...' : createPost.isPending ? 'Publicando...' : 'Postear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
