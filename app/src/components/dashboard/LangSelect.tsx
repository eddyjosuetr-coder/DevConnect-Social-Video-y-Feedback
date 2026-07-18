import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [open, setOpen]   = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef        = useRef<HTMLButtonElement>(null);
  const color             = LANG_COLORS[value] ?? '#5A6680';

  const openMenu = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuH      = 232;
    const top        = spaceBelow >= menuH + 8
      ? rect.bottom + 6
      : rect.top - menuH - 6;
    setStyle({ top, left: rect.left, minWidth: Math.max(rect.width, 152) });
    setOpen(true);
  }, []);

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
        ref={triggerRef}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e1ff00]/30"
        style={{
          background: open ? 'rgba(255,255,255,0.05)' : 'transparent',
          color:      open ? '#C9D5E8' : '#8B9AB0',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
          (e.currentTarget as HTMLElement).style.color      = '#C9D5E8';
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color      = '#8B9AB0';
          }
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
        />
        <span className="text-[11px] font-mono tracking-wide">{value}</span>
        <ChevronDown
          size={10}
          style={{
            color:     '#3D4E68',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
          }}
        />
      </button>

      {open && (
        <>
          {/* Invisible backdrop */}
          <div
            className="fixed inset-0 z-[300]"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown panel */}
          <div
            className="fixed z-[301] rounded-xl border border-[#1E2535] shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-y-auto"
            style={{
              ...style,
              background:  '#0D1220',
              maxHeight:   232,
              scrollbarWidth: 'thin',
              scrollbarColor: '#1E2535 transparent',
              animation:   'langDropIn 0.14s ease forwards',
            }}
          >
            <style>{`
              @keyframes langDropIn {
                from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0)    scale(1);    }
              }
            `}</style>

            {CODE_LANGUAGES.map((lang) => {
              const c          = LANG_COLORS[lang] ?? '#5A6680';
              const isSelected = lang === value;
              return (
                <button
                  key={lang}
                  onClick={() => { onChange(lang); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-[7px] text-left transition-colors duration-100"
                  style={{
                    background: isSelected ? 'rgba(225,255,0,0.06)' : 'transparent',
                    color:      isSelected ? '#f3f2f2' : '#8B9AB0',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#1a2338';
                    (e.currentTarget as HTMLElement).style.color      = '#f3f2f2';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = isSelected ? 'rgba(225,255,0,0.06)' : 'transparent';
                    (e.currentTarget as HTMLElement).style.color      = isSelected ? '#f3f2f2' : '#8B9AB0';
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: c, boxShadow: isSelected ? `0 0 6px ${c}80` : 'none' }}
                  />
                  <span className="text-[11px] font-mono flex-1 tracking-wide">{lang}</span>
                  {isSelected && <Check size={10} className="text-[#e1ff00] shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
