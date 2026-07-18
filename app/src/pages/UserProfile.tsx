import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Users, UserCheck, UserPlus, Verified, Grid3X3 } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import PostCard from '@/components/dashboard/PostCard';
import ToastContainer from '@/components/ToastContainer';

export default function UserProfile() {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = Number(userIdParam);
  const navigate = useNavigate();
  const { user: me, isAuthenticated } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const isOwnProfile = isAuthenticated && me?.id === userId;

  const { data: profile, isLoading: profileLoading } = trpc.users.getProfile.useQuery(
    { userId },
    { enabled: !!userId && !Number.isNaN(userId) }
  );

  const { data: userPosts, isLoading: postsLoading } = trpc.posts.listByUser.useQuery(
    { userId },
    { enabled: !!userId && !Number.isNaN(userId) }
  );

  const { data: isFollowingData, refetch: refetchIsFollowing } = trpc.follows.isFollowing.useQuery(
    { followingId: userId },
    { enabled: isAuthenticated && !isOwnProfile && !!userId }
  );

  const [followLoading, setFollowLoading] = useState(false);
  const [localFollowing, setLocalFollowing] = useState<boolean | null>(null);
  const [localFollowerCount, setLocalFollowerCount] = useState<number | null>(null);

  const toggleFollow = trpc.follows.toggle.useMutation();

  const isFollowing = localFollowing ?? isFollowingData ?? false;
  const followerCount = localFollowerCount ?? (profile?.followerCount ?? 0);

  function handleFollowClick() {
    if (!isAuthenticated) { navigate('/login'); return; }
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setLocalFollowing(!wasFollowing);
    setLocalFollowerCount(wasFollowing ? followerCount - 1 : followerCount + 1);
    toggleFollow.mutate(
      { followingId: userId },
      {
        onSuccess: (result) => {
          setLocalFollowing(result.following);
          setLocalFollowerCount(
            result.following
              ? (profile?.followerCount ?? 0) + 1
              : Math.max(0, (profile?.followerCount ?? 0) - 1)
          );
          addToast(result.following ? `Ahora sigues a ${profile?.name ?? 'este usuario'}` : 'Dejaste de seguir', 'success');
          void refetchIsFollowing();
        },
        onError: () => {
          setLocalFollowing(wasFollowing);
          setLocalFollowerCount(followerCount);
          addToast('Error al actualizar seguimiento', 'error');
        },
        onSettled: () => setFollowLoading(false),
      }
    );
  }

  const handle = profile?.name?.toLowerCase().replace(/\s+/g, '') ?? 'user';

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es', { year: 'numeric', month: 'long' })
    : null;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#e1ff00]/30 border-t-[#e1ff00] animate-spin" />
          <span className="text-[#3D4E68] text-sm font-mono">Cargando perfil…</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#f3f2f2] text-xl font-bold mb-2">Usuario no encontrado</p>
          <button
            onClick={() => navigate('/app')}
            className="text-[#e1ff00] text-sm hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060911]">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Top nav bar */}
      <div className="sticky top-0 z-20 bg-[#060911]/90 backdrop-blur-sm border-b border-[#1E2535] px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-[#6B7FA8] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[#f3f2f2] font-bold text-[15px] leading-tight">{profile.name ?? 'Developer'}</p>
          <p className="text-[#3D4E68] text-xs font-mono">{userPosts?.length ?? 0} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="relative">
        {profile.banner ? (
          <img
            src={profile.banner}
            alt=""
            className="w-full object-cover"
            style={{ height: '200px', objectPosition: 'center' }}
          />
        ) : (
          <div
            className="w-full"
            style={{
              height: '200px',
              background: 'linear-gradient(135deg, #0B0E17 0%, #111827 40%, #0f1729 70%, #060911 100%)',
            }}
          >
            <div
              className="w-full h-full"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(225,255,0,0.06) 0%, transparent 70%)',
              }}
            />
          </div>
        )}

        {/* Avatar */}
        <div className="absolute -bottom-12 left-4">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt=""
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[#060911]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-3xl ring-4 ring-[#060911]">
              {(profile.name ?? 'D').charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Follow button row */}
      <div className="flex justify-end px-4 pt-3 pb-1" style={{ minHeight: '52px' }}>
        {!isOwnProfile && (
          <button
            onClick={handleFollowClick}
            disabled={followLoading}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              isFollowing
                ? 'bg-transparent border border-[#3D4E68] text-[#f3f2f2] hover:border-[#EF4444] hover:text-[#EF4444]'
                : 'bg-[#e1ff00] text-[#050507] hover:bg-[#d4f000]'
            }`}
          >
            {isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
        )}
        {isOwnProfile && (
          <button
            onClick={() => navigate('/app')}
            className="px-5 py-2 rounded-full text-sm font-semibold border border-[#3D4E68] text-[#f3f2f2] hover:border-[#e1ff00]/50 transition-all"
          >
            Editar perfil
          </button>
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 mt-10">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-[#f3f2f2] font-bold text-xl">{profile.name ?? 'Developer'}</h1>
          <Verified size={16} className="text-[#3B82F6] shrink-0" />
        </div>
        <p className="text-[#3D4E68] font-mono text-sm mt-0.5">@{handle}</p>

        {profile.bio && (
          <p className="text-[#C9D5E8] text-[15px] leading-relaxed mt-3 max-w-lg">{profile.bio}</p>
        )}

        {joinDate && (
          <div className="flex items-center gap-1.5 mt-3 text-[#3D4E68] text-sm">
            <Calendar size={14} />
            <span>Se unió en {joinDate}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <button
            className="flex items-center gap-1.5 text-sm hover:underline cursor-pointer"
          >
            <span className="text-[#f3f2f2] font-bold">{profile.followingCount}</span>
            <span className="text-[#3D4E68]">Siguiendo</span>
          </button>
          <button
            className="flex items-center gap-1.5 text-sm hover:underline cursor-pointer"
          >
            <span className="text-[#f3f2f2] font-bold">{followerCount}</span>
            <span className="text-[#3D4E68]">Seguidores</span>
          </button>
        </div>
      </div>

      {/* Posts tab header */}
      <div className="mt-6 border-b border-[#1E2535] px-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-[#e1ff00] w-fit">
          <Grid3X3 size={14} className="text-[#e1ff00]" />
          <span className="text-[#f3f2f2] text-sm font-semibold">Posts</span>
        </div>
      </div>

      {/* Posts */}
      <div>
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-[#e1ff00]/30 border-t-[#e1ff00] animate-spin" />
          </div>
        ) : !userPosts || userPosts.length === 0 ? (
          <div className="text-center py-16 text-[#3D4E68]">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aún no hay posts</p>
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              addToast={addToast}
            />
          ))
        )}
      </div>
    </div>
  );
}
