import { useState, useEffect } from 'react';
import { Home, TrendingUp, Bell, Mail, Bookmark, User, X, LogOut } from 'lucide-react';
import type { ActiveTab } from './types';
import type { User as AuthUser } from '@db/schema';

const NAV_ITEMS = [
  { icon: Home,       label: 'Inicio',         tab: 'feed'          as ActiveTab },
  { icon: TrendingUp, label: 'Explorar',        tab: 'explore'       as ActiveTab },
  { icon: Bell,       label: 'Notificaciones',  tab: 'notifications' as ActiveTab },
  { icon: Mail,       label: 'Mensajes',        tab: 'messages'      as ActiveTab },
  { icon: Bookmark,   label: 'Guardados',       tab: 'bookmarks'     as ActiveTab },
  { icon: User,       label: 'Perfil',          tab: 'profile'       as ActiveTab },
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

function CursorBlink() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="inline-block w-0.5 h-4 ml-0.5 align-middle"
      style={{ backgroundColor: visible ? '#e1ff00' : 'transparent', transition: 'background-color 0.05s' }}
    />
  );
}

function Avatar({ user, size = 10 }: { user: AuthUser; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full object-cover`;
  return user.avatar ? (
    <img src={user.avatar} alt="" className={cls} />
  ) : (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold`}>
      {user.name?.charAt(0) ?? 'U'}
    </div>
  );
}

function NavItem({ item, active, onClick }: { item: typeof NAV_ITEMS[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full flex items-center gap-4 px-4 py-3 text-[15px] rounded-xl transition-all text-left group overflow-hidden"
      style={{
        color: active ? '#e1ff00' : '#8B9AB0',
        backgroundColor: active ? 'rgba(225,255,0,0.06)' : 'transparent',
        fontWeight: active ? 700 : 400,
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r"
          style={{ backgroundColor: '#e1ff00', boxShadow: '0 0 8px #e1ff00' }}
        />
      )}
      <item.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
      <span>{item.label}</span>
      {item.tab === 'notifications' && (
        <span className="ml-auto w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
      )}
    </button>
  );
}

export default function DashboardSidebar({
  user, activeTab, onTabChange, onCreatePost, onLogout, mobileSidebar, onCloseMobile,
}: DashboardSidebarProps) {
  const handle = user.name?.toLowerCase().replace(/\s/g, '') ?? 'dev';

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center mb-8 px-4 relative">
        <img
          src="/images/logo-solocara.png"
          alt="DevConnect"
          className="w-24 h-24 object-contain"
          style={{ filter: 'drop-shadow(0 0 18px rgba(225,255,0,0.8))' }}
        />
        {isMobile && (
          <button onClick={onCloseMobile} className="absolute right-4 text-[#5A6680] hover:text-[#f3f2f2]">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="space-y-0.5 flex-1 px-1">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            active={activeTab === item.tab}
            onClick={() => { onTabChange(item.tab); if (isMobile) onCloseMobile(); }}
          />
        ))}
      </nav>

      {/* Post Button */}
      <div className="px-4 mb-4">
        <button
          onClick={onCreatePost}
          className="w-full bg-[#e1ff00] text-[#050507] font-black py-3.5 rounded-xl text-[15px] tracking-wide transition-all hover:bg-[#f0ff4d] active:scale-95"
          style={{ boxShadow: '0 0 20px rgba(225,255,0,0.25)' }}
        >
          Postear
        </button>
      </div>

      {/* User Card */}
      <div className="mx-2 mb-2 p-3 rounded-xl border border-[#1E2535] bg-[#0A0D16] flex items-center gap-3 group cursor-pointer hover:border-[#2A3347] transition-all">
        <div className="relative shrink-0">
          <Avatar user={user} size={9} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#0A0D16]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#f3f2f2] text-sm font-semibold truncate">{user.name ?? 'Developer'}</div>
          <div className="text-[#3D4E68] text-xs font-mono truncate">@{handle}</div>
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 p-1.5 rounded-lg text-[#3D4E68] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all opacity-0 group-hover:opacity-100"
          title="Cerrar sesion"
        >
          <LogOut size={15} />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onCloseMobile}>
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-[#060911] border-r border-[#1E2535] p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent(true)}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 sticky top-0 h-screen border-r border-[#1E2535] py-5 bg-[#060911]">
        {sidebarContent(false)}
      </aside>
    </>
  );
}
