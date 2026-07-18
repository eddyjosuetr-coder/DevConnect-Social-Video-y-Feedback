import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export const LANG_COLORS: Record<string, string> = {
  typescript:  '#3178C6',
  javascript:  '#F7DF1E',
  python:      '#3776AB',
  go:          '#00ADD8',
  rust:        '#CE422B',
  java:        '#ED8B00',
  sql:         '#CC2927',
  bash:        '#4EAA25',
  json:        '#6F8BAA',
  yaml:        '#CB171E',
  css:         '#264DE4',
  html:        '#E34F26',
  tsx:         '#3178C6',
  dockerfile:  '#2496ED',
};

export const CODE_LANGUAGES = [
  'typescript', 'javascript', 'python', 'go', 'rust',
  'java', 'sql', 'bash', 'json', 'yaml', 'css', 'html', 'tsx', 'dockerfile',
];

interface LangSelectProps {
  value: string;
  onChange: (lang: string) => void;
}

export default function LangSelect({ value, onChange }: LangSelectProps) {
  const [open, setOpen]         = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const btnRef                  = useRef<HTMLButtonElement>(null);
  const color                   = LANG_COLORS[value] ?? '#5A6680';

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation();
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const spaceBelow = window.innerHeight - r.bottom;
    const dropH      = 238;
    const top        = spaceBelow >= dropH + 10 ? r.bottom + 6 : r.top - dropH - 6;
    setMenuStyle({ top, left: r.left, minWidth: Math.max(r.width, 152) });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => (open ? (e.stopPropagation(), setOpen(false)) : openMenu(e))}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors duration-150 focus:outline-none"
        style={{ background: open ? 'rgba(255,255,255,0.06)' : 'transparent', color: open ? '#C9D5E8' : '#8B9AB0' }}
        onMouseEnter={(e) => { if (!open) { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.color = '#C9D5E8'; } }}
        onMouseLeave={(e) => { if (!open) { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#8B9AB0'; } }}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}90` }} />
        <span className="text-[11px] font-mono tracking-wide">{value}</span>
        <ChevronDown size={10} style={{ color: '#3D4E68', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.18s ease' }} />
      </button>

      {open && createPortal(
        <>
          {/* Backdrop — catches outside clicks */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />

          {/* Dropdown menu */}
          <div
            style={{
              position:   'fixed',
              zIndex:     9999,
              background: '#0D1220',
              border:     '1px solid #1E2535',
              borderRadius: '12px',
              boxShadow:  '0 8px 40px rgba(0,0,0,0.72)',
              maxHeight:  238,
              overflowY:  'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#1E2535 transparent',
              ...menuStyle,
            }}
          >
            {CODE_LANGUAGES.map((lang) => {
              const c   = LANG_COLORS[lang] ?? '#5A6680';
              const sel = lang === value;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(lang); setOpen(false); }}
                  style={{ color: sel ? '#f3f2f2' : '#8B9AB0', background: sel ? 'rgba(225,255,0,0.06)' : 'transparent' }}
                  className="w-full flex items-center gap-2.5 px-3 py-[7px] text-left transition-colors duration-100"
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = '#1a2338'; el.style.color = '#f3f2f2'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = sel ? 'rgba(225,255,0,0.06)' : 'transparent'; el.style.color = sel ? '#f3f2f2' : '#8B9AB0'; }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c, boxShadow: sel ? `0 0 5px ${c}80` : 'none' }} />
                  <span className="text-[11px] font-mono flex-1 tracking-wide">{lang}</span>
                  {sel && <Check size={10} style={{ color: '#e1ff00' }} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
