import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

/* Inject spring-entrance keyframe once into <head> */
if (typeof document !== 'undefined' && !document.getElementById('__ls_kf__')) {
  const s = document.createElement('style');
  s.id = '__ls_kf__';
  s.textContent = `
    @keyframes lsIn {
      0%   { opacity:0; transform: scale(.94) translateY(-8px); }
      60%  { opacity:1; transform: scale(1.01) translateY(2px); }
      100% { opacity:1; transform: scale(1)    translateY(0);   }
    }
    @keyframes lsBarIn {
      from { transform: scaleY(0); }
      to   { transform: scaleY(1); }
    }
  `;
  document.head.appendChild(s);
}

export const LANG_COLORS: Record<string, string> = {
  typescript:  '#3B82F6',
  javascript:  '#EAB308',
  python:      '#3776AB',
  go:          '#00ADD8',
  rust:        '#F97316',
  java:        '#ED8B00',
  sql:         '#EF4444',
  bash:        '#22C55E',
  json:        '#8B5CF6',
  yaml:        '#EC4899',
  css:         '#818CF8',
  html:        '#F97316',
  tsx:         '#06B6D4',
  dockerfile:  '#2496ED',
};

export const CODE_LANGUAGES = [
  'typescript', 'javascript', 'tsx', 'python', 'go',
  'rust', 'java', 'sql', 'bash', 'json', 'yaml', 'css', 'html', 'dockerfile',
];

const EXT: Record<string, string> = {
  typescript: '.ts', javascript: '.js', tsx: '.tsx', python: '.py',
  go: '.go', rust: '.rs', java: '.java', sql: '.sql', bash: '.sh',
  json: '.json', yaml: '.yml', css: '.css', html: '.html', dockerfile: '',
};

interface LangSelectProps {
  value: string;
  onChange: (lang: string) => void;
}

export default function LangSelect({ value, onChange }: LangSelectProps) {
  const [open, setOpen]           = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const btnRef                    = useRef<HTMLButtonElement>(null);
  const menuRef                   = useRef<HTMLDivElement>(null);
  const color                     = LANG_COLORS[value] ?? '#5A6680';

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation();
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const dropH      = 272;
    const spaceBelow = window.innerHeight - r.bottom;
    const top        = spaceBelow >= dropH + 12 ? r.bottom + 8 : r.top - dropH - 8;
    setMenuStyle({ top, left: r.left, minWidth: Math.max(r.width, 168) });
    setOpen(true);
  }

  /* Scroll fix: only close when scrolling OUTSIDE the menu */
  useEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onResize = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  /* Auto-scroll selected item into view */
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const sel = menuRef.current?.querySelector('[data-sel="true"]') as HTMLElement | null;
      sel?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [open]);

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '3px 8px', borderRadius: 8,
    background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
    border: `1px solid ${open ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
    color: open ? '#E2E8F0' : '#94A3B8',
    cursor: 'pointer', transition: 'all 0.15s ease',
  };

  return (
    <>
      {/* ── Trigger ──────────────────────────────── */}
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => open ? (e.stopPropagation(), setOpen(false)) : openMenu(e)}
        style={btnStyle}
        onMouseEnter={(e) => {
          if (!open) {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(255,255,255,0.06)';
            el.style.color = '#CBD5E1';
            el.style.borderColor = 'rgba(255,255,255,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'transparent';
            el.style.color = '#94A3B8';
            el.style.borderColor = 'transparent';
          }
        }}
      >
        {/* Glowing dot */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}, 0 0 16px ${color}50`,
        }} />
        <span style={{ fontSize: 11, fontFamily: 'ui-monospace,monospace', letterSpacing: '0.05em', fontWeight: 500 }}>
          {value}
        </span>
        <ChevronDown size={10} style={{
          color: '#475569',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          flexShrink: 0,
        }} />
      </button>

      {/* ── Portal dropdown ──────────────────────── */}
      {open && createPortal(
        <>
          {/* Backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />

          {/* Panel */}
          <div
            ref={menuRef}
            style={{
              position: 'fixed', zIndex: 9999, ...menuStyle,
              background: 'rgba(7, 11, 22, 0.96)',
              backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              boxShadow: [
                '0 32px 64px rgba(0,0,0,0.85)',
                '0 0 0 1px rgba(255,255,255,0.04) inset',
                `0 0 40px ${color}10`,
              ].join(','),
              padding: '6px',
              maxHeight: 272,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.07) transparent',
              animation: 'lsIn 0.24s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}
          >
            {/* Subtle top gradient glow matching selected lang */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 60,
              background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)`,
              borderRadius: '16px 16px 0 0',
              pointerEvents: 'none',
            }} />

            {CODE_LANGUAGES.map((lang) => {
              const c   = LANG_COLORS[lang] ?? '#5A6680';
              const sel = lang === value;
              const ext = EXT[lang] ?? '';
              return (
                <button
                  key={lang}
                  data-sel={sel}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(lang); setOpen(false); }}
                  style={{
                    position: 'relative', width: '100%', display: 'flex',
                    alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: `1px solid ${sel ? `${c}25` : 'transparent'}`,
                    background: sel ? `${c}12` : 'transparent',
                    color: sel ? '#F1F5F9' : '#94A3B8',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.12s ease',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = sel ? `${c}1a` : 'rgba(255,255,255,0.05)';
                    el.style.color = '#F1F5F9';
                    el.style.borderColor = sel ? `${c}30` : 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = sel ? `${c}12` : 'transparent';
                    el.style.color = sel ? '#F1F5F9' : '#94A3B8';
                    el.style.borderColor = sel ? `${c}25` : 'transparent';
                  }}
                >
                  {/* Left accent bar (selected) */}
                  {sel && (
                    <span style={{
                      position: 'absolute', left: 0, top: '15%', bottom: '15%',
                      width: 3, borderRadius: 3,
                      background: `linear-gradient(to bottom, ${c}, ${c}80)`,
                      boxShadow: `0 0 10px ${c}`,
                      animation: 'lsBarIn 0.18s ease forwards',
                      transformOrigin: 'center',
                    }} />
                  )}

                  {/* Language dot */}
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: c,
                    boxShadow: sel
                      ? `0 0 10px ${c}, 0 0 20px ${c}60`
                      : `0 0 5px ${c}70`,
                    transition: 'box-shadow 0.15s ease',
                  }} />

                  {/* Name */}
                  <span style={{
                    fontSize: 12, fontFamily: 'ui-monospace,monospace',
                    letterSpacing: '0.04em', flex: 1,
                    fontWeight: sel ? 600 : 400,
                  }}>
                    {lang}
                  </span>

                  {/* Extension badge */}
                  {ext && (
                    <span style={{
                      fontSize: 10, fontFamily: 'ui-monospace,monospace',
                      color: sel ? `${c}CC` : '#334155',
                      letterSpacing: '0.02em',
                    }}>
                      {ext}
                    </span>
                  )}

                  {/* Checkmark */}
                  {sel && (
                    <Check size={12} style={{ color: '#e1ff00', flexShrink: 0,
                      filter: 'drop-shadow(0 0 4px #e1ff00)' }} />
                  )}
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
