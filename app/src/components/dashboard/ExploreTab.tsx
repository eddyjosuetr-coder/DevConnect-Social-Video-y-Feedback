import { useState } from 'react';
import { Search, MoreHorizontal, X } from 'lucide-react';
import type { TrendingTopic, SuggestedUser } from './types';

interface ExploreTabProps {
  trendingTopics: TrendingTopic[];
  suggestedUsers: SuggestedUser[];
  followedUsers: Set<string>;
  onToggleFollow: (name: string) => void;
}

export default function ExploreTab({
  trendingTopics,
  suggestedUsers,
  followedUsers,
  onToggleFollow,
}: ExploreTabProps) {
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();

  const filteredTopics = q
    ? trendingTopics.filter(
        (t) =>
          t.tag.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
    : trendingTopics;

  const filteredUsers = q
    ? suggestedUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.handle.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q),
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

      {/* Trending Topics */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#f3f2f2] font-bold text-lg">Tendencias para ti</h3>
        {q && (
          <span className="text-xs text-[#5A6680]">
            {filteredTopics.length} resultado{filteredTopics.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filteredTopics.length > 0 ? (
        <div className="space-y-2 mb-8">
          {filteredTopics.map((t) => (
            <div
              key={t.tag}
              className="bg-[#151A27] border border-[#2A3347] p-4 rounded-xl hover:border-[#e1ff00]/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#5A6680] text-xs">{t.category} · Tendencia</div>
                  <div className="text-[#f3f2f2] font-bold capitalize mt-0.5">#{t.tag}</div>
                  <div className="text-[#5A6680] text-xs mt-1">{t.posts} posts</div>
                </div>
                <MoreHorizontal size={16} className="text-[#5A6680]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-8">
          <p className="text-[#5A6680] text-sm">No se encontraron tendencias para "{query}"</p>
        </div>
      )}

      {/* Suggested Users */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#f3f2f2] font-bold text-lg">A quien seguir</h3>
        {q && (
          <span className="text-xs text-[#5A6680]">
            {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filteredUsers.length > 0 ? (
        filteredUsers.map((u) => (
          <div
            key={u.handle}
            className="flex items-center gap-3 bg-[#151A27] border border-[#2A3347] p-4 rounded-xl mb-3 hover:border-[#2A3347]/80 transition-colors"
          >
            <img src={u.img} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-[#f3f2f2] font-semibold text-sm">{u.name}</div>
              <div className="text-[#5A6680] text-xs">{u.handle}</div>
              <div className="text-[#5A6680] text-xs mt-0.5">{u.role}</div>
            </div>
            <button
              onClick={() => onToggleFollow(u.name)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-colors shrink-0 ${
                followedUsers.has(u.name)
                  ? 'text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10'
                  : 'text-[#050507] bg-[#f3f2f2] hover:bg-white'
              }`}
            >
              {followedUsers.has(u.name) ? 'Dejar de seguir' : 'Seguir'}
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-[#5A6680] text-sm">No se encontraron usuarios para "{query}"</p>
        </div>
      )}
    </div>
  );
}
