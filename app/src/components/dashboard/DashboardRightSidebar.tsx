import { useState } from 'react';
import { Search, X, Flame, Zap } from 'lucide-react';
import type { TrendingTopic, SuggestedUser } from './types';

interface DashboardRightSidebarProps {
  trendingTopics: TrendingTopic[];
  suggestedUsers: SuggestedUser[];
  followedUsers: Set<string>;
  onToggleFollow: (name: string) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}

const HEAT_COLORS = ['#e1ff00', '#00ffff', '#3B82F6', '#A855F7', '#EF4444'];
const MAX_POSTS = 5100;

export default function DashboardRightSidebar({
  trendingTopics,
  suggestedUsers,
  followedUsers,
  onToggleFollow,
  searchQuery,
  onSearch,
}: DashboardRightSidebarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

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

        {/* Upgrade Card */}
        <div className="rounded-xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0D1117 0%, #0A0D16 100%)', border: '1px solid #1E2535' }}>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #e1ff00 20px, #e1ff00 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, #e1ff00 20px, #e1ff00 21px)',
          }} />
          <div className="relative p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap size={14} className="text-[#e1ff00]" strokeWidth={2.5} />
              <span className="text-xs font-mono text-[#e1ff00] tracking-widest uppercase">Pro</span>
            </div>
            <h3 className="text-[#f3f2f2] font-bold text-[15px] mb-1">DevConnect Pro</h3>
            <p className="text-[#5A6680] text-xs leading-relaxed mb-3">
              Insignia verificada, analytics avanzados y acceso anticipado a nuevas funciones.
            </p>
            <button
              className="w-full text-[#050507] font-black py-2 rounded-lg text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#e1ff00', boxShadow: '0 0 16px rgba(225,255,0,0.3)' }}
            >
              Activar Pro
            </button>
          </div>
        </div>

        {/* Trending */}
        <div className="rounded-xl bg-[#0D1117] border border-[#1E2535] overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Flame size={15} className="text-[#EF4444]" />
            <h3 className="text-[#f3f2f2] font-bold text-[15px]">Tendencias</h3>
          </div>
          {trendingTopics.map((t, i) => {
            const postNum = parseInt(t.posts.replace(/\D/g, ''), 10) || 0;
            const pct = Math.round((postNum / MAX_POSTS) * 100);
            const color = HEAT_COLORS[i % HEAT_COLORS.length];
            return (
              <div
                key={t.tag}
                className="px-4 py-3 cursor-pointer transition-colors hover:bg-[#ffffff04] group/trend"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="text-[#3D4E68] text-[10px] font-mono uppercase tracking-wider">{t.category}</div>
                    <div className="text-[#f3f2f2] font-bold text-sm group-hover/trend:text-[#e1ff00] transition-colors">#{t.tag}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#5A6680] text-xs font-mono">{t.posts}</div>
                    <div className="text-[#3D4E68] text-[10px]">posts</div>
                  </div>
                </div>
                <div className="h-0.5 bg-[#1E2535] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggested Users */}
        <div className="rounded-xl bg-[#0D1117] border border-[#1E2535] overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-[#f3f2f2] font-bold text-[15px]">A quien seguir</h3>
          </div>
          {suggestedUsers.map((u) => {
            const following = followedUsers.has(u.name);
            return (
              <div
                key={u.handle}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#ffffff04] transition-colors"
              >
                <div className="relative shrink-0">
                  <img src={u.img} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#0D1117]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#f3f2f2] font-semibold text-sm truncate leading-tight">{u.name}</div>
                  <div className="text-[#3D4E68] text-xs font-mono">{u.handle}</div>
                  <div className="text-[#5A6680] text-[10px] mt-0.5">{u.role}</div>
                </div>
                <button
                  onClick={() => onToggleFollow(u.name)}
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={following ? {
                    color: '#5A6680',
                    border: '1px solid #1E2535',
                    background: 'transparent',
                  } : {
                    color: '#050507',
                    background: '#e1ff00',
                    boxShadow: '0 0 12px rgba(225,255,0,0.2)',
                  }}
                >
                  {following ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            );
          })}
        </div>

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
