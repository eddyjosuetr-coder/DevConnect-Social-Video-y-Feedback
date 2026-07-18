import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share2, Verified, Bookmark, Copy, Check } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { formatDate } from '@/lib/utils';
import type { Toast } from '@/hooks/useToast';
import type { Post } from './types';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  addToast: (message: string, type: Toast['type']) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const LANG_COLORS: Record<string, string> = {
  typescript: '#3178C6', javascript: '#F7DF1E', python: '#3776AB',
  rust: '#CE422B', go: '#00ADD8', java: '#ED8B00', css: '#264DE4',
  html: '#E34F26', bash: '#4EAA25', sql: '#CC2927', json: '#292929',
  yaml: '#CB171E', tsx: '#3178C6', dockerfile: '#2496ED',
};

export default function PostCard({ post, addToast, isSaved = false, onToggleSave }: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repostsCount);
  const [isReposted, setIsReposted] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const toggleLike = trpc.posts.toggleLike.useMutation();
  const toggleRepost = trpc.reposts.toggle.useMutation();

  const handle = post.authorName?.toLowerCase().replace(/\s/g, '') ?? 'dev';
  const langColor = LANG_COLORS[post.codeLanguage ?? ''] ?? '#5A6680';

  function handleLike() {
    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    setLikesCount((prev) => nowLiked ? prev + 1 : Math.max(0, prev - 1));
    toggleLike.mutate({ postId: post.id }, {
      onSuccess: () => addToast(nowLiked ? 'Te gusto el post!' : 'Quitaste tu like', 'success'),
      onError: (err) => {
        setIsLiked(!nowLiked);
        setLikesCount((prev) => nowLiked ? Math.max(0, prev - 1) : prev + 1);
        addToast(`Error: ${err.message}`, 'error');
      },
    });
  }

  function handleRepost() {
    const nowReposted = !isReposted;
    setIsReposted(nowReposted);
    setRepostCount((prev) => nowReposted ? prev + 1 : Math.max(0, prev - 1));
    toggleRepost.mutate({ postId: post.id }, {
      onSuccess: () => addToast(nowReposted ? 'Reposteado!' : 'Repost eliminado', 'success'),
      onError: (err) => {
        setIsReposted(!nowReposted);
        setRepostCount((prev) => nowReposted ? Math.max(0, prev - 1) : prev + 1);
        addToast(`Error: ${err.message}`, 'error');
      },
    });
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(post.code ?? '');
    setCodeCopied(true);
    addToast('Codigo copiado!', 'success');
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const codeLines = (post.code ?? '').split('\n');

  return (
    <article
      className="relative border-b border-[#1E2535] p-5 transition-all duration-200 hover:bg-[#080B12] group"
      style={{ borderLeft: '2px solid transparent' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = '#e1ff00'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent'; }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#e1ff00]/20 transition-all" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-sm">
              {(post.authorName ?? 'D').charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#080B12]" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="text-[#f3f2f2] font-bold text-[15px] hover:underline cursor-pointer">{post.authorName ?? 'Developer'}</span>
            <Verified size={13} className="text-[#3B82F6] shrink-0" />
            <span className="text-[#3D4E68] text-sm font-mono">@{handle}</span>
            <span className="text-[#2A3347] text-sm">·</span>
            <span className="text-[#3D4E68] text-xs font-mono">{formatDate(post.createdAt)}</span>
          </div>

          {/* Content */}
          <p className="text-[#C9D5E8] text-[15px] leading-relaxed whitespace-pre-wrap mb-3">
            {post.content}
          </p>

          {/* Code Block */}
          {post.code && (
            <div className="mb-4 rounded-lg overflow-hidden border border-[#1E2535] group/code">
              {/* Terminal Header */}
              <div className="bg-[#0B0E17] px-4 py-2.5 flex items-center justify-between border-b border-[#1E2535]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: langColor }}
                    />
                    <span className="text-[#5A6680] text-xs font-mono">{post.codeLanguage ?? 'code'}</span>
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs text-[#5A6680] hover:text-[#e1ff00] transition-colors"
                >
                  {codeCopied ? <Check size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
                  <span>{codeCopied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              {/* Code Lines */}
              <div className="bg-[#060911] p-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm font-mono">
                  <tbody>
                    {codeLines.map((line, i) => (
                      <tr key={i} className="hover:bg-[#e1ff00]/3 transition-colors">
                        <td className="pr-4 text-[#2A3347] text-right select-none w-8 py-0.5" style={{ fontSize: '11px' }}>
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
            <div className="mb-3 rounded-xl overflow-hidden border border-[#1E2535]">
              {post.mediaType === 'video' ? (
                <video
                  src={post.mediaUrl}
                  controls
                  className="w-full block"
                  style={{ maxHeight: '520px', background: '#060911' }}
                  preload="metadata"
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt=""
                  className="w-full block"
                  style={{
                    maxHeight: '520px',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/8 border border-[#3B82F6]/15 px-2 py-0.5 rounded cursor-pointer hover:bg-[#3B82F6]/15 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-sm mt-1">
            <ActionBtn
              icon={<MessageCircle size={16} className={commentsOpen ? 'text-[#3B82F6]' : ''} />}
              count={post.commentsCount}
              active={commentsOpen}
              activeColor="#3B82F6"
              onClick={() => setCommentsOpen((v) => !v)}
            />
            <ActionBtn
              icon={<Repeat2 size={16} />}
              count={repostCount}
              active={isReposted}
              activeColor="#22C55E"
              onClick={handleRepost}
            />
            <ActionBtn
              icon={<Heart size={16} className={isLiked ? 'fill-[#EF4444]' : ''} />}
              count={likesCount}
              active={isLiked}
              activeColor="#EF4444"
              onClick={handleLike}
              disabled={toggleLike.isPending}
            />
            <button
              onClick={() => { onToggleSave?.(); addToast(isSaved ? 'Quitaste de guardados' : 'Post guardado!', 'success'); }}
              className={`p-2 rounded-lg transition-all ${isSaved ? 'text-[#e1ff00]' : 'text-[#3D4E68] hover:text-[#e1ff00] hover:bg-[#e1ff00]/8'}`}
            >
              <Bookmark size={16} className={isSaved ? 'fill-[#e1ff00]' : ''} />
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/#/post/${post.id}`); addToast('Enlace copiado!', 'info'); }}
              className="p-2 rounded-lg text-[#3D4E68] hover:text-[#3B82F6] hover:bg-[#3B82F6]/8 transition-all"
            >
              <Share2 size={16} />
            </button>
          </div>

          <CommentSection postId={post.id} isOpen={commentsOpen} addToast={addToast} />
        </div>
      </div>
    </article>
  );
}

function ActionBtn({
  icon, count, active, activeColor, onClick, disabled,
}: {
  icon: React.ReactNode;
  count: number;
  active: boolean;
  activeColor: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 p-2 rounded-lg transition-all group/action"
      style={{
        color: active ? activeColor : '#3D4E68',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = activeColor;
        (e.currentTarget as HTMLElement).style.backgroundColor = `${activeColor}12`;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = '#3D4E68';
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      <span className="text-xs font-mono tabular-nums">{count}</span>
    </button>
  );
}
