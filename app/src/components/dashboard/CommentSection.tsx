import { useState, useEffect, useRef } from 'react';
import { Code2, Smile, Search, X, Loader2 } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { trpc } from '@/providers/trpc';
import { formatDate } from '@/lib/utils';
import { fetchTrending, searchGifs, type GifItem } from '@/lib/giphy';
import type { Toast } from '@/hooks/useToast';

// ── Content encoding helpers ──────────────────────────────────────────────────
// Format: "plain text\n```lang\ncode\n```\n[gif:url]"

function buildContent(text: string, code: string, lang: string, gifUrl: string): string {
  let result = text.trim();
  if (code.trim()) result += `\n\`\`\`${lang}\n${code.trim()}\n\`\`\``;
  if (gifUrl)      result += `\n[gif:${gifUrl}]`;
  return result;
}

type Segment =
  | { type: 'text'; value: string }
  | { type: 'code'; lang: string; value: string }
  | { type: 'gif';  url: string };

function parseContent(raw: string): Segment[] {
  const segments: Segment[] = [];
  const codeRe = /```(\w*)\n([\s\S]*?)```/g;
  const gifRe  = /\[gif:(https?:\/\/[^\]]+)\]/g;
  let combined = raw;

  // Extract code blocks
  const codeBlocks: Array<{ full: string; lang: string; code: string }> = [];
  combined = combined.replace(codeRe, (full, lang, code: string) => {
    const placeholder = `\0CODE${codeBlocks.length}\0`;
    codeBlocks.push({ full, lang: lang || 'text', code: code.trim() });
    return placeholder;
  });

  // Extract GIF references
  const gifs: Array<{ full: string; url: string }> = [];
  combined = combined.replace(gifRe, (full, url: string) => {
    const placeholder = `\0GIF${gifs.length}\0`;
    gifs.push({ full, url });
    return placeholder;
  });

  // Split remaining text by placeholders
  const parts = combined.split(/(\0CODE\d+\0|\0GIF\d+\0)/);
  for (const part of parts) {
    const codeMatch = part.match(/\0CODE(\d+)\0/);
    const gifMatch  = part.match(/\0GIF(\d+)\0/);
    if (codeMatch) {
      const b = codeBlocks[Number(codeMatch[1])];
      segments.push({ type: 'code', lang: b.lang, value: b.code });
    } else if (gifMatch) {
      const g = gifs[Number(gifMatch[1])];
      segments.push({ type: 'gif', url: g.url });
    } else if (part.trim()) {
      segments.push({ type: 'text', value: part.trim() });
    }
  }
  return segments;
}

// ── Rich comment renderer ─────────────────────────────────────────────────────
function CommentBody({ content }: { content: string }) {
  const segments = parseContent(content);
  if (segments.length === 0) return <p className="text-sm text-[#E2E8F0] whitespace-pre-wrap break-words">{content}</p>;

  return (
    <div className="space-y-2">
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <p key={i} className="text-sm text-[#E2E8F0] whitespace-pre-wrap break-words">{seg.value}</p>;
        }
        if (seg.type === 'code') {
          return (
            <div key={i} className="rounded-xl overflow-hidden border border-[#1E2535] text-xs">
              <div className="bg-[#0B0E17] px-3 py-1.5 flex items-center gap-2 border-b border-[#1E2535]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                  <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2 h-2 rounded-full bg-[#28C840]" />
                </div>
                <span className="text-[#5A6680] font-mono text-[10px]">{seg.lang}</span>
              </div>
              <pre className="bg-[#060911] text-[#A5D6FF] font-mono text-xs p-3 overflow-x-auto whitespace-pre leading-relaxed">
                <code>{seg.value}</code>
              </pre>
            </div>
          );
        }
        // gif
        return (
          <img key={i} src={seg.url} alt="gif" className="rounded-xl max-h-48 object-contain" loading="lazy" />
        );
      })}
    </div>
  );
}

