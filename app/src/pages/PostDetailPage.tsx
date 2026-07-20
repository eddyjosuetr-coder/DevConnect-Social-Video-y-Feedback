import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Code2 } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer';
import PostCard from '@/components/dashboard/PostCard';
import CommentSection from '@/components/dashboard/CommentSection';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const id = Number(postId);
  const { data: post, isLoading, error } = trpc.posts.get.useQuery(
    { postId: id },
    { enabled: !isNaN(id) },
  );

  return (
    <div className="min-h-screen bg-[#060911]">
      <header className="sticky top-0 z-30 bg-[#060911]/95 backdrop-blur-sm border-b border-[#1E2535] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-[#5A6680] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[#f3f2f2] font-bold text-lg">Post</h1>
      </header>

      <div className="max-w-2xl mx-auto">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#e1ff00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {(error || (!isLoading && !post)) && (
          <div className="text-center py-20 px-4">
            <Code2 size={48} className="text-[#2A3347] mx-auto mb-4" />
            <p className="text-[#5A6680] text-lg">Post no encontrado</p>
            <button
              onClick={() => navigate('/app')}
              className="mt-4 px-6 py-2.5 bg-[#e1ff00] text-[#050507] font-bold rounded-full text-sm hover:bg-[#d4e600] transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {post && (
          <>
            <PostCard
              post={post}
              addToast={addToast}
              isSaved={false}
            />
            <div className="border-t border-[#1E2535] px-5 pt-4 pb-2">
              <p className="text-[#5A6680] text-sm font-semibold uppercase tracking-wider">Comentarios</p>
            </div>
            <CommentSection postId={post.id} isOpen addToast={addToast} />
          </>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
