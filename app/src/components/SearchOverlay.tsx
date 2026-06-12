import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockDevs = [
  { name: 'Alejandro Marin', username: '@alexmarin', role: 'Frontend Dev', image: '/images/profile1.jpg' },
  { name: 'Sofia Jimenez', username: '@sofiaj', role: 'UI Engineer', image: '/images/profile2.jpg' },
  { name: 'Miguel Rios', username: '@mrios', role: 'Full Stack', image: '/images/profile3.jpg' },
  { name: 'Divya Krishnan', username: '@divyak', role: 'Creative Dev', image: '/images/profile4.jpg' },
  { name: 'Carlos Mendez', username: '@cmendez', role: 'Backend', image: '/images/profile5.jpg' },
  { name: 'Yuki Tanaka', username: '@yukit', role: 'DevOps', image: '/images/profile6.jpg' },
  { name: 'Daniel Okafor', username: '@dokafor', role: 'Data Eng', image: '/images/profile7.jpg' },
  { name: 'Ravi Patel', username: '@ravipatel', role: 'Security', image: '/images/profile8.jpg' },
];

const mockTags = ['react', 'typescript', 'nodejs', 'python', 'rust', 'graphql', 'docker', 'kubernetes'];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof mockDevs>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      setResults(mockDevs.filter(
        (d) => d.name.toLowerCase().includes(q) || d.role.toLowerCase().includes(q) || d.username.includes(q)
      ));
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4">
        {/* Search input */}
        <div className="bg-[#151A27] border border-[#2A3347] flex items-center gap-3 px-4">
          <Search size={18} className="text-[#5A6680] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar desarrolladores, tecnologias, hashtags..."
            className="flex-1 bg-transparent text-[#f3f2f2] py-4 text-sm outline-none placeholder:text-[#3A4460]"
          />
          <button onClick={onClose} className="text-[#5A6680] hover:text-[#f3f2f2] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="bg-[#151A27] border border-t-0 border-[#2A3347] max-h-[50vh] overflow-y-auto">
            {results.length > 0 ? (
              <>
                <div className="px-4 py-2 text-xs font-mono text-[#5A6680] tracking-wider">DESARROLLADORES</div>
                {results.map((dev) => (
                  <button
                    key={dev.username}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1E2535] transition-colors text-left"
                    onClick={onClose}
                  >
                    <img src={dev.image} alt={dev.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="text-[#f3f2f2] text-sm font-medium">{dev.name}</div>
                      <div className="text-[#5A6680] text-xs font-mono">{dev.username} · {dev.role}</div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-6 text-center text-[#5A6680] text-sm">
                No se encontraron resultados para &quot;{query}&quot;
              </div>
            )}
          </div>
        )}

        {/* Suggestions when empty */}
        {!query.trim() && (
          <div className="bg-[#151A27] border border-t-0 border-[#2A3347] p-4">
            <div className="text-xs font-mono text-[#5A6680] tracking-wider mb-3">TEMAS POPULARES</div>
            <div className="flex flex-wrap gap-2">
              {mockTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="text-sm text-[#8B9AB0] bg-[#0F131D] border border-[#2A3347] px-3 py-1.5 hover:border-[#e1ff00] hover:text-[#e1ff00] transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
