import { Bookmark } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import PostCard from './PostCard';
import type { Toast } from '@/hooks/useToast';

interface BookmarksTabProps {
  addToast: (message: string, type: Toast['type']) => void;
}

export default function BookmarksTab({ addToast }: BookmarksTabProps) {
  const utils = trpc.useUtils();

  const { data: savedPosts = [], isLoading } = trpc.bookmarks.list.useQuery(undefined, {
    staleTime: 30000,
  });

  const toggle = trpc.bookmarks.toggle.useMutation({
    onSuccess: () => {
      void utils.bookmarks.list.invalidate();
      void utils.bookmarks.bookmarkedIds.invalidate();
    },
  });

  const { data: bookmarkedIds = [] } = trpc.bookmarks.bookmarkedIds.useQuery();
  const bookmarkedSet = new Set<number>(bookmarkedIds);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#e1ff00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 bg-[#151A27] rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark size={28} className="text-[#2A3347]" />
        </div>
        <p className="text-[#f3f2f2] font-bold text-lg mb-2">Sin guardados todavía</p>
        <p className="text-[#5A6680] text-sm max-w-xs mx-auto leading-relaxed">
          Guarda posts interesantes tocando el icono{' '}
          <Bookmark size={12} className="inline align-middle" /> en cualquier post del feed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-3 border-b border-[#2A3347]">
        <p className="text-[#5A6680] text-sm">
          {savedPosts.length} {savedPosts.length === 1 ? 'post guardado' : 'posts guardados'}
        </p>
      </div>
      {savedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          addToast={addToast}
          isSaved={bookmarkedSet.has(post.id)}
          onToggleSave={() => {
            toggle.mutate({ postId: post.id });
            addToast(bookmarkedSet.has(post.id) ? 'Quitaste de guardados' : 'Post guardado!', 'success');
          }}
        />
      ))}
    </div>
  );
}
