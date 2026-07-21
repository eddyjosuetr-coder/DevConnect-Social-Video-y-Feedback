import { useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Repeat2 } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router';

type NotifType = 'like' | 'comment' | 'repost' | 'follow';

const ICON_MAP: Record<NotifType, React.ElementType> = {
  like:    Heart,
  comment: MessageCircle,
  follow:  UserPlus,
  repost:  Repeat2,
};

const COLOR_MAP: Record<NotifType, string> = {
  like:    'text-[#EF4444] bg-[#EF4444]/10',
  comment: 'text-[#3B82F6] bg-[#3B82F6]/10',
  follow:  'text-[#22C55E] bg-[#22C55E]/10',
  repost:  'text-[#A855F7] bg-[#A855F7]/10',
};

const ACTION_TEXT: Record<NotifType, string> = {
  like:    'le dio like a tu publicación',
  comment: 'comentó en tu publicación',
  repost:  'reposteó tu publicación',
  follow:  'comenzó a seguirte',
};

export default function NotificationsTab() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: notifs = [], isLoading } = trpc.notifications.list.useQuery(
    undefined,
    { refetchInterval: 10000 }
  );

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      void utils.notifications.list.invalidate();
      void utils.notifications.unreadCount.invalidate();
    },
  });

  // Mark all as read when the tab mounts
  useEffect(() => {
    markRead.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifs.filter((n) => !n.readAt).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-t-[#e1ff00] border-[#1E2535] animate-spin" />
      </div>
    );
  }

  if (notifs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 bg-[#0D1220] rounded-2xl border border-[#1E2535] flex items-center justify-center">
          <Bell size={22} className="text-[#3D4E68]" />
        </div>
        <div className="text-center">
          <p className="text-[#C9D5E8] font-semibold text-sm">Sin notificaciones</p>
          <p className="text-[#5A6680] text-xs mt-1">
            Cuando alguien te siga, comente o le dé like, aparecerá aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="px-4 py-2.5 border-b border-[#2A3347] bg-[#151A27]/40">
          <p className="text-xs text-[#5A6680]">
            <span className="text-[#e1ff00] font-semibold">{unreadCount} nueva{unreadCount !== 1 ? 's' : ''}</span> desde tu última visita
          </p>
        </div>
      )}

      {notifs.map((n) => {
        const Icon = ICON_MAP[n.type];
        const isUnread = !n.readAt;

        return (
          <button
            key={n.id}
            onClick={() => {
              if (n.type === 'follow') navigate(`/u/${n.actorId}`);
              else if (n.postId) navigate(`/post/${n.postId}`);
            }}
            className={`w-full flex items-start gap-4 px-4 py-4 border-b border-[#2A3347] hover:bg-[#151A27]/50 transition-colors text-left ${
              isUnread ? 'bg-[#e1ff00]/[0.02]' : ''
            }`}
          >
            {/* Avatar with type badge */}
            <div className="relative shrink-0">
              {n.actorAvatar ? (
                <img src={n.actorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1A2133] flex items-center justify-center text-[#8B9AB0] font-bold text-sm">
                  {(n.actorName ?? '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#060911] ${COLOR_MAP[n.type]}`}>
                <Icon size={10} strokeWidth={2.5} />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-relaxed ${isUnread ? 'text-[#E2E8F0]' : 'text-[#8B9AB0]'}`}>
                <span className="font-semibold text-[#f3f2f2]">{n.actorName ?? 'Alguien'}</span>{' '}
                {ACTION_TEXT[n.type]}
              </p>
              <p className="text-xs text-[#5A6680] mt-0.5">{formatDate(n.createdAt)}</p>
            </div>

            {isUnread && (
              <div className="w-2 h-2 rounded-full bg-[#e1ff00] mt-2 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
