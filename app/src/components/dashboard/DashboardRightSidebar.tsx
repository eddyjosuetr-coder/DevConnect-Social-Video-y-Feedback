import { Search } from 'lucide-react';
import type { TrendingTopic, SuggestedUser } from './types';

interface DashboardRightSidebarProps {
  trendingTopics: TrendingTopic[];
  suggestedUsers: SuggestedUser[];
  followedUsers: Set<string>;
  onToggleFollow: (name: string) => void;
}

export default function DashboardRightSidebar({
  trendingTopics,
  suggestedUsers,
  followedUsers,
  onToggleFollow,
}: DashboardRightSidebarProps) {
  return (
    <aside className="hidden xl:block w-96 sticky top-0 h-screen p-4 overflow-y-auto">
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A6680]" />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full bg-[#151A27] border border-[#2A3347] text-[#f3f2f2] pl-12 pr-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#5A6680] rounded-xl"
        />
      </div>

      <div className="bg-[#151A27] border border-[#2A3347] rounded-xl p-4 mb-4">
        <h3 className="text-[#f3f2f2] font-bold text-lg mb-3">Suscripcion a DevConnect</h3>
        <p className="text-[#5A6680] text-sm mb-4">
          Suscribete para desbloquear nuevas funciones y recibir una insignia verificada.
        </p>
        <button className="bg-[#e1ff00] text-[#050507] font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#d4e600] transition-colors w-full">
          Suscribirse
        </button>
      </div>

      <div className="bg-[#151A27] border border-[#2A3347] rounded-xl p-4 mb-4">
        <h3 className="text-[#f3f2f2] font-bold text-lg mb-3">Tendencias</h3>
        {trendingTopics.map((t, i) => (
          <div key={t.tag} className={`py-3 ${i < trendingTopics.length - 1 ? 'border-b border-[#2A3347]/50' : ''}`}>
            <div className="text-[#5A6680] text-xs">{t.category} · Tendencia</div>
            <div className="text-[#f3f2f2] font-bold capitalize text-sm mt-0.5">#{t.tag}</div>
            <div className="text-[#5A6680] text-xs mt-0.5">{t.posts} posts</div>
          </div>
        ))}
      </div>

      <div className="bg-[#151A27] border border-[#2A3347] rounded-xl p-4">
        <h3 className="text-[#f3f2f2] font-bold text-lg mb-3">A quien seguir</h3>
        {suggestedUsers.map((u) => (
          <div key={u.handle} className="flex items-center gap-3 py-3">
            <img src={u.img} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-[#f3f2f2] font-semibold text-sm truncate">{u.name}</div>
              <div className="text-[#5A6680] text-xs">{u.handle}</div>
            </div>
            <button
              onClick={() => onToggleFollow(u.name)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors shrink-0 ${
                followedUsers.has(u.name)
                  ? 'text-[#5A6680] border border-[#5A6680]/30'
                  : 'text-[#050507] bg-[#f3f2f2] hover:bg-white'
              }`}
            >
              {followedUsers.has(u.name) ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 px-2">
        {['Terminos', 'Privacidad', 'Cookies', 'Accesibilidad', 'Anuncios', 'Info', 'Blog'].map((l) => (
          <span key={l} className="text-xs text-[#5A6680] hover:underline cursor-pointer">{l}</span>
        ))}
      </div>
      <p className="text-xs text-[#5A6680] mt-2 px-2">&copy; 2026 DevConnect Corp.</p>
    </aside>
  );
}
