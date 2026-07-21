import { useState, useEffect, useRef } from 'react';
import { Code2 } from 'lucide-react';
import { useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { trpc } from '@/providers/trpc';
import ToastContainer from '@/components/ToastContainer';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardRightSidebar from '@/components/dashboard/DashboardRightSidebar';
import CreatePostForm from '@/components/dashboard/CreatePostForm';
import PostCard from '@/components/dashboard/PostCard';
import SharedPostCard from '@/components/dashboard/SharedPostCard';
import ExploreTab from '@/components/dashboard/ExploreTab';
import NotificationsTab from '@/components/dashboard/NotificationsTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import BookmarksTab from '@/components/dashboard/BookmarksTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import AdminPanel from '@/components/dashboard/AdminPanel';
import type { ActiveTab } from '@/components/dashboard/types';

const TAB_LABELS: Record<ActiveTab, string> = {
  feed:          'Inicio',
  explore:       'Explorar',
  notifications: 'Notificaciones',
  messages:      'Mensajes',
  bookmarks:     'Guardados',
  profile:       'Perfil',
  admin:         'Panel Admin',
};

const PAGE_SIZE = 10;

type MessagePartner = { id: number; name: string | null; avatar: string | null };

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth({ redirectOnUnauthenticated: true, redirectPath: '/' });
  const { toasts, addToast, removeToast } = useToast();
  const location = useLocation();
  const utils = trpc.useUtils();

  const [activeTab,       setActiveTab]       = useState<ActiveTab>('feed');
  const [initialPartner,  setInitialPartner]  = useState<MessagePartner | null>(null);
  const handledState = useRef(false);
  const [showPost,       setShowPost]       = useState(false);
  const [mobileSidebar,  setMobileSidebar]  = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [visibleCount,   setVisibleCount]   = useState(PAGE_SIZE);

  // ── Data queries ──────────────────────────────────────────────────────────
  const { data: feedPosts = [], isLoading: postsLoading } = trpc.posts.feed.useQuery(
    undefined,
    { refetchInterval: 15000, enabled: !!user },
  );

  const { data: unreadNotifCount = 0 } = trpc.notifications.unreadCount.useQuery(
    undefined,
    { refetchInterval: 15000, enabled: !!user },
  );

  const { data: unreadMsgCount = 0 } = trpc.messages.totalUnread.useQuery(
    undefined,
    { refetchInterval: 15000, enabled: !!user },
  );

  const { data: bookmarkedIds = [] } = trpc.bookmarks.bookmarkedIds.useQuery(
    undefined,
    { enabled: !!user },
  );
  const bookmarkedSet = new Set<number>(bookmarkedIds);

  const toggleBookmark = trpc.bookmarks.toggle.useMutation({
    onSuccess: () => {
      void utils.bookmarks.bookmarkedIds.invalidate();
      void utils.bookmarks.list.invalidate();
    },
  });

  // ── Navigation state ──────────────────────────────────────────────────────
  useEffect(() => {
    if (handledState.current) return;
    const state = location.state as { openMessages?: boolean; partner?: MessagePartner } | null;
    if (state?.openMessages && state?.partner) {
      handledState.current = true;
      setActiveTab('messages');
      setInitialPartner(state.partner);
    }
  }, [location.state]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery, activeTab]);

  // ── Feed filtering ─────────────────────────────────────────────────────────
  const filteredPosts = searchQuery.trim()
    ? feedPosts.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.content?.toLowerCase().includes(q) ||
          p.authorName?.toLowerCase().includes(q) ||
          p.tags?.toLowerCase().includes(q) ||
          p.codeLanguage?.toLowerCase().includes(q)
        );
      })
    : feedPosts;

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q && activeTab !== 'feed') setActiveTab('feed');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e1ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5A6680] font-mono text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#060911] flex">
      <DashboardSidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setShowPost(true)}
        onLogout={logout}
        mobileSidebar={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
        unreadNotifCount={unreadNotifCount}
        unreadMsgCount={unreadMsgCount}
      />

      <main className="flex-1 min-w-0 border-r border-[#1E2535]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#1E2535] sticky top-0 bg-[#060911]/95 backdrop-blur-sm z-30">
          <button onClick={() => setMobileSidebar(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#f3f2f2]">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <img src="/images/logo-solocara.png" alt="DevConnect" className="w-7 h-7 object-contain" style={{ filter: 'drop-shadow(0 0 6px rgba(225,255,0,0.6))' }} />
          <div className="w-8 h-8 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold text-xs">
            {user.name?.charAt(0) ?? 'U'}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between px-5 py-3.5 border-b border-[#1E2535] sticky top-0 bg-[#060911]/95 backdrop-blur-sm z-30">
          <h2 className="text-[#f3f2f2] font-black text-lg tracking-tight">{TAB_LABELS[activeTab]}</h2>
          {searchQuery && activeTab === 'feed' && (
            <span className="text-xs text-[#5A6680]">
              {filteredPosts.length} resultado{filteredPosts.length !== 1 ? 's' : ''} para &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        <div className="max-w-2xl mx-auto">

          {/* ── FEED TAB ─────────────────────────────────────── */}
          {activeTab === 'feed' && (
            <>
              {!showPost && (
                <div className="border-b border-[#2A3347] p-4 flex items-start gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold shrink-0">
                      {user.name?.charAt(0) ?? 'U'}
                    </div>
                  )}
                  <button
                    onClick={() => setShowPost(true)}
                    className="flex-1 text-left text-[#5A6680] hover:text-[#8B9AB0] transition-colors py-2.5"
                  >
                    Que estas codificando hoy?
                  </button>
                </div>
              )}

              {showPost && (
                <CreatePostForm user={user} onClose={() => setShowPost(false)} addToast={addToast} />
              )}

              {postsLoading && (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-[#e1ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[#5A6680] font-mono text-sm">Cargando posts...</p>
                </div>
              )}

              {!postsLoading && filteredPosts.length === 0 && !searchQuery && (
                <div className="text-center py-20">
                  <Code2 size={48} className="text-[#2A3347] mx-auto mb-4" />
                  <p className="text-[#5A6680] text-lg mb-2">No hay posts todavia</p>
                  <p className="text-[#5A6680] text-sm mb-6">Se el primero en compartir algo!</p>
                  <button
                    onClick={() => setShowPost(true)}
                    className="bg-[#e1ff00] text-[#050507] font-bold px-6 py-3 rounded-full hover:bg-[#d4e600]"
                  >
                    Crear primer post
                  </button>
                </div>
              )}

              {!postsLoading && filteredPosts.length === 0 && searchQuery && (
                <div className="text-center py-20">
                  <p className="text-[#5A6680] text-lg mb-1">Sin resultados</p>
                  <p className="text-[#5A6680] text-sm">No hay posts que coincidan con &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}

              {visiblePosts.map((item) =>
                item.isRepostEntry ? (
                  <SharedPostCard
                    key={`r-${item.repostId ?? item.id}`}
                    repostId={item.repostId!}
                    repostCreatedAt={item.repostCreatedAt!}
                    quoteText={item.quoteText ?? null}
                    post={item}
                    reposterName={item.reposterName ?? null}
                    reposterAvatar={item.reposterAvatar ?? null}
                    addToast={addToast}
                  />
                ) : (
                  <PostCard
                    key={`p-${item.id}`}
                    post={item}
                    addToast={addToast}
                    isSaved={bookmarkedSet.has(item.id)}
                    onToggleSave={() => toggleBookmark.mutate({ postId: item.id })}
                  />
                )
              )}

              {hasMore && (
                <div className="py-6 text-center border-b border-[#2A3347]">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="px-6 py-2.5 border border-[#2A3347] text-[#8B9AB0] text-sm font-semibold rounded-full hover:border-[#e1ff00]/30 hover:text-[#e1ff00] transition-colors"
                  >
                    Cargar más posts ({filteredPosts.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── EXPLORE TAB ──────────────────────────────────── */}
          {activeTab === 'explore' && <ExploreTab addToast={addToast} />}

          {/* ── NOTIFICATIONS TAB ────────────────────────────── */}
          {activeTab === 'notifications' && <NotificationsTab />}

          {/* ── MESSAGES TAB ─────────────────────────────────── */}
          {activeTab === 'messages' && (
            <MessagesTab
              initialPartner={initialPartner}
              onPartnerConsumed={() => setInitialPartner(null)}
            />
          )}

          {/* ── BOOKMARKS TAB ────────────────────────────────── */}
          {activeTab === 'bookmarks' && <BookmarksTab addToast={addToast} />}

          {/* ── PROFILE TAB ──────────────────────────────────── */}
          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              savedPostIds={bookmarkedSet}
              onToggleSave={(postId) => toggleBookmark.mutate({ postId })}
              addToast={addToast}
            />
          )}

          {/* ── ADMIN TAB ────────────────────────────────────── */}
          {activeTab === 'admin' && user.role === 'admin' && <AdminPanel />}
        </div>
      </main>

      <DashboardRightSidebar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        addToast={addToast}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
