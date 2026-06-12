import { Search, MoreHorizontal } from 'lucide-react';
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
  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A6680]" />
          <input
            type="text"
            placeholder="Buscar desarrolladores, hashtags..."
            className="w-full bg-[#151A27] border border-[#2A3347] text-[#f3f2f2] pl-12 pr-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#5A6680] rounded-xl"
          />
        </div>
      </div>

      <h3 className="text-[#f3f2f2] font-bold text-lg mb-4">Tendencias para ti</h3>
      <div className="space-y-2 mb-8">
        {trendingTopics.map((t) => (
          <div key={t.tag} className="bg-[#151A27] border border-[#2A3347] p-4 rounded-xl hover:border-[#e1ff00]/20 transition-all cursor-pointer">
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

      <h3 className="text-[#f3f2f2] font-bold text-lg mb-4">A quien seguir</h3>
      {suggestedUsers.map((u) => (
        <div key={u.handle} className="flex items-center gap-3 bg-[#151A27] border border-[#2A3347] p-4 rounded-xl mb-3">
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
      ))}
    </div>
  );
}
