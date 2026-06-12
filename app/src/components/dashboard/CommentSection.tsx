import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { formatDate } from '@/lib/utils';
import type { Toast } from '@/hooks/useToast';

interface CommentSectionProps {
  postId: number;
  isOpen: boolean;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function CommentSection({ postId, isOpen, addToast }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const utils = trpc.useUtils();

  const { data: commentList } = trpc.comments.list.useQuery(
    { postId },
    { enabled: isOpen }
  );

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ postId });
      utils.posts.list.invalidate();
      setCommentText('');
      addToast('Comentario publicado!', 'success');
    },
  });

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    createComment.mutate({ postId, content: commentText });
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[#2A3347]">
      {commentList?.length === 0 && (
        <p className="text-[#5A6680] text-sm text-center py-4">Sin comentarios. Se el primero!</p>
      )}
      {commentList?.map((c) => (
        <div key={c.id} className="flex items-start gap-2 mb-3">
          {c.authorAvatar ? (
            <img src={c.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-bold text-xs shrink-0">
              {(c.authorName ?? 'D').charAt(0)}
            </div>
          )}
          <div className="bg-[#0F131D] px-3 py-2.5 flex-1 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs text-[#e1ff00] font-semibold">{c.authorName ?? 'Developer'}</span>
              <span className="text-[#5A6680] text-xs">· {formatDate(c.createdAt)}</span>
            </div>
            <p className="text-sm text-[#E2E8F0]">{c.content}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Escribe un comentario..."
          className="flex-1 bg-[#0F131D] border border-[#2A3347] text-[#f3f2f2] px-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition-all placeholder:text-[#3A4460] rounded-full"
        />
        <button
          onClick={handleSubmit}
          disabled={!commentText.trim() || createComment.isPending}
          className="bg-[#3B82F6] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#2563EB] transition-colors rounded-full disabled:opacity-50"
        >
          {createComment.isPending ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
