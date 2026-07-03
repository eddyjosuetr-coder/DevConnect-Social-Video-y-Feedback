import { Bell, Heart, MessageCircle, UserPlus, Repeat2 } from 'lucide-react';

type NotifType = 'like' | 'comment' | 'follow' | 'repost';

type Notification = {
  id: number;
  type: NotifType;
  user: string;
  action: string;
  time: string;
  read: boolean;
  avatar?: string;
};

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'like',    user: 'Alejandro Marin', action: 'le gustó tu post sobre React Hooks',       time: 'Hace 2h',  read: false, avatar: '/images/profile1.jpg' },
  { id: 2, type: 'comment', user: 'Sofia Jimenez',   action: 'comentó en tu snippet de TypeScript',      time: 'Hace 4h',  read: false, avatar: '/images/profile2.jpg' },
  { id: 3, type: 'repost',  user: 'Carlos Mendez',   action: 'reposteó tu publicación',                  time: 'Hace 6h',  read: false, avatar: '/images/profile5.jpg' },
  { id: 4, type: 'follow',  user: 'Yuki Tanaka',     action: 'comenzó a seguirte',                       time: 'Ayer',     read: true,  avatar: '/images/profile6.jpg' },
  { id: 5, type: 'like',    user: 'Carlos Mendez',   action: 'le gustó tu comentario sobre Drizzle ORM', time: 'Hace 2d',  read: true,  avatar: '/images/profile5.jpg' },
];

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
  repost:  'text-[#22C55E] bg-[#22C55E]/10',
};

export default function NotificationsTab() {
  const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div>
      {unreadCount > 0 && (
        <div className="px-4 py-2.5 border-b border-[#2A3347] bg-[#151A27]/40">
          <p className="text-xs text-[#5A6680]">
            <span className="text-[#e1ff00] font-semibold">{unreadCount} nuevas</span> desde tu última visita
          </p>
        </div>
      )}

      {DEMO_NOTIFICATIONS.map((n) => {
        const Icon = ICON_MAP[n.type];
        return (
          <div
            key={n.id}
            className={`flex items-start gap-4 px-4 py-4 border-b border-[#2A3347] cursor-pointer hover:bg-[#151A27]/50 transition-colors ${
              !n.read ? 'bg-[#e1ff00]/[0.02]' : ''
            }`}
          >
            <div className="relative shrink-0">
              {n.avatar ? (
                <img src={n.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1E2535] flex items-center justify-center text-[#8B9AB0] font-bold text-sm">
                  {n.user.charAt(0)}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-[#050507] ${COLOR_MAP[n.type]}`}>
                <Icon size={10} strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-relaxed ${n.read ? 'text-[#8B9AB0]' : 'text-[#E2E8F0]'}`}>
                <span className="font-semibold text-[#f3f2f2]">{n.user}</span>{' '}
                {n.action}
              </p>
              <p className="text-xs text-[#5A6680] mt-1">{n.time}</p>
            </div>

            {!n.read && (
              <div className="w-2 h-2 rounded-full bg-[#e1ff00] mt-2 shrink-0" />
            )}
          </div>
        );
      })}

      <div className="text-center py-12 px-4">
        <div className="w-14 h-14 bg-[#151A27] rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell size={22} className="text-[#5A6680]" />
        </div>
        <p className="text-[#8B9AB0] text-sm leading-relaxed">
          Las notificaciones en tiempo real estarán disponibles al conectar la base de datos.
        </p>
      </div>
    </div>
  );
}
