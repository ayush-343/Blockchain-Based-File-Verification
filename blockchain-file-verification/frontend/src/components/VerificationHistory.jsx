import { formatDateTime, shortHash } from '../utils/format';

const badgeClasses = {
  success: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/40',
  match: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/40',
  miss: 'bg-amber-500/10 text-amber-200 border border-amber-500/40',
  error: 'bg-red-500/10 text-red-200 border border-red-500/30',
};

const typeLabel = {
  store: 'Stored',
  verify: 'Verified',
};

const VerificationHistory = ({ history, onClear }) => {
  if (!history.length) {
    return null;
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-950/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">Recent Activity</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-300 hover:text-slate-100 underline"
        >
          Clear history
        </button>
      </div>
      <ul className="space-y-3 text-sm">
        {history.map((item) => (
          <li
            key={item.id}
            className="bg-slate-900/40 border border-slate-700 rounded-lg p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {typeLabel[item.type] ?? 'Action'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${badgeClasses[item.status] ?? badgeClasses.success}`}>
                  {item.status}
                </span>
              </div>
              <span className="text-xs text-slate-400">{formatDateTime(item.timestamp)}</span>
            </div>
            <div className="font-mono text-xs text-slate-200 break-words">
              {shortHash(item.fileHash, 12)}
            </div>
            {item.details?.message && (
              <p className="text-xs text-slate-300">{item.details.message}</p>
            )}
            {item.details?.metadata?.fileName && (
              <p className="text-xs text-slate-400">
                File: {item.details.metadata.fileName}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default VerificationHistory;
