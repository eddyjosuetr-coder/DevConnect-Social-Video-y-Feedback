import { Bookmark } from 'lucide-react';
import PostCard from './PostCard';
import type { Post } from './types';
import type { Toast } from '@/hooks/useToast';

interface BookmarksTabProps {
  postsList: Post[];
  savedPostIds: Set<number>;
  onToggleSave: (postId: number) => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function BookmarksTab({ postsList, savedPostIds, onToggleSave, addToast }: BookmarksTabProps) {
  const savedPosts = postsList.filter((p) => savedPostIds.has(p.id));

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
        <p className="text-[#5A6680] text-xs mt-3">Los guardados persisten entre sesiones.</p>
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
          isSaved={true}
          onToggleSave={() => onToggleSave(post.id)}
        />
      ))}
    </div>
  );
}
