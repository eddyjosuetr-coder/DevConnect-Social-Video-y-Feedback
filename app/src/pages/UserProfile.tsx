import { useState, useId } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, UserCheck, UserPlus, Verified, LayoutGrid, MessageSquare, Repeat2 } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import PostCard from '@/components/dashboard/PostCard';
import SharedPostCard from '@/components/dashboard/SharedPostCard';
import ToastContainer from '@/components/ToastContainer';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import FollowersModal from '@/components/dashboard/FollowersModal';
import type { User as AuthUser } from '@db/schema';

// ── Color palette per user id ─────────────────────────────────────────────────
const PALETTES: Array<[string, string]> = [
  ['#e1ff00', '#00ffff'],
  ['#3B82F6', '#8B5CF6'],
  ['#F59E0B', '#F97316'],
  ['#10B981', '#06B6D4'],
  ['#EC4899', '#8B5CF6'],
  ['#06B6D4', '#6366F1'],
];
function palette(id: number): [string, string] {
  return PALETTES[id % PALETTES.length];
}

// ── DefaultBanner SVG ─────────────────────────────────────────────────────────
function DefaultBanner({ userId, color }: { userId: number; color: string }) {
  const uid = useId().replace(/:/g, '');
  const pid = `p${uid}`;
  const gid = `g${uid}`;
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={pid} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill={color} opacity="0.2" />
        </pattern>
        <radialGradient id={gid} cx="70%" cy="30%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="#08101F" />
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
      <rect width="100%" height="100%" fill={`url(#${gid})`} />
      {/* Subtle horizontal scan lines */}
      {[0.25, 0.5, 0.75].map((y, i) => (
        <line
          key={i}
          x1="0" y1={`${y * 100}%`}
          x2="100%" y2={`${y * 100}%`}
          stroke={color} strokeOpacity="0.04" strokeWidth="1"
        />
      ))}
    </svg>
  );
}

