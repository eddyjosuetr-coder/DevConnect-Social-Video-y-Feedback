import { useState, useRef, useEffect } from 'react';
import { Search, Send, ArrowLeft, MessageSquarePlus, UserCircle2 } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router';
import { formatDate } from '@/lib/utils';

// ── Avatar helper ─────────────────────────────────────────────────────────────
function UserAvatar({ name, avatar, size = 40 }: { name: string | null; avatar: string | null; size?: number }) {
  if (avatar) {
    return <img src={avatar} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {(name ?? '?').charAt(0).toUpperCase()}
    </div>
  );
}

// ── Thread View ───────────────────────────────────────────────────────────────
function ThreadView({
  partner,
  currentUserId,
  onBack,
}: {
  partner: { id: number; name: string | null; avatar: string | null };
  currentUserId: number;
  onBack: () => void;
}) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const utils = trpc.useUtils();

  const { data: thread = [], isLoading } = trpc.messages.thread.useQuery(
    { otherId: partner.id },
    { refetchInterval: 3000 }
  );

  const markRead = trpc.messages.markRead.useMutation({
    onSuccess: () => utils.messages.conversations.invalidate(),
  });

  const sendMsg = trpc.messages.send.useMutation({
    onSuccess: () => {
      setText('');
      void utils.messages.thread.invalidate({ otherId: partner.id });
      void utils.messages.conversations.invalidate();
    },
  });

  // Mark as read when opening
  useEffect(() => {
    markRead.mutate({ otherId: partner.id });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length]);

  function handleSend() {
    const content = text.trim();
    if (!content || sendMsg.isPending) return;
    sendMsg.mutate({ receiverId: partner.id, content });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2535] sticky top-0 bg-[#060911]/95 backdrop-blur-sm z-10">
        <button onClick={onBack} className="p-1.5 text-[#5A6680] hover:text-[#f3f2f2] transition-colors shrink-0">
          <ArrowLeft size={18} />
        </button>
        <button
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          onClick={() => navigate(`/u/${partner.id}`)}
        >
          <UserAvatar name={partner.name} avatar={partner.avatar} size={34} />
          <div className="min-w-0">
            <p className="text-[#f3f2f2] font-semibold text-sm leading-tight truncate">{partner.name ?? 'Usuario'}</p>
            <p className="text-[#5A6680] text-xs font-mono truncate">
              @{partner.name?.toLowerCase().replace(/\s+/g, '') ?? 'user'}
            </p>
          </div>
        </button>
        <button
          onClick={() => navigate(`/u/${partner.id}`)}
          className="p-1.5 text-[#3D4E68] hover:text-[#6B7FA8] transition-colors shrink-0"
          title="Ver perfil"
        >
          <UserCircle2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-t-[#e1ff00] border-[#1E2535] animate-spin" />
          </div>
        )}

        {!isLoading && thread.length === 0 && (
          <div className="text-center py-12 text-[#3D4E68] text-sm">
            Aún no hay mensajes. ¡Di hola!
          </div>
        )}

        {thread.map((msg) => {
          const mine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && (
                <div className="mr-2 mt-auto shrink-0">
                  <UserAvatar name={partner.name} avatar={partner.avatar} size={28} />
                </div>
              )}
              <div
                className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  mine
                    ? 'bg-[#e1ff00] text-[#050507] rounded-br-sm'
                    : 'bg-[#111827] text-[#E2E8F0] rounded-bl-sm border border-[#1E2535]'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 text-right ${mine ? 'text-[#050507]/40' : 'text-[#5A6680]'}`}>
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#1E2535]">
        <div
          className="flex items-end gap-2 bg-[#0D1220] border border-[#1E2535] rounded-2xl px-4 py-2.5 transition-colors"
          style={{ borderColor: text ? '#3B82F6' : undefined }}
        >
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={`Mensaje a ${partner.name ?? 'usuario'}…`}
            className="flex-1 bg-transparent text-sm text-[#f3f2f2] outline-none placeholder:text-[#3D4E68] resize-none"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sendMsg.isPending}
            className="shrink-0 p-1.5 rounded-lg transition-all disabled:opacity-30"
            style={{ color: text.trim() ? '#e1ff00' : '#3D4E68' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Conversation Picker ───────────────────────────────────────────────────
function NewConvPicker({ onSelect, onClose }: {
  onSelect: (user: { id: number; name: string | null; avatar: string | null }) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const { data: results = [] } = trpc.users.search.useQuery(
    { query },
    { enabled: query.length >= 1 }
  );

  return (
    <div className="absolute inset-0 z-20 bg-[#060911] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2535]">
        <button onClick={onClose} className="p-1.5 text-[#5A6680] hover:text-[#f3f2f2] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D4E68]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuario por nombre…"
            className="w-full bg-[#0D1220] border border-[#1E2535] focus:border-[#3B82F6] text-[#f3f2f2] pl-9 pr-4 py-2 text-sm outline-none rounded-xl transition-colors placeholder:text-[#3D4E68]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.length < 1 && (
          <div className="text-center py-12 text-[#3D4E68] text-sm">
            Escribe un nombre para buscar
          </div>
        )}
        {results.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#0F1520] hover:bg-[#0D1220] transition-colors text-left"
          >
            <UserAvatar name={u.name} avatar={u.avatar} size={40} />
            <div>
              <p className="text-[#f3f2f2] font-semibold text-sm">{u.name ?? 'Usuario'}</p>
              <p className="text-[#5A6680] text-xs font-mono">
                @{u.name?.toLowerCase().replace(/\s+/g, '') ?? 'user'}
              </p>
            </div>
          </button>
        ))}
        {query.length >= 1 && results.length === 0 && (
          <p className="text-center text-[#5A6680] text-sm py-10">Sin resultados</p>
        )}
      </div>
    </div>
  );
}

// ── MessagesTab (main) ────────────────────────────────────────────────────────
export default function MessagesTab() {
  const { user: me } = useAuth();
  const [partner, setPartner] = useState<{ id: number; name: string | null; avatar: string | null } | null>(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const [search, setSearch] = useState('');

  const { data: conversations = [], isLoading } = trpc.messages.conversations.useQuery(
    undefined,
    { refetchInterval: 5000, enabled: !!me }
  );

  if (!me) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#5A6680]">
        <MessageSquarePlus size={36} />
        <p className="text-sm">Inicia sesión para ver tus mensajes</p>
      </div>
    );
  }

  if (partner) {
    return (
      <ThreadView
        partner={partner}
        currentUserId={me.id}
        onBack={() => setPartner(null)}
      />
    );
  }

  const filtered = conversations.filter((c) =>
    (c.partnerName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex flex-col">
      {showNewConv && (
        <NewConvPicker
          onSelect={(u) => { setPartner(u); setShowNewConv(false); }}
          onClose={() => setShowNewConv(false)}
        />
      )}

      {/* Search + new button */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1E2535] flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D4E68]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversaciones…"
            className="w-full bg-[#0D1220] border border-[#1E2535] focus:border-[#3B82F6] text-[#f3f2f2] pl-9 pr-4 py-2 text-sm outline-none rounded-xl transition-colors placeholder:text-[#3D4E68]"
          />
        </div>
        <button
          onClick={() => setShowNewConv(true)}
          title="Nuevo mensaje"
          className="p-2.5 rounded-xl border border-[#1E2535] text-[#e1ff00] hover:bg-[#e1ff00]/8 transition-all shrink-0"
        >
          <MessageSquarePlus size={16} />
        </button>
      </div>

      {/* Conversation list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-[#e1ff00] border-[#1E2535] animate-spin" />
        </div>
      ) : filtered.length === 0 && conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0D1220] border border-[#1E2535] flex items-center justify-center">
            <MessageSquarePlus size={28} className="text-[#e1ff00] opacity-60" />
          </div>
          <div className="text-center">
            <p className="text-[#f3f2f2] font-semibold text-sm">No tienes mensajes aún</p>
            <p className="text-[#5A6680] text-xs mt-1">Busca a alguien y empieza a chatear</p>
          </div>
          <button
            onClick={() => setShowNewConv(true)}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-[#e1ff00] text-[#050507]"
            style={{ boxShadow: '0 0 16px rgba(225,255,0,0.25)' }}
          >
            Nuevo mensaje
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#5A6680] text-sm py-10">Sin resultados</p>
      ) : (
        filtered.map((c) => (
          <button
            key={c.partnerId}
            onClick={() => setPartner({ id: c.partnerId, name: c.partnerName, avatar: c.partnerAvatar })}
            className="w-full flex items-start gap-3 px-4 py-4 border-b border-[#0F1520] hover:bg-[#0A0F1A] transition-colors text-left"
          >
            <div className="relative shrink-0">
              <UserAvatar name={c.partnerName} avatar={c.partnerAvatar} size={44} />
              {c.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#e1ff00] border-2 border-[#060911] flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#050507]">{c.unreadCount}</span>
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-semibold truncate ${c.unreadCount > 0 ? 'text-[#f3f2f2]' : 'text-[#C9D5E8]'}`}>
                  {c.partnerName ?? 'Usuario'}
                </span>
                <span className="text-[10px] text-[#3D4E68] shrink-0">{formatDate(c.lastAt)}</span>
              </div>
              <p className={`text-xs mt-0.5 truncate ${c.unreadCount > 0 ? 'text-[#A8BCCF]' : 'text-[#5A6680]'}`}>
                {c.lastSenderId === me.id ? 'Tú: ' : ''}{c.lastContent}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
