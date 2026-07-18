import { useState } from 'react';
import { X, Repeat2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Post } from './types';

interface QuoteModalProps {
  post: Post;
  onClose: () => void;
  onSubmit: (quoteText: string) => void;
  isLoading?: boolean;
}

export default function QuoteModal({ post, onClose, onSubmit, isLoading = false }: QuoteModalProps) {
  const [text, setText] = useState('');

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#000]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#1E2535] overflow-hidden shadow-2xl"
        style={{ background: '#0D1220' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2535]">
          <div className="flex items-center gap-2">
            <Repeat2 size={16} className="text-[#22C55E]" />
            <span className="text-[#f3f2f2] font-semibold text-sm">Citar publicación</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A6680] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quote textarea */}
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="Escribe tu comentario sobre esta publicación..."
            rows={3}
            className="w-full bg-[#080D18] border border-[#1E2535] rounded-xl px-4 py-3 text-[#C9D5E8] text-sm placeholder-[#3D4E68] resize-none outline-none focus:border-[#22C55E]/50 transition-colors"
          />

          {/* Original post preview */}
          <div className="rounded-xl border border-[#1E2535] p-3.5 bg-[#080B14]">
            <div className="flex items-center gap-2 mb-2">
              {post.authorAvatar ? (
                <img src={post.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-[10px]">
                  {(post.authorName ?? 'D').charAt(0)}
                </div>
              )}
              <span className="text-[#f3f2f2] font-semibold text-xs">{post.authorName ?? 'Developer'}</span>
              <span className="text-[#3D4E68] text-xs">·</span>
              <span className="text-[#3D4E68] text-xs font-mono">{formatDate(post.createdAt)}</span>
            </div>
            <p className="text-[#8B9AB0] text-xs leading-relaxed line-clamp-3">
              {post.content}
            </p>
            {post.code && (
              <div className="mt-2 bg-[#060911] rounded-lg px-3 py-2 border border-[#1E2535]">
                <span className="text-[#3D4E68] text-[10px] font-mono">{post.codeLanguage ?? 'code'} · código adjunto</span>
              </div>
            )}
            {post.mediaUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-[#1E2535]">
                {post.mediaType === 'video' ? (
                  <div className="bg-[#060911] px-3 py-2">
                    <span className="text-[#3D4E68] text-[10px] font-mono">video adjunto</span>
                  </div>
                ) : (
                  <img src={post.mediaUrl} alt="" className="w-full max-h-24 object-cover" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#1E2535]">
          <span className="text-[#3D4E68] text-xs font-mono">
            {text.length}/1000
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#8B9AB0] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{
                background: text.trim() ? '#22C55E' : '#1E2535',
                color: text.trim() ? '#050507' : '#5A6680',
              }}
            >
              {isLoading ? 'Compartiendo...' : 'Compartir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
