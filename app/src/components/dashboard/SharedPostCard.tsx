import { useNavigate } from 'react-router';
import { Repeat2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import type { Post } from './types';
import type { Toast } from '@/hooks/useToast';

const LANG_COLORS: Record<string, string> = {
  typescript: '#3178C6', javascript: '#F7DF1E', python: '#3776AB',
  rust: '#CE422B', go: '#00ADD8', java: '#ED8B00', css: '#264DE4',
  html: '#E34F26', bash: '#4EAA25', sql: '#CC2927', json: '#292929',
  yaml: '#CB171E', tsx: '#3178C6', dockerfile: '#2496ED',
};

interface SharedPostCardProps {
  repostId: number;
  repostCreatedAt: Date | string;
  quoteText: string | null;
  post: Post;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function SharedPostCard({
  repostCreatedAt,
  quoteText,
  post,
  addToast,
}: SharedPostCardProps) {
  const navigate = useNavigate();
  const [codeCopied, setCodeCopied] = useState(false);
  const langColor = LANG_COLORS[post.codeLanguage ?? ''] ?? '#5A6680';
  const codeLines = (post.code ?? '').split('\n');

  function handleCopyCode() {
    navigator.clipboard.writeText(post.code ?? '');
    setCodeCopied(true);
    addToast('Código copiado!', 'success');
    setTimeout(() => setCodeCopied(false), 2000);
  }

  return (
    <article
      className="border-b border-[#1E2535] p-5 hover:bg-[#080B12] transition-colors"
      style={{ borderLeft: '2px solid transparent' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = '#22C55E40'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent'; }}
    >
      {/* Repost header */}
      <div className="flex items-center gap-1.5 mb-3 text-xs text-[#5A6680]">
        <Repeat2 size={12} className="text-[#22C55E]" />
        <span className="text-[#22C55E] font-semibold">
          {quoteText ? 'Citó esta publicación' : 'Compartido'}
        </span>
        <span className="text-[#2A3347]">·</span>
        <span className="font-mono">{formatDate(repostCreatedAt)}</span>
      </div>

      {/* Quote text */}
      {quoteText && (
        <p className="text-[#C9D5E8] text-[15px] leading-relaxed whitespace-pre-wrap mb-3">
          {quoteText}
        </p>
      )}

      {/* Original post card (embedded) */}
      <div
        className="rounded-xl border border-[#1E2535] bg-[#08101F] overflow-hidden cursor-pointer hover:border-[#2A3347] transition-colors"
        onClick={() => navigate(`/u/${post.authorId}`)}
      >
        <div className="p-4">
          {/* Author */}
          <div className="flex items-center gap-2 mb-2.5">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-xs">
                {(post.authorName ?? 'D').charAt(0)}
              </div>
            )}
            <span
              className="text-[#f3f2f2] font-semibold text-sm hover:underline"
              onClick={(e) => { e.stopPropagation(); navigate(`/u/${post.authorId}`); }}
            >
              {post.authorName ?? 'Developer'}
            </span>
            <span className="text-[#2A3347] text-xs">·</span>
            <span className="text-[#3D4E68] text-xs font-mono">{formatDate(post.createdAt)}</span>
          </div>

          {/* Content */}
          <p className="text-[#C9D5E8] text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Code block */}
          {post.code && (
            <div className="mt-3 rounded-lg overflow-hidden border border-[#1E2535]">
              <div className="bg-[#0B0E17] px-3 py-2 flex items-center justify-between border-b border-[#1E2535]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                    <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                    <span className="w-2 h-2 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: langColor }} />
                    <span className="text-[#5A6680] text-[10px] font-mono">{post.codeLanguage ?? 'code'}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyCode(); }}
                  className="flex items-center gap-1 text-[10px] text-[#5A6680] hover:text-[#e1ff00] transition-colors"
                >
                  {codeCopied ? <Check size={10} className="text-[#22C55E]" /> : <Copy size={10} />}
                  {codeCopied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="bg-[#060911] px-3 py-3 overflow-x-auto max-h-48">
                <table className="w-full border-collapse text-xs font-mono">
                  <tbody>
                    {codeLines.map((line, i) => (
                      <tr key={i}>
                        <td className="pr-3 text-[#2A3347] text-right select-none w-6 py-0.5" style={{ fontSize: '10px' }}>
                          {i + 1}
                        </td>
                        <td className="text-[#A5D6FF] py-0.5 whitespace-pre">{line || ' '}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Media */}
          {post.mediaUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-[#1E2535]">
              {post.mediaType === 'video' ? (
                <video
                  src={post.mediaUrl}
                  controls
                  className="w-full block"
                  style={{ maxHeight: '240px', background: '#060911' }}
                  preload="metadata"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt=""
                  className="w-full block"
                  style={{ maxHeight: '240px', objectFit: 'cover', objectPosition: 'center top' }}
                />
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {post.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] font-mono text-[#3B82F6] bg-[#3B82F6]/8 border border-[#3B82F6]/15 px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