// ── Avatar with animated conic ring ──────────────────────────────────────────
function AvatarRing({
  src, name, colors, size = 80,
}: {
  src: string | null;
  name: string | null;
  colors: [string, string];
  size?: number;
}) {
  const [c1, c2] = colors;
  return (
    <div
      style={{
        padding: 3,
        background: `conic-gradient(from 0deg, ${c1}, ${c2}, ${c1})`,
        borderRadius: '50%',
        boxShadow: `0 0 0 3px #060911, 0 0 22px ${c1}44`,
        animation: 'ring-spin 10s linear infinite',
        width: size + 12,
        height: size + 12,
        flexShrink: 0,
      }}
    >
      <div style={{ padding: 3, background: '#060911', borderRadius: '50%' }}>
        {src ? (
          <img
            src={src} alt=""
            className="rounded-full object-cover block"
            style={{ width: size, height: size }}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center font-black text-[#050507]"
            style={{
              width: size, height: size,
              fontSize: size * 0.36,
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
            }}
          >
            {(name ?? 'D').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Follow / Unfollow button ──────────────────────────────────────────────────
function FollowButton({
  isFollowing, loading, onClick,
}: {
  isFollowing: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);

  const base = 'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 select-none';

  if (isFollowing) {
    return (
      <button
        onClick={onClick}
        disabled={loading}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className={base}
        style={{
          border: `1.5px solid ${hov ? '#EF4444' : 'rgba(225,255,0,0.4)'}`,
          color: hov ? '#EF4444' : '#e1ff00',
          background: hov ? 'rgba(239,68,68,0.06)' : 'transparent',
          minWidth: 120,
        }}
      >
        {hov ? <UserPlus size={14} /> : <UserCheck size={14} />}
        {hov ? 'Dejar de seguir' : 'Siguiendo'}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={base}
      style={{
        background: '#e1ff00',
        color: '#050507',
        boxShadow: '0 0 16px rgba(225,255,0,0.3)',
        opacity: loading ? 0.7 : 1,
        minWidth: 88,
      }}
    >
      <UserPlus size={14} />
      Seguir
    </button>
  );
}

// ── StatItem ──────────────────────────────────────────────────────────────────
function StatItem({ value, label, onClick }: { value: number; label: string; onClick?: () => void }) {
  if (onClick) {
    return (
      <button onClick={onClick} className="flex items-baseline gap-1.5 hover:opacity-70 transition-opacity">
        <span className="text-[#f3f2f2] font-bold text-base tabular-nums">{value.toLocaleString()}</span>
        <span className="text-[#5A6680] text-xs font-mono">{label}</span>
      </button>
    );
  }
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[#f3f2f2] font-bold text-base tabular-nums">{value.toLocaleString()}</span>
      <span className="text-[#5A6680] text-xs font-mono">{label}</span>
    </div>
  );
}

// ── UserProfile ───────────────────────────────────────────────────────────────
export default function UserProfile() {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = Number(userIdParam);
  const navigate = useNavigate();
  const { user: me, isAuthenticated, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const isOwnProfile = isAuthenticated && me?.id === userId;
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [profileTab, setProfileTab] = useState<'posts' | 'compartidos'>('posts');
  const [followersModal, setFollowersModal] = useState<'followers' | 'following' | null>(null);
  const [c1, c2] = palette(userId);

  const { data: profile, isLoading: profileLoading } = trpc.users.getProfile.useQuery(
    { userId },
    { enabled: !!userId && !Number.isNaN(userId) }
  );
  const { data: userPosts, isLoading: postsLoading } = trpc.posts.listByUser.useQuery(
    { userId, viewerUserId: me?.id },
    { enabled: !!userId && !Number.isNaN(userId) }
  );
  const { data: userReposts, isLoading: repostsLoading } = trpc.reposts.listByUser.useQuery(
    { userId },
    { enabled: !!userId && !Number.isNaN(userId) && profileTab === 'compartidos' }
  );
  const { data: isFollowingData, refetch: refetchIsFollowing } = trpc.follows.isFollowing.useQuery(
    { followingId: userId },
    { enabled: isAuthenticated && !isOwnProfile && !!userId }
  );

  const [followLoading, setFollowLoading] = useState(false);
  const [localFollowing, setLocalFollowing] = useState<boolean | null>(null);
  const [localDelta, setLocalDelta] = useState(0);

  const toggleFollow = trpc.follows.toggle.useMutation();
  const isFollowing = localFollowing ?? isFollowingData ?? false;
  const followerCount = (profile?.followerCount ?? 0) + localDelta;

  function handleFollowClick() {
    if (!isAuthenticated) { navigate('/login'); return; }
    setFollowLoading(true);
    const was = isFollowing;
    setLocalFollowing(!was);
    setLocalDelta((d) => was ? d - 1 : d + 1);
    toggleFollow.mutate(
      { followingId: userId },
      {
        onSuccess: (res) => {
          setLocalFollowing(res.following);
          setLocalDelta(res.following ? 1 : 0);
          addToast(res.following ? `Ahora sigues a ${profile?.name ?? 'este usuario'}` : 'Dejaste de seguir', res.following ? 'success' : 'info');
          void refetchIsFollowing();
        },
        onError: () => {
          setLocalFollowing(was);
          setLocalDelta((d) => was ? d + 1 : d - 1);
          addToast('Error al actualizar seguimiento', 'error');
        },
        onSettled: () => setFollowLoading(false),
      }
    );
  }

  const handle = profile?.name?.toLowerCase().replace(/\s+/g, '') ?? 'user';
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es', { year: 'numeric', month: 'long' })
    : null;
  const postCount = userPosts?.length ?? 0;

  // ── Loading ──
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${c1}33`, borderTopColor: c1 }} />
          <span className="text-[#5A6680] text-xs font-mono tracking-widest">CARGANDO</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#060911] flex flex-col items-center justify-center gap-3">
        <p className="text-[#f3f2f2] font-bold text-lg">Usuario no encontrado</p>
        <button onClick={() => navigate('/app')} className="text-xs font-mono" style={{ color: c1 }}>← Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060911] flex">
      <style>{`
        @keyframes ring-spin { to { transform: rotate(360deg); } }
        @keyframes pf-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Left sidebar (authenticated only) ── */}
      {isAuthenticated && me && (
        <DashboardSidebar
          user={me as AuthUser}
          activeTab="feed"
          onTabChange={() => navigate('/app')}
          onCreatePost={() => navigate('/app')}
          onLogout={logout}
          mobileSidebar={mobileSidebar}
          onCloseMobile={() => setMobileSidebar(false)}
        />
      )}

      {/* ── Main column ── */}
      <main className="flex-1 min-w-0" style={{ animation: 'pf-in 0.35s ease both' }}>

        {/* Mobile header (only when authenticated) */}
        {isAuthenticated && me && (
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#1E2535] sticky top-0 bg-[#060911]/95 backdrop-blur-sm z-30">
            <button onClick={() => setMobileSidebar(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#f3f2f2]">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <img src="/images/logo-solocara.png" alt="DevConnect" className="w-7 h-7 object-contain"
              style={{ filter: 'drop-shadow(0 0 6px rgba(225,255,0,0.6))' }} />
            <div className="w-8 h-8 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold text-xs">
              {me.name?.charAt(0) ?? 'U'}
            </div>
          </div>
        )}

        {/* ── Desktop sticky header ── */}
        <div
          className="sticky top-0 z-30 border-b border-[#1E2535] px-5 py-3 flex items-center gap-3"
          style={{ background: 'rgba(6,9,17,0.88)', backdropFilter: 'blur(12px)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-[#6B7FA8] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-all shrink-0"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[#f3f2f2] font-bold text-sm leading-tight truncate">{profile.name ?? 'Developer'}</p>
            <p className="text-[#3D4E68] text-[11px] font-mono">{postCount} {postCount === 1 ? 'post' : 'posts'}</p>
          </div>
        </div>

        {/* ── Centered column ── */}
        <div className="max-w-2xl mx-auto px-0 sm:px-4 pt-4 pb-12">

        {/* ── Profile card ── */}
        <div
          className="relative rounded-none sm:rounded-2xl overflow-visible border-y sm:border border-[#1A2133]"
          style={{ background: '#080D18' }}
        >
          {/* Banner — clipped within its own container */}
          <div className="rounded-none sm:rounded-t-2xl overflow-hidden" style={{ height: 160 }}>
            {profile.banner ? (
              <img src={profile.banner} alt="" className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }} />
            ) : (
              <DefaultBanner userId={userId} color={c1} />
            )}
          </div>

          {/* Card body */}
          <div className="relative px-5 pb-5">
            {/* Avatar — overlaps banner bottom by ~40px */}
            <div className="absolute z-10" style={{ top: -46, left: 20 }}>
              <AvatarRing src={profile.avatar} name={profile.name} colors={[c1, c2]} size={80} />
            </div>

            {/* Action button row — right-aligned, vertically centered with avatar overlap */}
            <div className="flex justify-end gap-2 pt-3 mb-10">
              {!isOwnProfile && isAuthenticated && (
                <button
                  onClick={() =>
                    navigate('/app', {
                      state: {
                        openMessages: true,
                        partner: { id: userId, name: profile.name, avatar: profile.avatar },
                      },
                    })
                  }
                  title="Enviar mensaje"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border border-[#2A3347] text-[#C9D5E8] hover:border-[#3B82F6]/60 hover:text-[#3B82F6] transition-all"
                >
                  <MessageSquare size={14} />
                  Mensaje
                </button>
              )}
              {!isOwnProfile && (
                <FollowButton isFollowing={isFollowing} loading={followLoading} onClick={handleFollowClick} />
              )}
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/app')}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold border border-[#2A3347] text-[#C9D5E8] hover:border-[#e1ff00]/40 hover:text-[#f3f2f2] transition-all"
                >
                  Editar perfil
                </button>
              )}
            </div>

            {/* Identity block */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-[#f3f2f2] font-bold text-[18px] leading-tight">{profile.name ?? 'Developer'}</h1>
                <Verified size={16} className="text-[#3B82F6] shrink-0" />
              </div>
              <p className="text-[#5A6680] text-xs font-mono">@{handle}</p>
            </div>

            {profile.bio && (
              <p className="mt-3 text-[#A8BCCF] text-sm leading-relaxed max-w-md">{profile.bio}</p>
            )}

            <div className="mt-3 flex items-center flex-wrap gap-x-4 gap-y-1.5">
              {joinDate && (
                <div className="flex items-center gap-1 text-[#5A6680] text-xs font-mono">
                  <Calendar size={12} />
                  <span>Unido en {joinDate}</span>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-4 flex items-center gap-5">
              <StatItem value={profile.followingCount} label="Siguiendo" onClick={() => setFollowersModal('following')} />
              <span className="text-[#1E2535]">·</span>
              <StatItem value={followerCount} label="Seguidores" onClick={() => setFollowersModal('followers')} />
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-1 border-b border-[#1A2133] flex">
          <button
            onClick={() => setProfileTab('posts')}
            className="flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors"
            style={{
              borderColor: profileTab === 'posts' ? c1 : 'transparent',
              color: profileTab === 'posts' ? '#f3f2f2' : '#5A6680',
            }}
          >
            <LayoutGrid size={13} style={{ color: profileTab === 'posts' ? c1 : '#5A6680' }} />
            Posts
          </button>
          <button
            onClick={() => setProfileTab('compartidos')}
            className="flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors"
            style={{
              borderColor: profileTab === 'compartidos' ? '#22C55E' : 'transparent',
              color: profileTab === 'compartidos' ? '#f3f2f2' : '#5A6680',
            }}
          >
            <Repeat2 size={13} style={{ color: profileTab === 'compartidos' ? '#22C55E' : '#5A6680' }} />
            Compartidos
          </button>
        </div>

        {/* ── Posts feed ── */}
        {profileTab === 'posts' && (
          postsLoading ? (
            <div className="flex justify-center py-14">
              <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${c1}33`, borderTopColor: c1 }} />
            </div>
          ) : !userPosts || userPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${c1}10`, border: `1px solid ${c1}18` }}>
                <LayoutGrid size={22} style={{ color: c1, opacity: 0.5 }} />
              </div>
              <p className="text-[#5A6680] text-xs font-mono">Sin posts todavía</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} addToast={addToast} />
            ))
          )
        )}

        {/* ── Compartidos feed ── */}
        {profileTab === 'compartidos' && (
          repostsLoading ? (
            <div className="flex justify-center py-14">
              <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#22C55E33', borderTopColor: '#22C55E' }} />
            </div>
          ) : !userReposts || userReposts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#22C55E]/5 border border-[#22C55E]/10">
                <Repeat2 size={22} className="text-[#22C55E] opacity-40" />
              </div>
              <p className="text-[#5A6680] text-xs font-mono">Sin compartidos todavía</p>
            </div>
          ) : (
            userReposts.map((r) => (
              <SharedPostCard
                key={r.repostId}
                repostId={r.repostId}
                repostCreatedAt={r.repostCreatedAt}
                quoteText={r.quoteText}
                post={r.post}
                addToast={addToast}
              />
            ))
          )
        )}
        </div>
      </main>

      {followersModal && (
        <FollowersModal
          userId={userId}
          type={followersModal}
          onClose={() => setFollowersModal(null)}
        />
      )}
    </div>
  );
}
