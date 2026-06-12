import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share2, Verified } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { formatDate } from '@/lib/utils';
import type { Toast } from '@/hooks/useToast';
import type { Post } from './types';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function PostCard({ post, addToast }: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  // Optimistic local state — don't rely on server refetch (serverless is stateless)
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [isReposted, setIsReposted] = useState(false);

  const toggleLike = trpc.posts.toggleLike.useMutation({
    onSuccess: (data) => {
      addToast(data.liked ? 'Te gusto el post!' : 'Quitaste tu like', 'success');
    },
    onError: (err) => {
      // Revert optimistic update
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => isLiked ? prev + 1 : Math.max(0, prev - 1));
      addToast(`Error: ${err.message}`, 'error');
    },
  });

  const handle = post.authorName?.toLowerCase().replace(/\s/g, '') ?? 'dev';

  function handleLike() {
    // Apply optimistic update immediately
    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    setLikesCount((prev) => nowLiked ? prev + 1 : Math.max(0, prev - 1));
    toggleLike.mutate({ postId: post.id });
  }

  function handleRepost() {
    const nowReposted = !isReposted;
    setIsReposted(nowReposted);
    setRepostCount((prev) => nowReposted ? prev + 1 : Math.max(0, prev - 1));
    addToast(nowReposted ? 'Reposteado!' : 'Repost eliminado', 'success');
  }

  return (
    <article className="border-b border-[#2A3347] p-4 hover:bg-[#151A27]/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold">
              {(post.authorName ?? 'D').charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[#f3f2f2] font-bold text-[15px]">{post.authorName ?? 'Developer'}</span>
            <Verified size={14} className="text-[#3B82F6]" />
            <span className="text-[#5A6680] text-sm">@{handle}</span>
            <span className="text-[#5A6680] text-sm">· {formatDate(post.createdAt)}</span>
          </div>

          <p className="text-[#E2E8F0] text-[15px] leading-relaxed whitespace-pre-wrap mb-3">
            {post.content}
          </p>

          {post.code && (
            <div className="mb-3 rounded-xl overflow-hidden border border-[#2A3347]">
              <div className="bg-[#0B0F17] px-4 py-2 flex items-center justify-between border-b border-[#2A3347]">
                <span className="text-xs text-[#5A6680] font-mono">{post.codeLanguage ?? 'code'}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(post.code ?? ''); addToast('Codigo copiado!', 'success'); }}
                  className="text-xs text-[#5A6680] hover:text-[#E2E8F0] transition-colors"
                >
                  Copiar
                </button>
              </div>
              <pre className="bg-[#0D1117] p-4 overflow-x-auto">
                <code className="text-sm font-mono text-[#A5D6FF]">{post.code}</code>
              </pre>
            </div>
          )}

          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span key={tag} className="text-sm text-[#3B82F6] hover:underline cursor-pointer">#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between max-w-md">
            <button
              onClick={() => setCommentsOpen((v) => !v)}
              className="flex items-center gap-2 text-[#5A6680] hover:text-[#3B82F6] transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-[#3B82F6]/10">
                <MessageCircle size={18} className={commentsOpen ? 'text-[#3B82F6]' : ''} />
              </div>
              <span className="text-sm">{post.commentsCount}</span>
            </button>

            <button
              onClick={handleRepost}
              className={`flex items-center gap-2 transition-colors group ${isReposted ? 'text-[#22C55E]' : 'text-[#5A6680] hover:text-[#22C55E]'}`}
            >
              <div className="p-2 rounded-full group-hover:bg-[#22C55E]/10">
                <Repeat2 size={18} />
              </div>
              <span className="text-sm">{repostCount}</span>
            </button>

            <button
              onClick={handleLike}
              disabled={toggleLike.isPending}
              className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-[#EF4444]' : 'text-[#5A6680] hover:text-[#EF4444]'}`}
            >
              <div className="p-2 rounded-full group-hover:bg-[#EF4444]/10">
                <Heart size={18} className={isLiked ? 'fill-[#EF4444]' : ''} />
              </div>
              <span className="text-sm">{likesCount}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/#/post/${post.id}`);
                addToast('Enlace copiado!', 'info');
              }}
              className="flex items-center gap-2 text-[#5A6680] hover:text-[#3B82F6] transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-[#3B82F6]/10"><Share2 size={18} /></div>
            </button>
          </div>

          <CommentSection postId={post.id} isOpen={commentsOpen} addToast={addToast} />
        </div>
      </div>
    </article>
  );
}
