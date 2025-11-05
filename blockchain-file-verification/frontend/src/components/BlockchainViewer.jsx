const BlockchainViewer = ({ blocks, isLoading }) => {
  return (
    <section className="bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-950/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">3. Blockchain Ledger</h2>
        {isLoading && <span className="text-sm text-blue-300">Refreshing...</span>}
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
                    <td className="py-2 pr-3 text-slate-300">
                      {new Date(block.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs break-words text-slate-100">{block.fileHash}</td>
                    <td className="py-2 pr-3 font-mono text-xs break-words text-slate-400">
                      {block.previousHash}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs break-words text-slate-200">{block.hash}</td>
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
