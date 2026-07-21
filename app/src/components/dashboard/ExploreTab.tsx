import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Hash, X, Users, FileText, TrendingUp } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import PostCard from './PostCard';
import type { Toast } from '@/hooks/useToast';

interface ExploreTabProps {
  addToast: (message: string, type: Toast['type']) => void;
}

export default function ExploreTab({ addToast }: ExploreTabProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const isSearchMode = debouncedQuery.length >= 2;

  // ── Discover data ─────────────────────────────────────────────────────────
  const { data: trendingTags = [], isLoading: tagsLoading } = trpc.users.trendingTags.useQuery(
    { limit: 10 },
    { staleTime: 5 * 60 * 1000 },
  );
  const { data: suggestedUsers = [], isLoading: usersLoading } = trpc.users.suggestedUsers.useQuery(
    { limit: 6 },
    { enabled: !!user, staleTime: 5 * 60 * 1000 },
  );

  // ── Search data ───────────────────────────────────────────────────────────
  const { data: userResults = [], isFetching: searchingUsers } = trpc.users.search.useQuery(
    { query: debouncedQuery },
    { enabled: isSearchMode },
  );
  const { data: postResults = [], isFetching: searchingPosts } = trpc.posts.search.useQuery(
    { query: debouncedQuery },
    { enabled: isSearchMode },
  );
  const matchingTags = isSearchMode
    ? trendingTags.filter((t) => t.tag.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : [];

  // ── Shared: bookmarks + follow ────────────────────────────────────────────
  const { data: bookmarkedIds = [] } = trpc.bookmarks.bookmarkedIds.useQuery(
    undefined,
    { enabled: !!user },
  );
  const bookmarkedSet = new Set<number>(bookmarkedIds);
  const toggleBookmark = trpc.bookmarks.toggle.useMutation({
    onSuccess: () => { void utils.bookmarks.bookmarkedIds.invalidate(); },
  });

  const { data: followingIds = [] } = trpc.follows.listFollowing.useQuery(
    undefined,
    { enabled: !!user },
  );
  const followingSet = new Set<number>(followingIds);
  const toggleFollow = trpc.follows.toggle.useMutation({
    onSuccess: (res) => {
      void utils.follows.listFollowing.invalidate();
      void utils.users.suggestedUsers.invalidate();
      const followed = (res as { following?: boolean }).following;
      addToast(followed ? 'Siguiendo!' : 'Dejaste de seguir', followed ? 'success' : 'info');
    },
    onError: (err) => addToast(`Error: ${err.message}`, 'error'),
  });

  const isSearchLoading = searchingUsers || searchingPosts;
  const hasResults = userResults.length > 0 || postResults.length > 0 || matchingTags.length > 0;

  return (
    <div>
      {/* Sticky search header */}
      <div className="sticky top-0 z-10 bg-[#060911]/95 backdrop-blur-sm border-b border-[#1E2535] px-4 py-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: query ? '#e1ff00' : '#5A6680' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuarios, posts, hashtags..."
            className="w-full bg-[#0D1117] border border-[#2A3347] focus:border-[#e1ff00]/40 text-[#f3f2f2] pl-10 pr-9 py-2.5 text-sm outline-none transition-colors placeholder:text-[#5A6680] rounded-xl font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6680] hover:text-[#f3f2f2] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── SEARCH RESULTS ──────────────────────────────────────────────── */}
      {isSearchMode && (
        <div>
          {isSearchLoading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-t-[#e1ff00] border-[#1E2535] animate-spin" />
            </div>
          )}

          {!isSearchLoading && !hasResults && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Search size={36} className="text-[#2A3347]" />
              <p className="text-[#5A6680] text-sm">Sin resultados para &ldquo;{debouncedQuery}&rdquo;</p>
            </div>
          )}

          {!isSearchLoading && hasResults && (
            <>
              {/* Users */}
              {userResults.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E2535]">
                    <Users size={14} className="text-[#3B82F6]" />
                    <span className="text-[#f3f2f2] font-bold text-sm">Usuarios</span>
                    <span className="text-[#5A6680] text-xs ml-auto">{userResults.length}</span>
                  </div>
                  {userResults.map((u) => {
                    const isFollowing = followingSet.has(u.id);
                    const isMe = u.id === user?.id;
                    return (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2535] hover:bg-[#ffffff03] transition-colors"
                      >
                        <div className="shrink-0 cursor-pointer" onClick={() => navigate(`/u/${u.id}`)}>
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold">
                              {u.name?.charAt(0) ?? 'D'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/u/${u.id}`)}>
                          <p className="text-[#f3f2f2] font-semibold text-sm truncate">{u.name ?? 'Developer'}</p>
                          {u.bio && <p className="text-[#5A6680] text-xs truncate mt-0.5">{u.bio}</p>}
                        </div>
                        {user && !isMe && (
                          <button
                            disabled={toggleFollow.isPending}
                            onClick={() => toggleFollow.mutate({ followingId: u.id })}
                            className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-60"
                            style={isFollowing ? {
                              color: '#5A6680', border: '1px solid #2A3347', background: 'transparent',
                            } : {
                              color: '#050507', background: '#e1ff00',
                            }}
                          >
                            {isFollowing ? 'Siguiendo' : 'Seguir'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Hashtags */}
              {matchingTags.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E2535]">
                    <Hash size={14} className="text-[#A855F7]" />
                    <span className="text-[#f3f2f2] font-bold text-sm">Hashtags</span>
                    <span className="text-[#5A6680] text-xs ml-auto">{matchingTags.length}</span>
                  </div>
                  {matchingTags.map((t) => (
                    <button
                      key={t.tag}
                      onClick={() => navigate(`/tag/${t.tag}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#1E2535] hover:bg-[#ffffff03] transition-colors text-left"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#A855F7]/10 flex items-center justify-center shrink-0">
                        <Hash size={18} className="text-[#A855F7]" />
                      </div>
                      <div>
                        <p className="text-[#f3f2f2] font-semibold text-sm">#{t.tag}</p>
                        <p className="text-[#5A6680] text-xs mt-0.5">{t.count} posts</p>
                      </div>
                    </button>
                  ))}
                </section>
              )}

              {/* Posts */}
              {postResults.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E2535]">
                    <FileText size={14} className="text-[#22C55E]" />
                    <span className="text-[#f3f2f2] font-bold text-sm">Posts</span>
                    <span className="text-[#5A6680] text-xs ml-auto">{postResults.length}</span>
                  </div>
                  {postResults.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      addToast={addToast}
                      isSaved={bookmarkedSet.has(post.id)}
                      onToggleSave={() => toggleBookmark.mutate({ postId: post.id })}
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* ── DISCOVER MODE ────────────────────────────────────────────────── */}
      {!isSearchMode && (
        <div className="p-4">
          {/* Trending */}
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#EF4444]" />
            <h3 className="text-[#f3f2f2] font-bold text-base">Tendencias</h3>
          </div>

          {tagsLoading ? (
            <div className="space-y-2 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#0D1117] rounded-xl animate-pulse border border-[#1E2535]" />
              ))}
            </div>
          ) : trendingTags.length > 0 ? (
            <div className="space-y-2 mb-8">
              {trendingTags.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => navigate(`/tag/${t.tag}`)}
                  className="w-full bg-[#0D1117] border border-[#1E2535] px-4 py-3 rounded-xl hover:border-[#3B82F6]/40 transition-all text-left flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[#3D4E68] text-[10px] font-mono uppercase tracking-wider">
                      Tendencia
                    </div>
                    <div className="text-[#f3f2f2] font-bold mt-0.5 flex items-center gap-1.5 group-hover:text-[#e1ff00] transition-colors">
                      <Hash size={12} className="text-[#3B82F6]" />
                      {t.tag}
                    </div>
                    <div className="text-[#5A6680] text-xs mt-0.5">{t.count} posts</div>
                  </div>
                  <Hash size={20} className="text-[#1E2535] group-hover:text-[#3B82F6]/30 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-8">
              <p className="text-[#5A6680] text-sm">Aún no hay tendencias</p>
            </div>
          )}

          {/* Suggested users */}
          {user && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-[#22C55E]" />
                <h3 className="text-[#f3f2f2] font-bold text-base">A quien seguir</h3>
              </div>

              {usersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-[#0D1117] rounded-xl animate-pulse border border-[#1E2535]" />
                  ))}
                </div>
              ) : suggestedUsers.length > 0 ? (
                suggestedUsers.map((u) => {
                  const isFollowing = followingSet.has(u.id);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 bg-[#0D1117] border border-[#1E2535] p-4 rounded-xl mb-3 hover:border-[#2A3347] transition-colors"
                    >
                      <div
                        className="shrink-0 cursor-pointer"
                        onClick={() => navigate(`/u/${u.id}`)}
                      >
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold">
                            {u.name?.charAt(0) ?? 'D'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/u/${u.id}`)}>
                        <div className="text-[#f3f2f2] font-semibold text-sm truncate">{u.name ?? 'Developer'}</div>
                        {u.bio && <div className="text-[#5A6680] text-xs mt-0.5 truncate">{u.bio}</div>}
                      </div>
                      <button
                        disabled={toggleFollow.isPending}
                        onClick={() => toggleFollow.mutate({ followingId: u.id })}
                        className="shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-colors"
                        style={isFollowing ? {
                          color: '#5A6680', border: '1px solid #2A3347', background: 'transparent',
                        } : {
                          color: '#050507', background: '#e1ff00',
                        }}
                      >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#5A6680] text-sm">Sin sugerencias disponibles</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
