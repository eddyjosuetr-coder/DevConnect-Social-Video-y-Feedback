import { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { trpc } from '@/providers/trpc';
import ToastContainer from '@/components/ToastContainer';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardRightSidebar from '@/components/dashboard/DashboardRightSidebar';
import CreatePostForm from '@/components/dashboard/CreatePostForm';
import PostCard from '@/components/dashboard/PostCard';
import ExploreTab from '@/components/dashboard/ExploreTab';
import NotificationsTab from '@/components/dashboard/NotificationsTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import BookmarksTab from '@/components/dashboard/BookmarksTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import { TRENDING_TOPICS, SUGGESTED_USERS, type ActiveTab } from '@/components/dashboard/types';

const TAB_LABELS: Record<ActiveTab, string> = {
  feed:          'Inicio',
  explore:       'Explorar',
  notifications: 'Notificaciones',
  messages:      'Mensajes',
  bookmarks:     'Guardados',
  profile:       'Perfil',
};

const PAGE_SIZE = 10;
const STORAGE_KEY = 'devconnect_saved_posts';

function loadSavedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set<number>(JSON.parse(raw) as number[]);
  } catch {}
  return new Set<number>();
}

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth({ redirectOnUnauthenticated: true, redirectPath: '/login' });
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab,    setActiveTab]    = useState<ActiveTab>('feed');
  const [showPost,     setShowPost]     = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [searchQuery,   setSearchQuery]   = useState('');
  const [visibleCount,  setVisibleCount]  = useState(PAGE_SIZE);
  const [savedPostIds,  setSavedPostIds]  = useState<Set<number>>(loadSavedIds);

  const { data: postsList, isLoading: postsLoading } = trpc.posts.list.useQuery();

  // Persist bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedPostIds]));
  }, [savedPostIds]);

  // Reset pagination when search changes or tab changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery, activeTab]);

  const toggleFollow = (name: string) => {
    setFollowedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); addToast(`Dejaste de seguir a ${name}`, 'info'); }
      else { next.add(name); addToast(`Ahora sigues a ${name}`, 'success'); }
      return next;
    });
  };

  const handleToggleSave = (postId: number) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q && activeTab !== 'feed') setActiveTab('feed');
  };

  const allPosts = postsList ?? [];

  const filteredPosts = searchQuery.trim()
    ? allPosts.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.content?.toLowerCase().includes(q) ||
          p.authorName?.toLowerCase().includes(q) ||
          p.tags?.toLowerCase().includes(q) ||
          p.codeLanguage?.toLowerCase().includes(q)
        );
      })
    : allPosts;

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

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
      />

      <main className="flex-1 min-w-0 border-r border-[#1E2535]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#1E2535] sticky top-0 bg-[#060911]/95 backdrop-blur-sm z-30">
          <button onClick={() => setMobileSidebar(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#f3f2f2]">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <img src="/images/logo.png" alt="DevConnect" className="w-7 h-7" />
          <div className="w-8 h-8 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold text-xs">
            {user.name?.charAt(0) ?? 'U'}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between px-5 py-3.5 border-b border-[#1E2535] sticky top-0 bg-[#060911]/95 backdrop-blur-sm z-30">
          <div className="flex items-center gap-2">
            <h2 className="text-[#f3f2f2] font-black text-lg tracking-tight">{TAB_LABELS[activeTab]}</h2>
          </div>
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

              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  addToast={addToast}
                  isSaved={savedPostIds.has(post.id)}
                  onToggleSave={() => handleToggleSave(post.id)}
                />
              ))}

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
          {activeTab === 'explore' && (
            <ExploreTab
              trendingTopics={TRENDING_TOPICS}
              suggestedUsers={SUGGESTED_USERS}
              followedUsers={followedUsers}
              onToggleFollow={toggleFollow}
            />
          )}

          {/* ── NOTIFICATIONS TAB ────────────────────────────── */}
          {activeTab === 'notifications' && <NotificationsTab />}

          {/* ── MESSAGES TAB ─────────────────────────────────── */}
          {activeTab === 'messages' && <MessagesTab />}

          {/* ── BOOKMARKS TAB ────────────────────────────────── */}
          {activeTab === 'bookmarks' && (
            <BookmarksTab
              postsList={allPosts}
              savedPostIds={savedPostIds}
              onToggleSave={handleToggleSave}
              addToast={addToast}
            />
          )}

          {/* ── PROFILE TAB ──────────────────────────────────── */}
          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              postsList={allPosts}
              savedPostIds={savedPostIds}
              onToggleSave={handleToggleSave}
              addToast={addToast}
            />
          )}
        </div>
      </main>

      <DashboardRightSidebar
        trendingTopics={TRENDING_TOPICS}
        suggestedUsers={SUGGESTED_USERS}
        followedUsers={followedUsers}
        onToggleFollow={toggleFollow}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
