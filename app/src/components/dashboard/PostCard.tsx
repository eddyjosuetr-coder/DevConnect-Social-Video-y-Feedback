import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, MessageCircle, Repeat2, Share2, Verified, Bookmark, Copy, Check, Pencil, MoreHorizontal, Trash2, Edit3, Flag } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { Toast } from '@/hooks/useToast';
import type { Post } from './types';
import CommentSection from './CommentSection';
import QuoteModal from './QuoteModal';
import EditPostModal from './EditPostModal';

interface PostCardProps {
  post: Post;
  addToast: (message: string, type: Toast['type']) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

function parseMediaUrls(mediaUrl: string | null): string[] {
  if (!mediaUrl) return [];
  if (mediaUrl.startsWith('[')) {
    try { return JSON.parse(mediaUrl) as string[]; } catch { /* fall through */ }
  }
  return [mediaUrl];
}

const LANG_COLORS: Record<string, string> = {
  typescript: '#3178C6', javascript: '#F7DF1E', python: '#3776AB',
  rust: '#CE422B', go: '#00ADD8', java: '#ED8B00', css: '#264DE4',
  html: '#E34F26', bash: '#4EAA25', sql: '#CC2927', json: '#292929',
  yaml: '#CB171E', tsx: '#3178C6', dockerfile: '#2496ED',
};

export default function PostCard({ post, addToast, isSaved = false, onToggleSave }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [localPost, setLocalPost] = useState(post);
  const [deleted, setDeleted] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLikedByMe ?? false);
  const [repostCount, setRepostCount] = useState(post.repostsCount);
  const [isReposted, setIsReposted] = useState(post.isRepostedByMe ?? false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [repostPopoverOpen, setRepostPopoverOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const isOwnPost = !!user && user.id === localPost.authorId;

  const createReport = trpc.reports.create.useMutation({
    onSuccess: () => {
      setReportOpen(false);
      setReportReason('');
      addToast('Reporte enviado', 'success');
    },
    onError: (err) => addToast(`Error: ${err.message}`, 'error'),
  });

  const toggleLike = trpc.posts.toggleLike.useMutation();
  const toggleRepost = trpc.reposts.toggle.useMutation();
  const quoteRepost = trpc.reposts.quote.useMutation();
  const deletePost = trpc.posts.delete.useMutation();

  const handle = localPost.authorName?.toLowerCase().replace(/\s/g, '') ?? 'dev';
  const langColor = LANG_COLORS[localPost.codeLanguage ?? ''] ?? '#5A6680';

  function handleDelete() {
    deletePost.mutate(
      { postId: localPost.id },
      {
        onSuccess: () => {
          setDeleted(true);
          addToast('Post eliminado', 'info');
          void utils.posts.list.invalidate();
          void utils.posts.listByUser.invalidate({ userId: localPost.authorId });
        },
        onError: (err) => addToast(`Error: ${err.message}`, 'error'),
      }
    );
  }

  function handleLike() {
    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    setLikesCount((prev) => nowLiked ? prev + 1 : Math.max(0, prev - 1));
    toggleLike.mutate({ postId: post.id }, {
      onSuccess: () => addToast(nowLiked ? 'Te gusto el post!' : 'Quitaste tu like', 'success'),
      onError: (err) => {
        setIsLiked(!nowLiked);
        setLikesCount((prev) => nowLiked ? Math.max(0, prev - 1) : prev + 1);
        addToast(`Error: ${err.message}`, 'error');
      },
    });
  }

  function handleRepost() {
    const nowReposted = !isReposted;
    setIsReposted(nowReposted);
    setRepostCount((prev) => nowReposted ? prev + 1 : Math.max(0, prev - 1));
    toggleRepost.mutate({ postId: post.id }, {
      onSuccess: () => addToast(nowReposted ? 'Reposteado!' : 'Repost eliminado', 'success'),
      onError: (err) => {
        setIsReposted(!nowReposted);
        setRepostCount((prev) => nowReposted ? Math.max(0, prev - 1) : prev + 1);
        addToast(`Error: ${err.message}`, 'error');
      },
    });
  }

  function handleQuoteSubmit(quoteText: string) {
    setQuoteModalOpen(false);
    if (!isReposted) {
      setIsReposted(true);
      setRepostCount((prev) => prev + 1);
    }
    quoteRepost.mutate({ postId: localPost.id, quoteText }, {
      onSuccess: () => addToast('Publicación citada!', 'success'),
      onError: (err) => addToast(`Error: ${err.message}`, 'error'),
    });
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(localPost.code ?? '');
    setCodeCopied(true);
    addToast('Codigo copiado!', 'success');
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const codeLines = (localPost.code ?? '').split('\n');

  function renderContent(text: string) {
    const parts = text.split(/(@[\wÀ-ɏ]+)/g);
    return parts.map((part, i) =>
      /^@[\wÀ-ɏ]+$/.test(part)
        ? <span key={i} className="text-[#3B82F6] font-medium">{part}</span>
        : <span key={i}>{part}</span>
    );
  }

  if (deleted) return null;

  return (
    <article
      className="relative border-b border-[#1E2535] p-5 transition-all duration-200 hover:bg-[#080B12] group"
      style={{ borderLeft: '2px solid transparent' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = '#e1ff00'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent'; }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/u/${localPost.authorId}`)}>
          {localPost.authorAvatar ? (
            <img src={localPost.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#e1ff00]/20 transition-all" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e1ff00] to-[#00ffff] flex items-center justify-center text-[#050507] font-bold text-sm">
              {(localPost.authorName ?? 'D').charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#080B12]" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span
              className="text-[#f3f2f2] font-bold text-[15px] hover:underline cursor-pointer"
              onClick={() => navigate(`/u/${localPost.authorId}`)}
            >{localPost.authorName ?? 'Developer'}</span>
            <Verified size={13} className="text-[#3B82F6] shrink-0" />
            <span className="text-[#3D4E68] text-sm font-mono">@{handle}</span>
            <span className="text-[#2A3347] text-sm">·</span>
            <span className="text-[#3D4E68] text-xs font-mono">{formatDate(localPost.createdAt)}</span>
            {user && (
              <div className="relative ml-auto shrink-0">
                <button
                  onClick={() => { setMenuOpen((v) => !v); setConfirmDelete(false); }}
                  className="p-1.5 rounded-lg text-[#3D4E68] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-colors"
                >
                  <MoreHorizontal size={15} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setMenuOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-1 z-[101] rounded-xl border border-[#1E2535] shadow-2xl overflow-hidden min-w-[190px]"
                      style={{ background: '#0D1220' }}
                    >
                      {isOwnPost ? (
                        !confirmDelete ? (
                          <>
                            <button
                              onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#C9D5E8] hover:bg-[#1E2535] hover:text-[#f3f2f2] transition-colors text-left"
                            >
                              <Edit3 size={13} className="text-[#3B82F6]" />
                              Editar publicación
                            </button>
                            <button
                              onClick={() => setConfirmDelete(true)}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left border-t border-[#1E2535]"
                            >
                              <Trash2 size={13} />
                              Eliminar publicación
                            </button>
                          </>
                        ) : (
                          <div className="px-4 py-3 space-y-2">
                            <p className="text-xs text-[#C9D5E8] font-medium">¿Eliminar este post?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-[#8B9AB0] hover:text-[#f3f2f2] hover:bg-[#1E2535] transition-all"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => { setMenuOpen(false); setConfirmDelete(false); handleDelete(); }}
                                disabled={deletePost.isPending}
                                className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#EF4444] text-white hover:bg-[#DC2626] transition-all disabled:opacity-50"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => { setMenuOpen(false); setReportOpen(true); }}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#F97316] hover:bg-[#F97316]/10 transition-colors text-left"
                        >
                          <Flag size={13} />
                          Reportar publicación
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <p className="text-[#C9D5E8] text-[15px] leading-relaxed whitespace-pre-wrap mb-3">
            {renderContent(localPost.content)}
          </p>

          {/* Code Block */}
          {localPost.code && (
            <div className="mb-4 rounded-lg overflow-hidden border border-[#1E2535] group/code">
              {/* Terminal Header */}
              <div className="bg-[#0B0E17] px-4 py-2.5 flex items-center justify-between border-b border-[#1E2535]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: langColor }}
                    />
                    <span className="text-[#5A6680] text-xs font-mono">{localPost.codeLanguage ?? 'code'}</span>
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs text-[#5A6680] hover:text-[#e1ff00] transition-colors"
                >
                  {codeCopied ? <Check size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
                  <span>{codeCopied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              {/* Code Lines */}
              <div className="bg-[#060911] p-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm font-mono">
                  <tbody>
                    {codeLines.map((line, i) => (
                      <tr key={i} className="hover:bg-[#e1ff00]/3 transition-colors">
                        <td className="pr-4 text-[#2A3347] text-right select-none w-8 py-0.5" style={{ fontSize: '11px' }}>
                          {i + 1}
                        </td>
                        <td className="text-[#A5D6FF] py-0.5 whitespace-pre">{line || ' '}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Media */}
          {localPost.mediaUrl && (() => {
            const urls = parseMediaUrls(localPost.mediaUrl);
            if (localPost.mediaType === 'video') {
              if (urls.length === 1) {
                return (
                  <div className="mb-3 rounded-xl overflow-hidden border border-[#1E2535]">
                    <video src={urls[0]} controls className="w-full block" style={{ maxHeight: '520px', background: '#060911' }} preload="metadata" />
                  </div>
                );
              }
              return (
                <div className={`mb-3 rounded-xl overflow-hidden border border-[#1E2535] grid gap-0.5 bg-[#1E2535] ${urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {urls.map((url, i) => (
                    <div key={i} className="relative overflow-hidden bg-[#040608]" style={{ aspectRatio: '16/9' }}>
                      <video src={url} controls className="w-full h-full object-cover" preload="metadata" />
                    </div>
                  ))}
                </div>
              );
            }
            if (urls.length === 1) {
              return (
                <div className="mb-3 rounded-xl overflow-hidden border border-[#1E2535]">
                  <img src={urls[0]} alt="" className="w-full block" style={{ maxHeight: '520px', objectFit: 'cover', objectPosition: 'center top' }} loading="lazy" />
                </div>
              );
            }
            // Multi-image grid
            const gridClass = urls.length === 2 ? 'grid-cols-2' : urls.length === 3 ? 'grid-cols-2' : 'grid-cols-2';
            return (
              <div className={`mb-3 rounded-xl overflow-hidden border border-[#1E2535] grid gap-0.5 bg-[#1E2535] ${gridClass}`}>
                {urls.map((url, i) => (
                  <div
                    key={i}
                    className={`relative overflow-hidden bg-[#040608] ${urls.length === 3 && i === 0 ? 'row-span-2' : ''}`}
                    style={{ aspectRatio: urls.length === 4 ? '1' : urls.length === 2 ? '4/3' : i === 0 && urls.length === 3 ? '9/16' : '1' }}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Tags */}
          {localPost.tags && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {localPost.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  onClick={() => navigate(`/tag/${tag}`)}
                  className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/8 border border-[#3B82F6]/15 px-2 py-0.5 rounded cursor-pointer hover:bg-[#3B82F6]/15 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-sm mt-1">
            <ActionBtn
              icon={<MessageCircle size={16} className={commentsOpen ? 'text-[#3B82F6]' : ''} />}
              count={localPost.commentsCount}
              active={commentsOpen}
              activeColor="#3B82F6"
              onClick={() => setCommentsOpen((v) => !v)}
            />
            {/* Repost button with popover */}
            <div className="relative">
              <button
                onClick={() => setRepostPopoverOpen((v) => !v)}
                className="flex items-center gap-1.5 p-2 rounded-lg transition-all"
                style={{ color: isReposted ? '#22C55E' : '#3D4E68' }}
                onMouseEnter={(e) => {
                  if (!isReposted) (e.currentTarget as HTMLElement).style.color = '#22C55E';
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#22C55E12';
                }}
                onMouseLeave={(e) => {
                  if (!isReposted) (e.currentTarget as HTMLElement).style.color = '#3D4E68';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <Repeat2 size={16} />
                <span className="text-xs font-mono tabular-nums">{repostCount}</span>
              </button>
              {repostPopoverOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setRepostPopoverOpen(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-1 z-[101] rounded-xl border border-[#1E2535] shadow-2xl overflow-hidden min-w-[175px]"
                    style={{ background: '#0D1220' }}>
                    <button
                      onClick={() => { handleRepost(); setRepostPopoverOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#C9D5E8] hover:bg-[#1E2535] hover:text-[#f3f2f2] transition-colors text-left"
                    >
                      <Repeat2 size={14} className="text-[#22C55E]" />
                      {isReposted ? 'Eliminar repost' : 'Repostear'}
                    </button>
                    <button
                      onClick={() => { setRepostPopoverOpen(false); setQuoteModalOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#C9D5E8] hover:bg-[#1E2535] hover:text-[#f3f2f2] transition-colors text-left border-t border-[#1E2535]"
                    >
                      <Pencil size={14} className="text-[#e1ff00]" />
                      Citar publicación
                    </button>
                  </div>
                </>
              )}
            </div>
            <ActionBtn
              icon={<Heart size={16} className={isLiked ? 'fill-[#EF4444]' : ''} />}
              count={likesCount}
              active={isLiked}
              activeColor="#EF4444"
              onClick={handleLike}
              disabled={toggleLike.isPending}
            />
            <button
              onClick={() => { onToggleSave?.(); addToast(isSaved ? 'Quitaste de guardados' : 'Post guardado!', 'success'); }}
              className={`p-2 rounded-lg transition-all ${isSaved ? 'text-[#e1ff00]' : 'text-[#3D4E68] hover:text-[#e1ff00] hover:bg-[#e1ff00]/8'}`}
            >
              <Bookmark size={16} className={isSaved ? 'fill-[#e1ff00]' : ''} />
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/#/post/${localPost.id}`); addToast('Enlace copiado!', 'info'); }}
              className="p-2 rounded-lg text-[#3D4E68] hover:text-[#3B82F6] hover:bg-[#3B82F6]/8 transition-all"
            >
              <Share2 size={16} />
            </button>
          </div>

          <CommentSection postId={localPost.id} isOpen={commentsOpen} addToast={addToast} />
        </div>
      </div>

      {quoteModalOpen && (
        <QuoteModal
          post={localPost}
          onClose={() => setQuoteModalOpen(false)}
          onSubmit={handleQuoteSubmit}
          isLoading={quoteRepost.isPending}
        />
      )}
      {editOpen && (
        <EditPostModal
          post={localPost}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setLocalPost((prev) => ({ ...prev, ...updated }));
            void utils.posts.list.invalidate();
            void utils.posts.listByUser.invalidate({ userId: localPost.authorId });
          }}
          addToast={addToast}
        />
      )}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setReportOpen(false); }}
        >
          <div className="w-full max-w-sm bg-[#0D1117] border border-[#2A3347] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-[#2A3347]">
              <h3 className="text-[#f3f2f2] font-bold">Reportar publicación</h3>
              <p className="text-[#5A6680] text-xs mt-0.5">Cuéntanos qué está mal con esta publicación</p>
            </div>
            <div className="px-5 py-4">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Describe el problema..."
                className="w-full bg-[#060911] border border-[#2A3347] focus:border-[#F97316]/50 text-[#f3f2f2] px-3 py-2.5 rounded-xl text-sm outline-none placeholder:text-[#3A4660] transition-colors resize-none"
              />
              <p className="text-[#3A4660] text-xs mt-1 text-right">{reportReason.length}/500</p>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => { setReportOpen(false); setReportReason(''); }}
                className="flex-1 px-4 py-2.5 border border-[#2A3347] text-[#8B9AB0] text-sm font-semibold rounded-xl hover:bg-[#1E2535] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => createReport.mutate({ postId: localPost.id, reason: reportReason.trim() || 'Sin razón especificada' })}
                disabled={createReport.isPending}
                className="flex-1 px-4 py-2.5 bg-[#F97316] text-white text-sm font-bold rounded-xl hover:bg-[#EA580C] disabled:opacity-50 transition-colors"
              >
                {createReport.isPending ? 'Enviando...' : 'Reportar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ActionBtn({
  icon, count, active, activeColor, onClick, disabled,
}: {
  icon: React.ReactNode;
  count: number;
  active: boolean;
  activeColor: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 p-2 rounded-lg transition-all group/action"
      style={{
        color: active ? activeColor : '#3D4E68',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = activeColor;
        (e.currentTarget as HTMLElement).style.backgroundColor = `${activeColor}12`;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = '#3D4E68';
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      <span className="text-xs font-mono tabular-nums">{count}</span>
    </button>
  );
}
