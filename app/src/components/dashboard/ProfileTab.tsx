import { useState } from 'react';
import { Calendar, Code2, Heart, MessageCircle, Verified } from 'lucide-react';
import PostCard from './PostCard';
import EditProfileModal from './EditProfileModal';
import type { Post } from './types';
import type { User } from '@db/schema';
import type { Toast } from '@/hooks/useToast';

interface ProfileTabProps {
  user: User;
  postsList: Post[];
  savedPostIds: Set<number>;
  onToggleSave: (postId: number) => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function ProfileTab({ user, postsList, savedPostIds, onToggleSave, addToast }: ProfileTabProps) {
  const [editOpen, setEditOpen] = useState(false);

  const myPosts = postsList.filter((p) => p.authorId === user.id);
  const totalLikesReceived = myPosts.reduce((sum, p) => sum + (p.likesCount ?? 0), 0);
  const totalComments = myPosts.reduce((sum, p) => sum + (p.commentsCount ?? 0), 0);
  const handle = user.name?.toLowerCase().replace(/\s+/g, '') ?? 'dev';

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const bioText = user.bio?.trim()
    || 'Developer en DevConnect · Compartiendo código, aprendiendo y conectando con la comunidad.';

  return (
    <div>
      {/* Banner */}
      <div className="h-36 bg-gradient-to-br from-[#0A1020] via-[#111827] to-[#0A0E18] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #e1ff00 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3B82F6 0%, transparent 40%)' }}
        />
      </div>

      {/* Avatar + Edit */}
      <div className="px-4 relative">
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div>
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-[#050507]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-3xl border-4 border-[#050507]">
                {user.name?.charAt(0) ?? 'U'}
              </div>
            )}
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="px-4 py-1.5 border border-[#2A3347] text-[#f3f2f2] text-sm font-semibold rounded-full hover:bg-[#1E2535] hover:border-[#e1ff00]/30 transition-colors"
          >
            Editar perfil
          </button>
        </div>

        {/* Name + handle */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[#f3f2f2] font-bold text-xl">{user.name ?? 'Developer'}</h2>
            <Verified size={18} className="text-[#3B82F6]" />
          </div>
          <p className="text-[#5A6680] text-sm">@{handle}</p>
        </div>

        {/* Bio */}
        <p className="text-[#8B9AB0] text-sm mb-3 leading-relaxed">{bioText}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-[#5A6680] mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            Se unió en {joinedDate}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-5 pb-3 border-b border-[#2A3347]">
          <div className="text-center">
            <p className="text-[#f3f2f2] font-bold">{myPosts.length}</p>
            <p className="text-[#5A6680] text-xs">Posts</p>
          </div>
          <div className="text-center flex items-center gap-1.5">
            <div>
              <p className="text-[#f3f2f2] font-bold flex items-center gap-1">
                <Heart size={13} className="text-[#EF4444]" />
                {totalLikesReceived}
              </p>
              <p className="text-[#5A6680] text-xs">Likes</p>
            </div>
          </div>
          <div className="text-center flex items-center gap-1.5">
            <div>
              <p className="text-[#f3f2f2] font-bold flex items-center gap-1">
                <MessageCircle size={13} className="text-[#3B82F6]" />
                {totalComments}
              </p>
              <p className="text-[#5A6680] text-xs">Comentarios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {myPosts.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Code2 size={40} className="text-[#2A3347] mx-auto mb-4" />
          <p className="text-[#5A6680] text-sm">Aún no tienes posts. ¡Comparte algo!</p>
        </div>
      ) : (
        myPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            addToast={addToast}
            isSaved={savedPostIds.has(post.id)}
            onToggleSave={() => onToggleSave(post.id)}
          />
        ))
      )}

      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          addToast={addToast}
        />
      )}
    </div>
  );
}
