import { useState } from 'react';
import { X, Code2, Loader2 } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import type { Post } from './types';
import type { Toast } from '@/hooks/useToast';

const CODE_LANGUAGES = [
  'typescript', 'javascript', 'python', 'go', 'rust',
  'java', 'sql', 'bash', 'json', 'yaml', 'css', 'html', 'tsx', 'dockerfile',
];

const MAX_CHARS = 2000;

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSaved: (updated: Pick<Post, 'content' | 'code' | 'codeLanguage' | 'tags'>) => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function EditPostModal({ post, onClose, onSaved, addToast }: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [code, setCode] = useState(post.code ?? '');
  const [lang, setLang] = useState(post.codeLanguage ?? 'typescript');
  const [tags, setTags] = useState(post.tags ?? '');
  const [showCode, setShowCode] = useState(!!post.code);

  const updatePost = trpc.posts.update.useMutation();

  const remaining = MAX_CHARS - content.length;
  const danger = remaining <= 50;
  const nearLimit = remaining <= 200;
  const ringColor = danger ? '#EF4444' : nearLimit ? '#FEBC2E' : '#e1ff00';

  function handleSave() {
    const trimmed = content.trim();
    if (!trimmed) return;

    updatePost.mutate(
      {
        postId: post.id,
        content: trimmed,
        code: showCode && code.trim() ? code : null,
        codeLanguage: showCode && code.trim() ? lang : null,
        tags: tags.trim() || null,
      },
      {
        onSuccess: () => {
          onSaved({
            content: trimmed,
            code: showCode && code.trim() ? code : null,
            codeLanguage: showCode && code.trim() ? lang : null,
            tags: tags.trim() || null,
          });
          addToast('Post actualizado', 'success');
          onClose();
        },
        onError: (err) => addToast(`Error: ${err.message}`, 'error'),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl rounded-2xl border border-[#1E2535] shadow-2xl flex flex-col"
        style={{ background: '#0D1220', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2535] shrink-0">
          <span className="text-[#f3f2f2] font-semibold text-sm">Editar publicación</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A6680] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Content */}
          <div className="relative">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARS}
              rows={5}
              className="w-full bg-[#080D18] border border-[#1E2535] focus:border-[#e1ff00]/40 rounded-xl px-4 py-3 text-[#f3f2f2] text-[15px] leading-relaxed placeholder-[#2A3347] resize-none outline-none transition-colors"
              placeholder="¿Qué estás codificando hoy?"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
              <span className="text-xs font-mono" style={{ color: ringColor }}>
                {remaining <= 200 ? remaining : ''}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Etiquetas: react, typescript, python..."
              className="w-full bg-[#080D18] border border-[#1E2535] focus:border-[#3B82F6]/40 rounded-xl px-4 py-2.5 text-sm text-[#C9D5E8] placeholder-[#3D4E68] outline-none transition-colors"
            />
          </div>

          {/* Code toggle */}
          <button
            onClick={() => setShowCode((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: showCode ? '#3B82F6' : '#5A6680' }}
          >
            <Code2 size={15} />
            {showCode ? 'Quitar bloque de código' : 'Agregar / editar código'}
          </button>

          {showCode && (
            <div className="rounded-xl overflow-hidden border border-[#1E2535]">
              <div className="bg-[#0B0E17] px-3 py-2.5 flex items-center gap-3 border-b border-[#1E2535]">
                <div className="flex gap-1.5">
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

          {/* Media (read-only note) */}
          {post.mediaUrl && (
            <p className="text-xs text-[#3D4E68] font-mono">
              * El media adjunto no se puede cambiar al editar.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#1E2535] shrink-0">
          <span className="text-xs font-mono" style={{ color: ringColor }}>
            {content.length}/{MAX_CHARS}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#8B9AB0] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || updatePost.isPending}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{
                background: content.trim() ? '#e1ff00' : '#1E2535',
                color: content.trim() ? '#050507' : '#5A6680',
              }}
            >
              {updatePost.isPending ? (
                <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" />Guardando...</span>
              ) : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
