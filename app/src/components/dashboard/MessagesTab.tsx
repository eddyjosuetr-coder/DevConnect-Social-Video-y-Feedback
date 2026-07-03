import { useState } from 'react';
import { Mail, Search, Send, X } from 'lucide-react';

type Conversation = {
  id: number;
  name: string;
  handle: string;
  lastMsg: string;
  time: string;
  img: string;
  unread: number;
  online: boolean;
};

const DEMO_CONVERSATIONS: Conversation[] = [
  { id: 1, name: 'Alejandro Marin', handle: '@alexmarin', lastMsg: 'Hey! Vi tu snippet de Rust, está increíble 🔥', time: 'Hace 3h', img: '/images/profile1.jpg', unread: 2, online: true },
  { id: 2, name: 'Sofia Jimenez',   handle: '@sofiaj',    lastMsg: '¿Usas Zod para validación en tRPC?',          time: 'Ayer',     img: '/images/profile2.jpg', unread: 0, online: true },
  { id: 3, name: 'Carlos Mendez',   handle: '@cmendez',   lastMsg: 'Excelente arquitectura, muy limpia',           time: 'Hace 2d',  img: '/images/profile5.jpg', unread: 0, online: false },
  { id: 4, name: 'Yuki Tanaka',     handle: '@yukit',     lastMsg: 'Gracias por el feedback en el PR',             time: 'Hace 4d',  img: '/images/profile6.jpg', unread: 0, online: false },
];

type ActiveConv = Conversation & { messages: { id: number; text: string; mine: boolean; time: string }[] };

const MOCK_MESSAGES: Record<number, { id: number; text: string; mine: boolean; time: string }[]> = {
  1: [
    { id: 1, text: 'Hey! Vi tu snippet de Rust, está increíble 🔥', mine: false, time: '3:20pm' },
    { id: 2, text: 'Jaja gracias! Llevo semanas aprendiendo ownership', mine: true, time: '3:21pm' },
    { id: 3, text: '¿Tienes algún repo público donde pueda ver más?', mine: false, time: '3:22pm' },
  ],
  2: [
    { id: 1, text: '¿Usas Zod para validación en tRPC?', mine: false, time: 'Ayer' },
    { id: 2, text: 'Sí, exactamente. tRPC v11 ya la incluye built-in', mine: true, time: 'Ayer' },
  ],
  3: [{ id: 1, text: 'Excelente arquitectura, muy limpia', mine: false, time: 'Hace 2d' }],
  4: [{ id: 1, text: 'Gracias por el feedback en el PR', mine: false, time: 'Hace 4d' }],
};

export default function MessagesTab() {
  const [activeConv, setActiveConv] = useState<ActiveConv | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');

  const filtered = DEMO_CONVERSATIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()),
  );

  if (activeConv) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Conv header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2A3347] bg-[#050507]/80 backdrop-blur-sm">
          <button
            onClick={() => setActiveConv(null)}
            className="text-[#5A6680] hover:text-[#f3f2f2] transition-colors p-1"
          >
            <X size={18} />
          </button>
          <div className="relative shrink-0">
            <img src={activeConv.img} alt="" className="w-9 h-9 rounded-full object-cover" />
            {activeConv.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#050507]" />
            )}
          </div>
          <div>
            <p className="text-[#f3f2f2] font-semibold text-sm">{activeConv.name}</p>
            <p className="text-[#5A6680] text-xs">{activeConv.online ? 'En línea' : 'Desconectado'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {MOCK_MESSAGES[activeConv.id]?.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.mine
                    ? 'bg-[#e1ff00] text-[#050507] rounded-br-sm'
                    : 'bg-[#1E2535] text-[#E2E8F0] rounded-bl-sm'
                }`}
              >
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 text-right ${m.mine ? 'text-[#050507]/50' : 'text-[#5A6680]'}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#2A3347]">
          <div className="flex items-center gap-2 bg-[#151A27] border border-[#2A3347] rounded-xl px-4 py-2.5 focus-within:border-[#3B82F6] transition-colors">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newMsg.trim()) setNewMsg(''); }}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-transparent text-sm text-[#f3f2f2] outline-none placeholder:text-[#5A6680]"
            />
            <button
              onClick={() => setNewMsg('')}
              disabled={!newMsg.trim()}
              className="text-[#e1ff00] disabled:text-[#2A3347] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[9px] text-[#5A6680] text-center mt-2">
            Los mensajes en tiempo real requieren Google OAuth + base de datos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-4 pb-3 border-b border-[#2A3347]">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6680]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full bg-[#151A27] border border-[#2A3347] text-[#f3f2f2] pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#5A6680] rounded-xl"
          />
        </div>
      </div>

      {filtered.map((c) => (
        <button
          key={c.id}
          onClick={() => setActiveConv({ ...c, messages: MOCK_MESSAGES[c.id] ?? [] })}
          className="w-full flex items-start gap-3 px-4 py-4 border-b border-[#2A3347] hover:bg-[#151A27]/50 cursor-pointer transition-colors text-left"
        >
          <div className="relative shrink-0">
            <img src={c.img} alt="" className="w-11 h-11 rounded-full object-cover" />
            {c.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-[#050507]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${c.unread > 0 ? 'text-[#f3f2f2] font-bold' : 'text-[#f3f2f2] font-semibold'}`}>
                {c.name}
              </span>
              <span className="text-xs text-[#5A6680] shrink-0 ml-2">{c.time}</span>
            </div>
            <p className={`text-xs mt-0.5 truncate ${c.unread > 0 ? 'text-[#E2E8F0]' : 'text-[#8B9AB0]'}`}>
              {c.lastMsg}
            </p>
          </div>
          {c.unread > 0 && (
            <div className="w-5 h-5 rounded-full bg-[#e1ff00] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[#050507] text-[10px] font-bold">{c.unread}</span>
            </div>
          )}
        </button>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-[#5A6680] text-sm">No se encontraron conversaciones</p>
        </div>
      )}

      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 bg-[#151A27] rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={22} className="text-[#5A6680]" />
        </div>
        <p className="text-[#8B9AB0] text-sm leading-relaxed">
          Los mensajes reales estarán disponibles con Google OAuth conectado.
        </p>
      </div>
    </div>
  );
}
