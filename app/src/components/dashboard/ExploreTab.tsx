import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Hash, X } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import type { Toast } from '@/hooks/useToast';

interface ExploreTabProps {
  addToast: (message: string, type: Toast['type']) => void;
}

export default function ExploreTab({ addToast }: ExploreTabProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const utils = trpc.useUtils();

  const { data: trendingTags = [], isLoading: tagsLoading } = trpc.users.trendingTags.useQuery(
    { limit: 10 },
    { staleTime: 5 * 60 * 1000 },
  );

  const { data: suggestedUsers = [], isLoading: usersLoading } = trpc.users.suggestedUsers.useQuery(
    { limit: 6 },
    { enabled: !!user, staleTime: 5 * 60 * 1000 },
  );

  const toggleFollow = trpc.follows.toggle.useMutation({
    onSuccess: (res, vars) => {
      void utils.users.suggestedUsers.invalidate();
      const followed = (res as { following?: boolean }).following;
      addToast(
        followed ? 'Siguiendo!' : 'Dejaste de seguir',
        followed ? 'success' : 'info',
      );
    },
    onError: (err) => addToast(`Error: ${err.message}`, 'error'),
  });

  const { data: followingIds = [] } = trpc.follows.listFollowing.useQuery(
    undefined,
    { enabled: !!user },
  );
  const followingSet = new Set<number>(followingIds);

  const q = query.toLowerCase().trim();

  const filteredTags = q
    ? trendingTags.filter((t) => t.tag.toLowerCase().includes(q))
    : trendingTags;

  const filteredUsers = q
    ? suggestedUsers.filter(
        (u) => u.name?.toLowerCase().includes(q),
      )
    : suggestedUsers;

  return (
    <div className="p-4">
      {/* Search */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A6680]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tendencias, developers..."
          className="w-full bg-[#151A27] border border-[#2A3347] text-[#f3f2f2] pl-12 pr-10 py-3 text-sm outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#5A6680] rounded-xl"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6680] hover:text-[#f3f2f2] transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Trending Tags */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#f3f2f2] font-bold text-lg">Tendencias</h3>
        {q && (
          <span className="text-xs text-[#5A6680]">
            {filteredTags.length} resultado{filteredTags.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {tagsLoading ? (
        <div className="space-y-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#151A27] rounded-xl animate-pulse border border-[#2A3347]" />
          ))}
        </div>
      ) : filteredTags.length > 0 ? (
        <div className="space-y-2 mb-8">
          {filteredTags.map((t) => (
            <button
              key={t.tag}
              onClick={() => navigate(`/tag/${t.tag}`)}
              className="w-full bg-[#151A27] border border-[#2A3347] p-4 rounded-xl hover:border-[#3B82F6]/40 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#5A6680] text-xs">Tendencia en DevConnect</div>
                  <div className="text-[#f3f2f2] font-bold mt-0.5 flex items-center gap-1.5">
                    <Hash size={13} className="text-[#3B82F6]" />
                    {t.tag}
                  </div>
                  <div className="text-[#5A6680] text-xs mt-1">{t.count} posts</div>
                </div>
                <Hash size={16} className="text-[#3B82F6]/40" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-8">
          <p className="text-[#5A6680] text-sm">
            {q ? `Sin tendencias para "${q}"` : 'Aún no hay tendencias'}
          </p>
        </div>
      )}

      {/* Suggested Users */}
      {user && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#f3f2f2] font-bold text-lg">A quien seguir</h3>
            {q && (
              <span className="text-xs text-[#5A6680]">
                {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {usersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#151A27] rounded-xl animate-pulse border border-[#2A3347]" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((u) => {
              const isFollowing = followingSet.has(u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 bg-[#151A27] border border-[#2A3347] p-4 rounded-xl mb-3 hover:border-[#2A3347]/80 transition-colors"
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer"
                      onClick={() => navigate(`/u/${u.id}`)}
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-lg shrink-0 cursor-pointer"
                      onClick={() => navigate(`/u/${u.id}`)}
                    >
                      {u.name?.charAt(0) ?? 'D'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/u/${u.id}`)}>
                    <div className="text-[#f3f2f2] font-semibold text-sm truncate">{u.name ?? 'Developer'}</div>
                    {u.bio && <div className="text-[#5A6680] text-xs mt-0.5 truncate">{u.bio}</div>}
                  </div>
                  <button
                    disabled={toggleFollow.isPending}
                    onClick={() => toggleFollow.mutate({ followingId: u.id })}
                    className={`text-xs font-bold px-4 py-2 rounded-full transition-colors shrink-0 ${
                      isFollowing
                        ? 'text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10'
                        : 'text-[#050507] bg-[#f3f2f2] hover:bg-white'
                    }`}
                  >
                    {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-[#5A6680] text-sm">
                {q ? `Sin usuarios para "${q}"` : 'Sin sugerencias disponibles'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
