import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, User } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { formatDate } from '@/lib/utils';

export default function AdminPanel() {
  const utils = trpc.useUtils();

  const { data: reports = [], isLoading } = trpc.reports.list.useQuery();

  const resolve = trpc.reports.resolve.useMutation({
    onSuccess: () => void utils.reports.list.invalidate(),
  });

  const pending = reports.filter((r) => r.status === 'pending');
  const resolved = reports.filter((r) => r.status === 'resolved');

  return (
    <div>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#2A3347] flex items-center gap-2">
        <ShieldCheck size={18} className="text-[#e1ff00]" />
        <h2 className="text-[#f3f2f2] font-bold">Panel de administración</h2>
        {pending.length > 0 && (
          <span className="ml-auto text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-2 py-0.5 rounded-full">
            {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-[#5A6680]" />
        </div>
      )}

      {!isLoading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <CheckCircle2 size={36} className="text-[#22C55E]" />
          <p className="text-[#8B9AB0] text-sm">No hay reportes pendientes</p>
        </div>
      )}

      {/* Pending reports */}
      {pending.length > 0 && (
        <div>
          <p className="px-5 pt-4 pb-2 text-xs font-bold text-[#5A6680] uppercase tracking-wider">
            Pendientes
          </p>
          {pending.map((r) => (
            <ReportRow
              key={r.id}
              report={r}
              onResolve={() => resolve.mutate({ reportId: r.id })}
              isResolving={resolve.isPending && resolve.variables?.reportId === r.id}
            />
          ))}
        </div>
      )}

      {/* Resolved reports */}
      {resolved.length > 0 && (
        <div>
          <p className="px-5 pt-4 pb-2 text-xs font-bold text-[#5A6680] uppercase tracking-wider">
            Resueltos
          </p>
          {resolved.map((r) => (
            <ReportRow key={r.id} report={r} resolved />
          ))}
        </div>
      )}
    </div>
  );
}

type Report = {
  id: number;
  reporterId: number;
  postId: number | null;
  targetUserId: number | null;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: Date | string;
};

function ReportRow({
  report,
  onResolve,
  isResolving,
  resolved = false,
}: {
  report: Report;
  onResolve?: () => void;
  isResolving?: boolean;
  resolved?: boolean;
}) {
  return (
    <div className={`px-5 py-4 border-b border-[#1E2535] ${resolved ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${resolved ? 'bg-[#22C55E]/10' : 'bg-[#EF4444]/10'}`}>
          {resolved
            ? <CheckCircle2 size={14} className="text-[#22C55E]" />
            : <AlertCircle size={14} className="text-[#EF4444]" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-[#5A6680] flex items-center gap-1">
              <User size={10} />
              Reportado por usuario #{report.reporterId}
            </span>
            {report.postId && (
              <span className="text-xs text-[#3D4E68]">· Post #{report.postId}</span>
            )}
            <span className="text-xs text-[#3D4E68] ml-auto">{formatDate(report.createdAt)}</span>
          </div>
          <p className="text-sm text-[#C9D5E8] leading-relaxed">{report.reason}</p>
          {!resolved && onResolve && (
            <button
              onClick={onResolve}
              disabled={isResolving}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:text-[#4ADE80] disabled:opacity-50 transition-colors"
            >
              {isResolving
                ? <Loader2 size={12} className="animate-spin" />
                : <CheckCircle2 size={12} />
              }
              Marcar como resuelto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
