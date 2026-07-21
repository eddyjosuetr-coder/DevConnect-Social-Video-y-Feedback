import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';

interface FollowersModalProps {
  userId: number;
  type: 'followers' | 'following';
  onClose: () => void;
}

export default function FollowersModal({ userId, type, onClose }: FollowersModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: followers = [], isLoading: loadingFollowers } = trpc.follows.listFollowers.useQuery(
    { userId },
    { enabled: type === 'followers' },
  );

  const { data: following = [], isLoading: loadingFollowing } = trpc.follows.listFollowingUsers.useQuery(
    { userId },
    { enabled: type === 'following' },
  );

  const { data: myFollowingIds = [] } = trpc.follows.listFollowing.useQuery(
    undefined,
    { enabled: !!user },
  );
  const myFollowingSet = new Set<number>(myFollowingIds);

  const toggleFollow = trpc.follows.toggle.useMutation({
    onSuccess: () => {
      void utils.follows.listFollowing.invalidate();
      void utils.follows.listFollowers.invalidate();
      void utils.follows.listFollowingUsers.invalidate();
    },
  });

  const list = type === 'followers' ? followers : following;
  const isLoading = type === 'followers' ? loadingFollowers : loadingFollowing;
  const title = type === 'followers' ? 'Seguidores' : 'Siguiendo';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-[#0D1117] border border-[#2A3347] rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3347] shrink-0">
          <h2 className="text-[#f3f2f2] font-bold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#5A6680] hover:text-[#f3f2f2] rounded-full hover:bg-[#1E2535] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-t-[#e1ff00] border-[#1E2535] animate-spin" />
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-[#5A6680] text-sm">
                {type === 'followers' ? 'Sin seguidores todavía' : 'No sigue a nadie todavía'}
              </p>
            </div>
          ) : (
            list.map((u) => {
              const isMe = u.id === user?.id;
              const isFollowing = myFollowingSet.has(u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2535] hover:bg-[#ffffff03] transition-colors"
                >
                  <div
                    className="shrink-0 cursor-pointer"
                    onClick={() => { onClose(); navigate(`/u/${u.id}`); }}
                  >
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-sm">
                        {u.name?.charAt(0) ?? 'D'}
                      </div>
                    )}
                  </div>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => { onClose(); navigate(`/u/${u.id}`); }}
                  >
                    <p className="text-[#f3f2f2] font-semibold text-sm truncate">{u.name ?? 'Developer'}</p>
                    {u.bio && <p className="text-[#5A6680] text-xs truncate mt-0.5">{u.bio}</p>}
                  </div>

                  {user && !isMe && (
                    <button
                      disabled={toggleFollow.isPending}
                      onClick={() => toggleFollow.mutate({ followingId: u.id })}
                      className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-60"
                      style={isFollowing ? {
                        color: '#5A6680',
                        border: '1px solid #2A3347',
                        background: 'transparent',
                      } : {
                        color: '#050507',
                        background: '#e1ff00',
                      }}
                    >
                      {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
