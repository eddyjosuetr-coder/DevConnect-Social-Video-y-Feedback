import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react';
import type { Toast } from '../hooks/useToast';

gsap.registerPlugin(ScrollTrigger);

interface FeedPreviewProps {
  addToast: (message: string, type: Toast['type']) => void;
}

interface PostState {
  isLiked: boolean;
  likes: number;
  comments: number;
  reposts: number;
  showComments: boolean;
  commentText: string;
  commentsList: { author: string; text: string }[];
}

const initialPosts = [
  {
    author: 'Alejandro Marin',
    username: '@alexmarin',
    avatar: '/images/profile1.jpg',
    time: '2h',
    content: 'Acabo de deployar mi nuevo proyecto con React 19 y Server Components. El performance es increible, los tiempos de carga se redujeron un 60%.',
    code: null as string | null,
    likes: 24,
    comments: 8,
    reposts: 3,
    tags: ['react', 'servercomponents', 'performance'],
  },
  {
    author: 'Yuki Tanaka',
    username: '@yukit',
    avatar: '/images/profile6.jpg',
    time: '4h',
    content: 'Nuevo pipeline CI/CD con GitHub Actions + Terraform. Deploy automatico a multi-region en menos de 3 minutos.',
    code: `name: Deploy Multi-Region
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: terraform apply -auto-approve`,
    likes: 47,
    comments: 15,
    reposts: 12,
    tags: ['devops', 'terraform', 'githubactions'],
  },
  {
    author: 'Ravi Patel',
    username: '@ravipatel',
    avatar: '/images/profile8.jpg',
    time: '6h',
    content: 'Encontre una vulnerabilidad critica en una libreria muy usada. Ya reporte el issue y publique un patch temporal. Siempre audita tus dependencias.',
    code: null,
    likes: 132,
    comments: 34,
    reposts: 28,
    tags: ['security', 'opensource', 'bugbounty'],
  },
];

export default function FeedPreview({ addToast }: FeedPreviewProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<PostState[]>(
    initialPosts.map((p) => ({
      isLiked: false,
      likes: p.likes,
      comments: p.comments,
      reposts: p.reposts,
      showComments: false,
      commentText: '',
      commentsList: [],
    }))
  );

  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>('.post-card');
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            delay: i * 0.1,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const toggleLike = (idx: number) => {
    setPosts((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        isLiked: !next[idx].isLiked,
        likes: next[idx].isLiked ? next[idx].likes - 1 : next[idx].likes + 1,
      };
      return next;
    });
    if (!posts[idx].isLiked) {
      addToast('Te gusto la publicacion', 'success');
    }
  };

  const toggleRepost = (idx: number) => {
    setPosts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], reposts: next[idx].reposts + 1 };
      return next;
    });
    addToast('Publicacion reposteada', 'success');
  };

  const toggleComments = (idx: number) => {
    setPosts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], showComments: !next[idx].showComments };
      return next;
    });
  };

  const submitComment = (idx: number) => {
    const text = posts[idx].commentText.trim();
    if (!text) return;
    setPosts((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        commentsList: [...next[idx].commentsList, { author: 'Tu', text }],
        comments: next[idx].comments + 1,
        commentText: '',
      };
      return next;
    });
    addToast('Comentario publicado', 'success');
  };

  return (
    <section ref={sectionRef} id="feed" className="relative bg-[#0B0F17] py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-mono text-xs text-[#ff1493] tracking-widest mb-4 block">FEED</span>
          <h2 className="font-medium text-[#f3f2f2] mb-3" style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1px' }}>
            Asi se ve el feed
          </h2>
          <p className="text-[#5A6680] text-base max-w-lg mx-auto">
            Comparte codigo, ideas y proyectos. La comunidad te espera.
          </p>
        </div>

        <div className="space-y-4">
          {initialPosts.map((post, idx) => (
            <div key={idx} className="post-card bg-[#151A27] border border-[#2A3347] p-5 hover:border-[#3B82F6]/30 transition-all opacity-0">
              <div className="flex items-start gap-3 mb-3">
                <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover grayscale" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#f3f2f2] font-semibold text-sm">{post.author}</span>
                    <span className="text-[#5A6680] text-xs">{post.username}</span>
                    <span className="text-[#5A6680] text-xs">· {post.time}</span>
                  </div>
                </div>
              </div>

              <p className="text-[#E2E8F0] text-[15px] leading-relaxed mb-3">{post.content}</p>

              {post.code && (
                <div className="mb-3 rounded overflow-hidden border border-[#2A3347]">
                  <div className="bg-[#0B0F17] px-3 py-1.5 flex items-center justify-between border-b border-[#2A3347]">
                    <span className="text-xs text-[#5A6680] font-mono">yaml</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(post.code || ''); addToast('Codigo copiado', 'success'); }}
                      className="text-xs text-[#5A6680] hover:text-[#E2E8F0]"
                    >
                      Copiar
                    </button>
                  </div>
                  <pre className="bg-[#0D1117] p-3 overflow-x-auto">
                    <code className="text-sm font-mono text-[#A5D6FF]">{post.code}</code>
                  </pre>
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-sm text-[#3B82F6] hover:underline cursor-pointer">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 pt-3 border-t border-[#2A3347]">
                <button
                  onClick={() => toggleLike(idx)}
                  className={`flex items-center gap-1.5 transition-colors ${posts[idx].isLiked ? 'text-[#EF4444]' : 'text-[#5A6680] hover:text-[#EF4444]'}`}
                >
                  <Heart size={16} className={posts[idx].isLiked ? 'fill-[#EF4444]' : ''} />
                  <span className="text-xs">{posts[idx].likes}</span>
                </button>
                <button
                  onClick={() => toggleComments(idx)}
                  className="flex items-center gap-1.5 text-[#5A6680] hover:text-[#3B82F6] transition-colors"
                >
                  <MessageCircle size={16} />
                  <span className="text-xs">{posts[idx].comments}</span>
                </button>
                <button
                  onClick={() => toggleRepost(idx)}
                  className="flex items-center gap-1.5 text-[#5A6680] hover:text-[#22C55E] transition-colors"
                >
                  <Repeat2 size={16} />
                  <span className="text-xs">{posts[idx].reposts}</span>
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); addToast('Enlace copiado', 'info'); }}
                  className="flex items-center gap-1.5 text-[#5A6680] hover:text-[#3B82F6] transition-colors ml-auto"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Comments section */}
              {posts[idx].showComments && (
                <div className="mt-4 pt-4 border-t border-[#2A3347]">
                  {posts[idx].commentsList.map((c, ci) => (
                    <div key={ci} className="flex items-start gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[#e1ff00]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#e1ff00] text-[10px] font-bold">T</span>
                      </div>
                      <div className="bg-[#0F131D] px-3 py-2 flex-1">
                        <span className="text-xs text-[#e1ff00] font-semibold">{c.author}</span>
                        <p className="text-sm text-[#E2E8F0]">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={posts[idx].commentText}
                      onChange={(e) => setPosts((prev) => {
                        const next = [...prev]; next[idx] = { ...next[idx], commentText: e.target.value }; return next;
                      })}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment(idx)}
                      placeholder="Escribe un comentario..."
                      className="flex-1 bg-[#0F131D] border border-[#2A3347] text-[#f3f2f2] px-3 py-2 text-sm outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#3A4460]"
                    />
                    <button
                      onClick={() => submitComment(idx)}
                      className="bg-[#3B82F6] text-white px-4 py-2 text-sm font-medium hover:bg-[#2563EB] transition-colors"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
