import { Home, TrendingUp, Bell, Mail, Bookmark, User, X, LogOut } from 'lucide-react';
import type { ActiveTab } from './types';
import type { User as AuthUser } from '@db/schema';

const NAV_ITEMS = [
  { icon: Home, label: 'Inicio', tab: 'feed' as ActiveTab },
  { icon: TrendingUp, label: 'Explorar', tab: 'explore' as ActiveTab },
  { icon: Bell, label: 'Notificaciones', tab: 'notifications' as ActiveTab },
  { icon: Mail, label: 'Mensajes', tab: 'messages' as ActiveTab },
  { icon: Bookmark, label: 'Guardados', tab: null },
  { icon: User, label: 'Perfil', tab: null },
];

interface DashboardSidebarProps {
  user: AuthUser;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onCreatePost: () => void;
  onLogout: () => void;
  mobileSidebar: boolean;
  onCloseMobile: () => void;
}

function Avatar({ user }: { user: AuthUser }) {
  return user.avatar ? (
    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold">
      {user.name?.charAt(0) ?? 'U'}
    </div>
  );
}

export default function DashboardSidebar({
  user, activeTab, onTabChange, onCreatePost, onLogout, mobileSidebar, onCloseMobile,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={onCloseMobile}>
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-[#050507] border-r border-[#2A3347] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="DevConnect" className="w-7 h-7" />
                <span className="text-[#f3f2f2] font-bold">DevConnect</span>
              </div>
              <button onClick={onCloseMobile}><X size={20} className="text-[#5A6680]" /></button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { if (item.tab) { onTabChange(item.tab); onCloseMobile(); } }}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors ${
                    activeTab === item.tab
                      ? 'text-[#e1ff00] bg-[#e1ff00]/10 font-medium'
                      : 'text-[#8B9AB0] hover:bg-[#1E2535] hover:text-[#f3f2f2]'
                  }`}
                >
                  <item.icon size={20} />{item.label}
                </button>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-[#2A3347]">
              <div className="flex items-center gap-3 px-3 mb-4">
                <Avatar user={user} />
                <div>
                  <div className="text-[#f3f2f2] text-sm font-medium">{user.name ?? 'Developer'}</div>
                  <div className="text-[#5A6680] text-xs">@{user.name?.toLowerCase().replace(/\s/g, '') ?? 'dev'}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#5A6680] hover:text-[#EF4444] transition-colors"
              >
                <LogOut size={18} />Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 sticky top-0 h-screen border-r border-[#2A3347] px-3 py-4">
        <div className="flex items-center gap-2 mb-6 px-3">
          <img src="/images/logo.png" alt="DevConnect" className="w-8 h-8" />
          <span className="text-[#f3f2f2] font-bold text-lg">DevConnect</span>
        </div>
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => item.tab && onTabChange(item.tab)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-[15px] rounded-xl transition-colors text-left ${
                activeTab === item.tab ? 'text-[#e1ff00] font-bold' : 'text-[#f3f2f2] hover:bg-[#1E2535]'
              }`}
            >
              <item.icon size={24} strokeWidth={activeTab === item.tab ? 2.5 : 1.5} />
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onCreatePost}
          className="mx-3 mb-4 bg-[#e1ff00] text-[#050507] font-bold py-3.5 rounded-full hover:bg-[#d4e600] transition-colors text-[15px]"
        >
          Postear
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm text-[#5A6680] hover:text-[#EF4444] transition-colors rounded-xl"
        >
          <LogOut size={20} />Cerrar sesion
        </button>
      </aside>
    </>
  );
}
