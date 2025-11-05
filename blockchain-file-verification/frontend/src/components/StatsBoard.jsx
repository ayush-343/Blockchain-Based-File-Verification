import { formatDateTime, formatRelativeTime } from '../utils/format';

const StatCard = ({ label, value, footer }) => (
  <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 shadow-sm shadow-slate-950/20">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-2xl font-semibold text-slate-100 mt-1">{value}</p>
    {footer && <p className="text-xs text-slate-400 mt-2">{footer}</p>}
  </div>
);

const StatsBoard = ({ metrics }) => {
  if (!metrics) {
    return null;
  }

  const {
    totalBlocks,
    recordedHashes,
    totalUniqueHashes,
    difficulty,
    lastMinedAt,
    genesisTimestamp,
    chainAgeSeconds,
    averageNonce,
    valid,
  } = metrics;

  const chainAgeHours = Number.isFinite(chainAgeSeconds)
    ? Math.max(0, Math.round(chainAgeSeconds / 3600))
    : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Blocks"
        value={totalBlocks}
        footer={valid ? 'Chain validated' : 'Chain integrity warning'}
      />
      <StatCard
        label="Recorded Hashes"
        value={recordedHashes}
        footer={`${totalUniqueHashes} unique fingerprint${totalUniqueHashes === 1 ? '' : 's'}`}
      />
      <StatCard
        label="Difficulty"
        value={`PoW ${difficulty}`}
        footer={`Avg. nonce ${averageNonce}`}
      />
      <StatCard
        label="Latest Block"
        value={lastMinedAt ? formatRelativeTime(lastMinedAt) : '—'}
        footer={`Mined at ${formatDateTime(lastMinedAt)}`}
      />
      <StatCard
        label="Genesis"
        value={formatDateTime(genesisTimestamp)}
        footer={`≈ ${chainAgeHours} hour${chainAgeHours === 1 ? '' : 's'} running`}
      />
    </section>
  );
};

export default StatsBoard;
