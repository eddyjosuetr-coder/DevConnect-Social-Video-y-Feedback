import { useState } from 'react';
import { Bell, Code2, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { trpc } from '@/providers/trpc';
import ToastContainer from '@/components/ToastContainer';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardRightSidebar from '@/components/dashboard/DashboardRightSidebar';
import CreatePostForm from '@/components/dashboard/CreatePostForm';
import PostCard from '@/components/dashboard/PostCard';
import ExploreTab from '@/components/dashboard/ExploreTab';
import { TRENDING_TOPICS, SUGGESTED_USERS, type ActiveTab } from '@/components/dashboard/types';

const TAB_LABELS: Record<ActiveTab, string> = {
  feed: 'Inicio',
  explore: 'Explorar',
  notifications: 'Notificaciones',
  messages: 'Mensajes',
};

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth({ redirectOnUnauthenticated: true, redirectPath: '/login' });
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const { data: postsList, isLoading: postsLoading } = trpc.posts.list.useQuery();

  const toggleFollow = (name: string) => {
    setFollowedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); addToast(`Dejaste de seguir a ${name}`, 'info'); }
      else { next.add(name); addToast(`Ahora sigues a ${name}`, 'success'); }
      return next;
    });
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
    <div className="min-h-screen bg-[#050507] flex">
      <DashboardSidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setShowCreatePost(true)}
        onLogout={logout}
        mobileSidebar={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <main className="flex-1 min-w-0 border-r border-[#2A3347]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#2A3347] sticky top-0 bg-[#050507]/95 backdrop-blur-sm z-30">
          <button onClick={() => setMobileSidebar(true)}>
            <Hash size={20} className="text-[#f3f2f2]" />
          </button>
          <img src="/images/logo.png" alt="DevConnect" className="w-7 h-7" />
          <div className="w-8 h-8 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold text-xs">
            {user.name?.charAt(0) ?? 'U'}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-[#2A3347] sticky top-0 bg-[#050507]/95 backdrop-blur-sm z-30">
          <h2 className="text-[#f3f2f2] font-bold text-xl">{TAB_LABELS[activeTab]}</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Create Post Prompt */}
          {!showCreatePost && activeTab === 'feed' && (
            <div className="border-b border-[#2A3347] p-4 flex items-start gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold shrink-0">
                  {user.name?.charAt(0) ?? 'U'}
                </div>
              )}
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex-1 text-left text-[#5A6680] hover:text-[#8B9AB0] transition-colors py-2.5"
              >
                Que estas codificando hoy?
              </button>
            </div>
          )}

          {showCreatePost && activeTab === 'feed' && (
            <CreatePostForm user={user} onClose={() => setShowCreatePost(false)} addToast={addToast} />
          )}

          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <div>
              {postsLoading && (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-[#e1ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[#5A6680] font-mono text-sm">Cargando posts...</p>
                </div>
              )}
              {!postsLoading && postsList?.length === 0 && (
                <div className="text-center py-20">
                  <Code2 size={48} className="text-[#2A3347] mx-auto mb-4" />
                  <p className="text-[#5A6680] text-lg mb-2">No hay posts todavia</p>
                  <p className="text-[#5A6680] text-sm mb-6">Se el primero en compartir algo!</p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-[#e1ff00] text-[#050507] font-bold px-6 py-3 rounded-full hover:bg-[#d4e600]"
                  >
                    Crear primer post
                  </button>
                </div>
              )}
              {postsList?.map((post) => (
                <PostCard key={post.id} post={post} addToast={addToast} />
              ))}
            </div>
          )}

          {/* Explore Tab */}
          {activeTab === 'explore' && (
            <ExploreTab
              trendingTopics={TRENDING_TOPICS}
              suggestedUsers={SUGGESTED_USERS}
              followedUsers={followedUsers}
              onToggleFollow={toggleFollow}
            />
          )}

          {/* Notifications / Messages */}
          {(activeTab === 'notifications' || activeTab === 'messages') && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#151A27] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={28} className="text-[#2A3347]" />
              </div>
              <p className="text-[#5A6680] text-lg">
                {activeTab === 'notifications' ? 'Sin notificaciones nuevas' : 'Sin mensajes nuevos'}
              </p>
              <p className="text-[#5A6680] text-sm mt-2">
                Cuando alguien interactue contigo, aparecera aqui
              </p>
            </div>
          )}
        </div>
      </main>

      <DashboardRightSidebar
        trendingTopics={TRENDING_TOPICS}
        suggestedUsers={SUGGESTED_USERS}
        followedUsers={followedUsers}
        onToggleFollow={toggleFollow}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
