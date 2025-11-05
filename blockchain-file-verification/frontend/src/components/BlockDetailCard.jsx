import { formatBytes, formatDateTime, shortHash } from '../utils/format';

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-sm text-slate-200 break-words">{value}</p>
  </div>
);

const BlockDetailCard = ({ title, block, emptyMessage }) => (
  <section className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-md shadow-slate-950/30">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {block && <span className="text-xs text-slate-400">#{block.index}</span>}
    </div>

    {!block ? (
      <p className="text-sm text-slate-400">{emptyMessage}</p>
    ) : (
      <div className="space-y-3 text-sm">
        <InfoItem label="Timestamp" value={formatDateTime(block.timestamp)} />
        <InfoItem label="Hash" value={<span className="font-mono" title={block.hash}>{shortHash(block.hash, 12)}</span>} />
        <InfoItem
          label="File Hash"
          value={<span className="font-mono" title={block.fileHash}>{shortHash(block.fileHash, 12)}</span>}
        />
        <InfoItem
          label="Previous Hash"
          value={<span className="font-mono" title={block.previousHash}>{shortHash(block.previousHash, 12)}</span>}
        />
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="Nonce" value={block.nonce} />
          <InfoItem
            label="File Size"
            value={
              typeof block.metadata?.fileSize === 'number'
                ? formatBytes(block.metadata.fileSize)
                : '—'
            }
          />
        </div>
        {block.metadata?.fileName && <InfoItem label="File Name" value={block.metadata.fileName} />}
        {block.metadata?.notes && (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Notes</p>
            <p className="text-sm text-slate-300 italic whitespace-pre-wrap break-words">
              {block.metadata.notes}
            </p>
          </div>
        )}
      </div>
    )}
  </section>
);

export default BlockDetailCard;