// ── GIF Picker ────────────────────────────────────────────────────────────────
function GifPicker({ onSelect, onClose }: { onSelect: (gif: GifItem) => void; onClose: () => void }) {
  const [query,    setQuery]    = useState('');
  const [gifs,     setGifs]     = useState<GifItem[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTrending()
      .then((r) => { setGifs(r); setApiError(r.length === 0); })
      .catch(() => { setGifs([]); setApiError(true); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      fetchTrending().then((r) => { setGifs(r); setApiError(r.length === 0); }).catch(() => setApiError(true));
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchGifs(query)
        .then((r) => { setGifs(r); setApiError(false); })
        .catch(() => { setGifs([]); setApiError(true); })
        .finally(() => setLoading(false));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    setTimeout(() => document.addEventListener('mousedown', outside), 0);
    return () => document.removeEventListener('mousedown', outside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 left-0 z-50 rounded-2xl border border-[#1E2535] shadow-2xl overflow-hidden"
      style={{ width: 320, background: '#0B0E17' }}
    >
      <div className="flex items-center gap-2 p-3 border-b border-[#1E2535]">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#3D4E68]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar GIFs..."
            className="w-full bg-[#141822] text-[#f3f2f2] text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none placeholder:text-[#3D4E68] border border-[#1E2535] focus:border-[#e1ff00]/40"
          />
        </div>
        <button onClick={onClose} className="text-[#3D4E68] hover:text-[#f3f2f2] p-1">
          <X size={13} />
        </button>
      </div>
      <div className="px-3 py-1 text-[9px] font-mono text-[#2A3347] tracking-widest uppercase">Powered by GIPHY</div>
      <div className="overflow-y-auto p-2" style={{ height: 200 }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-[#e1ff00]" />
          </div>
        ) : apiError ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="text-xl">🔑</span>
            <p className="text-[#5A6680] text-xs">Agrega <span className="text-[#e1ff00] font-mono">VITE_GIPHY_API_KEY</span> en Vercel.</p>
          </div>
        ) : gifs.length === 0 ? (
          <p className="text-center text-[#3D4E68] text-xs py-8">Sin resultados</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => { onSelect(gif); onClose(); }}
                className="relative rounded-lg overflow-hidden aspect-video bg-[#1E2535] hover:ring-2 hover:ring-[#e1ff00]/60 hover:scale-105 transition-all duration-150"
              >
                <img src={gif.previewUrl} alt={gif.title} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Emoji Panel ───────────────────────────────────────────────────────────────
function EmojiPanel({ onSelect, onClose }: { onSelect: (native: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    setTimeout(() => document.addEventListener('mousedown', outside), 0);
    return () => document.removeEventListener('mousedown', outside);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute bottom-full mb-2 left-0 z-50">
      <style>{`em-emoji-picker { --background-rgb: 11,14,23; --border-color: #1E2535; height:300px; width:300px; }`}</style>
      <Picker
        data={data}
        onEmojiSelect={(emoji: { native: string }) => onSelect(emoji.native)}
        theme="dark"
        locale="es"
        previewPosition="none"
        skinTonePosition="none"
        set="native"
      />
    </div>
  );
}

const CODE_LANGUAGES = [
  'typescript', 'javascript', 'python', 'go', 'rust',
  'java', 'sql', 'bash', 'json', 'yaml', 'css', 'html', 'tsx', 'dockerfile',
];

// ── CommentSection ────────────────────────────────────────────────────────────
type CommentRow = {
  id: number;
  content: string;
  createdAt: Date;
  authorId: number;
  authorName: string | null;
  authorAvatar: string | null;
};

interface CommentSectionProps {
  postId: number;
  isOpen: boolean;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function CommentSection({ postId, isOpen, addToast }: CommentSectionProps) {
  const [text,      setText]      = useState('');
  const [code,      setCode]      = useState('');
  const [lang,      setLang]      = useState('typescript');
  const [gifUrl,    setGifUrl]    = useState('');
  const [gifPreview, setGifPreview] = useState('');
  const [showCode,  setShowCode]  = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifs,  setShowGifs]  = useState(false);
  const [focused,   setFocused]   = useState(false);

  const [localComments, setLocalComments] = useState<CommentRow[]>([]);
  const [serverLoaded,  setServerLoaded]  = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef   = useRef(0);

  const { data: serverComments } = trpc.comments.list.useQuery({ postId }, { enabled: isOpen });

  useEffect(() => {
    if (serverComments && !serverLoaded) {
      setLocalComments(serverComments);
      setServerLoaded(true);
    }
  }, [serverComments, serverLoaded]);

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => addToast('Comentario publicado!', 'success'),
    onError: (err) => {
      setLocalComments((prev) => prev.slice(0, -1));
      addToast(`Error al comentar: ${err.message}`, 'error');
    },
  });

  function insertEmoji(native: string) {
    const pos = cursorRef.current;
    const next = text.slice(0, pos) + native + text.slice(pos);
    setText(next);
    setShowEmoji(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(pos + native.length, pos + native.length);
    }, 0);
  }

  function selectGif(gif: GifItem) {
    setGifUrl(gif.url);
    setGifPreview(gif.previewUrl);
  }

  function removeGif() { setGifUrl(''); setGifPreview(''); }

  function handleSubmit() {
    const content = buildContent(text, code, lang, gifUrl);
    if (!content.trim()) return;

    const optimistic: CommentRow = {
      id: Date.now(),
      content,
      createdAt: new Date(),
      authorId: 0,
      authorName: 'Tú',
      authorAvatar: null,
    };
    setLocalComments((prev) => [optimistic, ...prev]);
    setText('');
    setCode('');
    setGifUrl('');
    setGifPreview('');
    setShowCode(false);

    createComment.mutate({ postId, content });
  }

  const hasContent = text.trim() || code.trim() || gifUrl;
  const displayComments = serverLoaded ? localComments : (serverComments ?? []);

  if (!isOpen) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[#2A3347]">
      {/* Comment list */}
      {displayComments.length === 0 && (
        <p className="text-[#5A6680] text-sm text-center py-4">Sin comentarios. Se el primero!</p>
      )}
      {displayComments.map((c) => (
        <div key={c.id} className="flex items-start gap-2 mb-3">
          {c.authorAvatar ? (
            <img src={c.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-bold text-xs shrink-0">
              {(c.authorName ?? 'D').charAt(0)}
            </div>
          )}
          <div className="bg-[#0F131D] px-3 py-2.5 flex-1 rounded-xl min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs text-[#e1ff00] font-semibold">{c.authorName ?? 'Developer'}</span>
              <span className="text-[#5A6680] text-xs">· {formatDate(c.createdAt)}</span>
            </div>
            <CommentBody content={c.content} />
          </div>
        </div>
      ))}

      {/* Rich input */}
      <div
        className="mt-3 rounded-2xl border transition-colors overflow-visible"
        style={{ borderColor: focused ? '#3B82F6' : '#2A3347', background: '#0A0D18' }}
      >
        {/* Textarea */}
        <div className="px-4 pt-3 pb-1">
          <textarea
            ref={textareaRef}
            rows={focused || text ? 2 : 1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); cursorRef.current = textareaRef.current?.selectionStart ?? text.length; }}
            onSelect={() => { cursorRef.current = textareaRef.current?.selectionStart ?? text.length; }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !showCode) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Escribe un comentario..."
            className="w-full bg-transparent text-sm text-[#f3f2f2] resize-none outline-none placeholder:text-[#3A4460] leading-relaxed"
            style={{ transition: 'rows 0.2s' }}
          />
        </div>

        {/* Code block */}
        {showCode && (
          <div className="mx-3 mb-2 rounded-xl overflow-hidden border border-[#1E2535]">
            <div className="bg-[#0B0E17] px-3 py-2 flex items-center gap-2.5 border-b border-[#1E2535]">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                <span className="w-2 h-2 rounded-full bg-[#28C840]" />
              </div>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-[#5A6680] text-xs font-mono outline-none cursor-pointer hover:text-[#8B9AB0] transition-colors flex-1"
              >
                {CODE_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={() => { setShowCode(false); setCode(''); }} className="text-[#3D4E68] hover:text-[#8B9AB0] transition-colors">
                <X size={13} />
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// pega tu código ${lang}...`}
              className="w-full bg-[#060911] text-[#A5D6FF] font-mono text-xs p-3 resize-none outline-none min-h-[90px] placeholder:text-[#1E2535]"
              spellCheck={false}
            />
          </div>
        )}

        {/* GIF preview */}
        {gifUrl && (
          <div className="mx-3 mb-2 relative rounded-xl overflow-hidden border border-[#1E2535]">
            <img src={gifPreview || gifUrl} alt="gif" className="max-h-36 object-contain w-full" />
            <button
              onClick={removeGif}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white border border-white/10"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="relative px-3 py-2 border-t border-[#1A2030] flex items-center justify-between">
          {/* Left tools */}
          <div className="flex items-center gap-1">
            {/* Code */}
            <button
              onClick={() => setShowCode(!showCode)}
              title="Agregar código"
              className="p-1.5 rounded-lg transition-all"
              style={{ color: showCode ? '#3B82F6' : '#4A5A78', background: showCode ? '#3B82F615' : 'transparent' }}
            >
              <Code2 size={15} />
            </button>
            {/* Emoji */}
            <button
              onClick={() => { setShowGifs(false); setShowEmoji(!showEmoji); }}
              title="Emoji"
              className="p-1.5 rounded-lg transition-all"
              style={{ color: showEmoji ? '#F59E0B' : '#4A5A78', background: showEmoji ? '#F59E0B15' : 'transparent' }}
            >
              <Smile size={15} />
            </button>
            {/* GIF */}
            <button
              onClick={() => { setShowEmoji(false); setShowGifs(!showGifs); }}
              title="GIF"
              className="px-2 py-1 rounded-lg text-[11px] font-black transition-all"
              style={{ color: showGifs ? '#EC4899' : '#4A5A78', background: showGifs ? '#EC489915' : 'transparent', border: `1.5px solid ${showGifs ? '#EC4899' : '#2A3347'}` }}
            >
              GIF
            </button>
          </div>

          {/* Pickers (portal upward) */}
          {showEmoji && <EmojiPanel onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />}
          {showGifs  && <GifPicker  onSelect={selectGif}  onClose={() => setShowGifs(false)}  />}

          {/* Send */}
          <button
            onClick={handleSubmit}
            disabled={!hasContent || createComment.isPending}
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-40"
            style={{
              background: hasContent ? '#3B82F6' : '#0D1117',
              color: hasContent ? '#fff' : '#3D4E68',
              border: hasContent ? 'none' : '1px solid #1E2535',
            }}
          >
            {createComment.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
