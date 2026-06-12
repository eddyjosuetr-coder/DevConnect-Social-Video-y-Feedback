import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import type { Toast } from '@/hooks/useToast';
import type { User } from '@db/schema';

const CODE_LANGUAGES = [
  'typescript', 'javascript', 'python', 'go', 'rust',
  'java', 'sql', 'bash', 'json', 'yaml', 'css', 'html', 'tsx', 'dockerfile',
];

interface CreatePostFormProps {
  user: User;
  onClose: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function CreatePostForm({ user, onClose, addToast }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('typescript');
  const [showCode, setShowCode] = useState(false);
  const utils = trpc.useUtils();

  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      addToast('Post publicado!', 'success');
      onClose();
    },
    onError: (err) => {
      addToast(`Error al publicar: ${err.message}`, 'error');
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost.mutate({ content, code: code || undefined, codeLanguage: lang });
  };

  return (
    <div className="border-b border-[#2A3347] p-4">
      <div className="flex items-start gap-3">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#e1ff00] flex items-center justify-center text-[#050507] font-bold shrink-0">
            {user.name?.charAt(0) ?? 'U'}
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Que estas codificando hoy?"
            className="w-full bg-transparent text-[#f3f2f2] resize-none outline-none min-h-[100px] text-[17px] placeholder:text-[#5A6680]"
            maxLength={2000}
            autoFocus
          />
          <div className="text-right text-xs text-[#5A6680] mb-2">{content.length}/2000</div>

          {showCode && (
            <div className="mb-3 p-3 bg-[#0D1117] rounded-lg border border-[#2A3347]">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-[#151A27] text-[#8B9AB0] text-sm rounded px-2 py-1 mb-2 outline-none border border-[#2A3347]"
              >
                {CODE_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Pega tu codigo aqui..."
                className="w-full bg-[#0B0F17] text-[#A5D6FF] font-mono text-sm p-3 rounded resize-none outline-none min-h-[120px]"
                spellCheck={false}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#2A3347]">
            <button
              onClick={() => setShowCode(!showCode)}
              className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                showCode ? 'text-[#3B82F6] bg-[#3B82F6]/10' : 'text-[#3B82F6] hover:bg-[#3B82F6]/10'
              }`}
            >
              <Code2 size={20} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#5A6680] hover:text-[#f3f2f2] rounded-full"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || createPost.isPending}
                className="bg-[#e1ff00] text-[#050507] font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#d4e600] transition-colors disabled:opacity-50"
              >
                {createPost.isPending ? 'Publicando...' : 'Postear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
