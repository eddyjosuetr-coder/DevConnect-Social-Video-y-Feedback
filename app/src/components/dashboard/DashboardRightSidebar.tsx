import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, Flame, Hash } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import type { Toast } from '@/hooks/useToast';

interface DashboardRightSidebarProps {
  searchQuery: string;
  onSearch: (q: string) => void;
  addToast: (message: string, type: Toast['type']) => void;
}

const HEAT_COLORS = ['#e1ff00', '#00ffff', '#3B82F6', '#A855F7', '#EF4444'];

export default function DashboardRightSidebar({ searchQuery, onSearch, addToast }: DashboardRightSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const utils = trpc.useUtils();

  const { data: trendingTags = [] } = trpc.users.trendingTags.useQuery(
    { limit: 5 },
    { staleTime: 5 * 60 * 1000 },
  );

  const { data: suggestedUsers = [] } = trpc.users.suggestedUsers.useQuery(
    { limit: 4 },
    { enabled: !!user, staleTime: 5 * 60 * 1000 },
  );

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

  const maxCount = trendingTags[0]?.count ?? 1;

  return (
    <aside className="hidden xl:flex flex-col w-96 sticky top-0 h-screen overflow-y-auto bg-[#060911] border-l border-[#1E2535]">
      <div className="p-4 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: searchFocused ? '#e1ff00' : '#3D4E68' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar en el feed..."
            className="w-full bg-[#0D1117] text-[#f3f2f2] pl-10 pr-10 py-2.5 text-sm outline-none placeholder:text-[#3D4E68] rounded-lg transition-all font-mono"
            style={{
              border: `1px solid ${searchFocused ? '#e1ff0040' : '#1E2535'}`,
              boxShadow: searchFocused ? '0 0 0 3px rgba(225,255,0,0.06)' : 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D4E68] hover:text-[#f3f2f2] transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Trending Tags */}
        {trendingTags.length > 0 && (
          <div className="rounded-xl bg-[#0D1117] border border-[#1E2535] overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Flame size={15} className="text-[#EF4444]" />
              <h3 className="text-[#f3f2f2] font-bold text-[15px]">Tendencias</h3>
            </div>
            {trendingTags.map((t, i) => {
              const pct = Math.round((t.count / maxCount) * 100);
              const color = HEAT_COLORS[i % HEAT_COLORS.length];
              return (
                <button
                  key={t.tag}
                  onClick={() => navigate(`/tag/${t.tag}`)}
                  className="w-full px-4 py-3 cursor-pointer transition-colors hover:bg-[#ffffff04] group/trend text-left"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="text-[#3D4E68] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
                        <Hash size={9} />
                        tendencia
                      </div>
                      <div className="text-[#f3f2f2] font-bold text-sm group-hover/trend:text-[#e1ff00] transition-colors">
                        #{t.tag}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#5A6680] text-xs font-mono">{t.count}</div>
                      <div className="text-[#3D4E68] text-[10px]">posts</div>
                    </div>
                  </div>
                  <div className="h-0.5 bg-[#1E2535] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Suggested Users */}
        {user && suggestedUsers.length > 0 && (
          <div className="rounded-xl bg-[#0D1117] border border-[#1E2535] overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[#f3f2f2] font-bold text-[15px]">A quien seguir</h3>
            </div>
            {suggestedUsers.map((u) => {
              const isFollowing = followingSet.has(u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#ffffff04] transition-colors"
                >
                  <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/u/${u.id}`)}>
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-sm">
                        {u.name?.charAt(0) ?? 'D'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#0D1117]" />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/u/${u.id}`)}>
                    <div className="text-[#f3f2f2] font-semibold text-sm truncate leading-tight">
                      {u.name ?? 'Developer'}
                    </div>
                    {u.bio && <div className="text-[#5A6680] text-[10px] mt-0.5 truncate">{u.bio}</div>}
                  </div>
                  <button
                    disabled={toggleFollow.isPending}
                    onClick={() => toggleFollow.mutate({ followingId: u.id })}
                    className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
                    style={isFollowing ? {
                      color: '#5A6680',
                      border: '1px solid #1E2535',
                      background: 'transparent',
                    } : {
                      color: '#050507',
                      background: '#e1ff00',
                      boxShadow: '0 0 12px rgba(225,255,0,0.2)',
                    }}
                  >
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-1 pb-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
            {['Terminos', 'Privacidad', 'Cookies', 'Info'].map((l) => (
              <span key={l} className="text-[10px] text-[#3D4E68] hover:text-[#5A6680] cursor-pointer font-mono transition-colors">{l}</span>
            ))}
          </div>
          <p className="text-[10px] text-[#2A3347] font-mono">&copy; 2026 DevConnect Corp.</p>
        </div>

      </div>
    </aside>
  );
}
