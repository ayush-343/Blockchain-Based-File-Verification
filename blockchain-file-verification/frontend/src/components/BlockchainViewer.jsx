import { formatBytes, formatDateTime, formatRelativeTime, shortHash } from '../utils/format';

const BlockchainViewer = ({ blocks, isLoading, onRefresh, lastUpdated }) => {
  return (
    <section className="bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-950/30">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">3. Blockchain Ledger</h2>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {lastUpdated && <span>Updated {formatRelativeTime(lastUpdated)}</span>}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1 rounded-md border border-slate-600 text-slate-200 hover:border-blue-400 hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
      {blocks.length === 0 ? (
        <p className="text-sm text-slate-300">No blocks mined yet. Add a hash to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="uppercase text-xs text-slate-400">
              <tr>
                <th className="py-2 pr-3">Index</th>
                <th className="py-2 pr-3">Timestamp</th>
                <th className="py-2 pr-3">File Info</th>
                <th className="py-2 pr-3">File Hash</th>
                <th className="py-2 pr-3">Prev Hash</th>
                <th className="py-2 pr-3">Hash</th>
                <th className="py-2 pr-3">Nonce</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {blocks
                .slice()
                .reverse()
                .map((block) => (
                  <tr key={block.hash} className="border-t border-slate-700">
                    <td className="py-2 pr-3 font-semibold text-slate-200">{block.index}</td>
                    <td className="py-2 pr-3 text-slate-300">{formatDateTime(block.timestamp)}</td>
                    <td className="py-2 pr-3 text-slate-300">
                      {block.metadata?.fileName ? (
                        <p className="font-medium text-slate-100">{block.metadata.fileName}</p>
                      ) : (
                        <p className="text-slate-500">—</p>
                      )}
                      {typeof block.metadata?.fileSize === 'number' && (
                        <p className="text-xs text-slate-400">{formatBytes(block.metadata.fileSize)}</p>
                      )}
                      {block.metadata?.notes && (
                        <p className="text-xs text-slate-400 italic mt-1">{block.metadata.notes}</p>
                      )}
                    </td>
                    <td
                      className="py-2 pr-3 font-mono text-xs break-words text-slate-100"
                      title={block.fileHash}
                    >
                      {shortHash(block.fileHash)}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs break-words text-slate-400">
                      <span title={block.previousHash}>{shortHash(block.previousHash)}</span>
                    </td>
                    <td
                      className="py-2 pr-3 font-mono text-xs break-words text-slate-200"
                      title={block.hash}
                    >
                      {shortHash(block.hash)}
                    </td>
                    <td className="py-2 pr-3 text-slate-300">{block.nonce}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default BlockchainViewer;
