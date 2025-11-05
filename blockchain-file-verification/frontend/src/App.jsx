import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import FileUploader from './components/FileUploader';
import BlockchainViewer from './components/BlockchainViewer';
import StatsBoard from './components/StatsBoard';
import BlockDetailCard from './components/BlockDetailCard';
import VerificationHistory from './components/VerificationHistory';
import { formatBytes } from './utils/format';

const emptyVerification = {
  exists: false,
  message: '',
  fileHash: '',
  block: null,
};

const App = () => {
  const [currentHash, setCurrentHash] = useState('');
  const [currentMetadata, setCurrentMetadata] = useState(null);
  const [note, setNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(emptyVerification);
  const [blocks, setBlocks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [latestBlock, setLatestBlock] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [toast, setToast] = useState('');

  const isHashValid = useMemo(() => /^[a-f0-9]{64}$/.test(currentHash), [currentHash]);

  const pushHistoryEntry = useCallback((entry) => {
    setHistory((prev) => [entry, ...prev].slice(0, 8));
  }, []);

  const loadChainData = useCallback(
    async (showErrorToast = true) => {
      setIsLoadingBlocks(true);
      try {
        const [chainResponse, metricsResponse] = await Promise.all([
          axios.get('/api/getBlockchain'),
          axios.get('/api/metrics'),
        ]);

        const fetchedBlocks = chainResponse.data?.chain ?? [];
        setBlocks(fetchedBlocks);

        if (metricsResponse.data) {
          setMetrics(metricsResponse.data);
          setLatestBlock(metricsResponse.data.latestBlock ?? null);
        } else if (fetchedBlocks.length) {
          setLatestBlock(fetchedBlocks[fetchedBlocks.length - 1]);
        }

        setLastRefreshed(new Date().toISOString());
      } catch (error) {
        console.error(error);
        if (showErrorToast) {
          setToast('Could not load blockchain. Ensure backend is running.');
        }
      } finally {
        setIsLoadingBlocks(false);
      }
    },
    []
  );

  useEffect(() => {
    loadChainData();
  }, [loadChainData]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleHashGenerated = (details) => {
    if (!details || !details.hash) {
      setCurrentHash('');
      setCurrentMetadata(null);
    } else {
      setCurrentHash(details.hash);
      setCurrentMetadata({
        fileName: details.fileName ?? '',
        fileSize: details.fileSize ?? null,
      });
    }
    setNote('');
    setVerificationResult(emptyVerification);
  };

  const handleHashInputChange = (event) => {
    const input = event.target.value.toLowerCase().replace(/[^a-f0-9]/g, '').slice(0, 64);
    setCurrentHash(input);
    if (!input) {
      setCurrentMetadata(null);
    }
    setVerificationResult(emptyVerification);
  };

  const handleRecordHash = async () => {
    if (!isHashValid) {
      setToast('Provide a valid 64-character SHA-256 hash.');
      return;
    }

    setIsRecording(true);
    try {
      const { data } = await axios.post('/api/addFileHash', {
        fileHash: currentHash,
        fileName: currentMetadata?.fileName,
        fileSize: currentMetadata?.fileSize,
        notes: note,
      });

      setToast('Hash stored on blockchain.');
      setLatestBlock(data.block);
      pushHistoryEntry({
        id: `store-${Date.now()}`,
        type: 'store',
        status: 'success',
        fileHash: data.block.fileHash,
        timestamp: data.block.timestamp,
        details: { metadata: data.block.metadata },
      });
      setVerificationResult(emptyVerification);
      setNote('');
      await loadChainData(false);
    } catch (error) {
      console.error(error);
      setToast('Failed to store hash. Check backend service.');
      pushHistoryEntry({
        id: `store-${Date.now()}`,
        type: 'store',
        status: 'error',
        fileHash: currentHash,
        timestamp: new Date().toISOString(),
        details: { message: 'Failed to store hash' },
      });
    } finally {
      setIsRecording(false);
    }
  };

  const handleVerifyHash = async () => {
    if (!isHashValid) {
      setToast('Provide a valid 64-character SHA-256 hash.');
      return;
    }

    setIsVerifying(true);
    try {
      const { data } = await axios.post('/api/verifyFileHash', { fileHash: currentHash });
      setVerificationResult({
        exists: data.exists,
        message: data.message,
        fileHash: data.fileHash,
        block: data.block ?? null,
      });
      pushHistoryEntry({
        id: `verify-${Date.now()}`,
        type: 'verify',
        status: data.exists ? 'match' : 'miss',
        fileHash: data.fileHash,
        timestamp: new Date().toISOString(),
        details: {
          message: data.message,
          metadata: data.block?.metadata,
        },
      });
    } catch (error) {
      console.error(error);
      setToast('Verification request failed.');
      pushHistoryEntry({
        id: `verify-${Date.now()}`,
        type: 'verify',
        status: 'error',
        fileHash: currentHash,
        timestamp: new Date().toISOString(),
        details: { message: 'Verification request failed' },
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 pb-16">
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold">Blockchain File Verification</h1>
        <p className="text-slate-300 mt-2 max-w-3xl">
          Upload a file, store its fingerprint on a proof-of-work blockchain, and verify integrity on demand.
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-6 space-y-6">
        <StatsBoard metrics={metrics} />

        <FileUploader onHashGenerated={handleHashGenerated} />

        <section className="bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-950/30 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">2. Store &amp; Verify</h2>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)]">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Active hash (paste or generate)</span>
              <input
                value={currentHash}
                onChange={handleHashInputChange}
                placeholder="64-character SHA-256 hash"
                maxLength={64}
                className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Optional notes</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add context about this file hash (e.g., purpose, owner)."
                rows={2}
                className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          {currentMetadata && (
            <div className="mt-4 text-xs text-slate-300 bg-slate-900/50 border border-slate-700 rounded-md px-3 py-2">
              <p className="font-semibold text-slate-200">Active file metadata</p>
              {currentMetadata.fileName && <p>Name: {currentMetadata.fileName}</p>}
              {typeof currentMetadata.fileSize === 'number' && (
                <p>Size: {formatBytes(currentMetadata.fileSize)}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row mt-5">
            <button
              type="button"
              onClick={handleRecordHash}
              disabled={!isHashValid || isRecording}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700 disabled:cursor-not-allowed transition"
            >
              {isRecording ? 'Mining…' : 'Add Hash to Blockchain'}
            </button>
            <button
              type="button"
              onClick={handleVerifyHash}
              disabled={!isHashValid || isVerifying}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed transition"
            >
              {isVerifying ? 'Checking…' : 'Verify Hash'}
            </button>
          </div>

          {verificationResult.message && (
            <div
              className={`mt-4 rounded-lg border p-4 text-sm ${
                verificationResult.exists
                  ? 'border-emerald-600 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-600 bg-amber-500/10 text-amber-200'
              }`}
            >
              <p className="font-semibold">{verificationResult.message}</p>
              <p className="font-mono break-words mt-2 text-xs">{verificationResult.fileHash}</p>
            </div>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <BlockDetailCard
            title="Latest Block"
            block={latestBlock}
            emptyMessage="No blocks mined yet. Add your first hash to populate the chain."
          />
          <BlockDetailCard
            title="Verification Result"
            block={verificationResult.exists ? verificationResult.block : null}
            emptyMessage={
              verificationResult.message || 'Run a verification to inspect block details here.'
            }
          />
        </div>

        <BlockchainViewer
          blocks={blocks}
          isLoading={isLoadingBlocks}
          onRefresh={() => loadChainData()}
          lastUpdated={lastRefreshed}
        />

        <VerificationHistory history={history} onClear={clearHistory} />
      </section>

      {toast && (
        <aside className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </aside>
      )}
    </main>
  );
};

export default App;
