import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Hash } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer';
import PostCard from '@/components/dashboard/PostCard';
import SharedPostCard from '@/components/dashboard/SharedPostCard';

export default function TagFeedPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const safeTag = tag ?? '';

  const { data: posts = [], isLoading } = trpc.posts.listByTag.useQuery(
    { tag: safeTag },
    { enabled: !!safeTag, refetchInterval: 30000 },
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
        <div className="flex items-center gap-2">
          <Hash size={18} className="text-[#3B82F6]" />
          <h1 className="text-[#f3f2f2] font-bold text-lg">{safeTag}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-20 px-4">
            <Hash size={48} className="text-[#2A3347] mx-auto mb-4" />
            <p className="text-[#5A6680] text-lg mb-1">Sin posts para #{safeTag}</p>
            <p className="text-[#5A6680] text-sm">Sé el primero en compartir algo con este tag.</p>
          </div>
        )}

        {posts.map((item) =>
          item.isRepostEntry ? (
            <SharedPostCard
              key={`r-${item.repostId ?? item.id}`}
              repostId={item.repostId!}
              repostCreatedAt={item.repostCreatedAt!}
              quoteText={item.quoteText ?? null}
              post={item}
              reposterName={item.reposterName ?? null}
              reposterAvatar={item.reposterAvatar ?? null}
              addToast={addToast}
            />
          ) : (
            <PostCard
              key={`p-${item.id}`}
              post={item}
              addToast={addToast}
              isSaved={false}
            />
          )
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
