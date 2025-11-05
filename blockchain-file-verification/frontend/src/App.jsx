import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import FileUploader from './components/FileUploader';
import BlockchainViewer from './components/BlockchainViewer';

const emptyVerification = {
  exists: false,
  message: '',
  fileHash: '',
};

const App = () => {
  const [currentHash, setCurrentHash] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(emptyVerification);
  const [blocks, setBlocks] = useState([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [toast, setToast] = useState('');

  const hasHash = useMemo(() => currentHash.length === 64, [currentHash]);

  const fetchBlockchain = useCallback(async () => {
    setIsLoadingBlocks(true);
    try {
      const { data } = await axios.get('/api/getBlockchain');
      setBlocks(data.chain ?? []);
    } catch (error) {
      console.error(error);
      setToast('Could not load blockchain. Ensure backend is running.');
    } finally {
      setIsLoadingBlocks(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockchain();
  }, [fetchBlockchain]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleHashGenerated = (hash) => {
    setCurrentHash(hash);
    setVerificationResult(emptyVerification);
  };

  const handleRecordHash = async () => {
    if (!hasHash) {
      setToast('Generate a hash first.');
      return;
    }

    setIsRecording(true);
    try {
      await axios.post('/api/addFileHash', { fileHash: currentHash });
      setToast('Hash stored on blockchain.');
      await fetchBlockchain();
    } catch (error) {
      console.error(error);
      setToast('Failed to store hash. Check backend service.');
    } finally {
      setIsRecording(false);
    }
  };

  const handleVerifyHash = async () => {
    if (!hasHash) {
      setToast('Generate a hash first.');
      return;
    }

    setIsVerifying(true);
    try {
      const { data } = await axios.post('/api/verifyFileHash', { fileHash: currentHash });
      setVerificationResult({
        exists: data.exists,
        message: data.message,
        fileHash: data.fileHash,
      });
    } catch (error) {
      console.error(error);
      setToast('Verification request failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold">Blockchain File Verification</h1>
        <p className="text-slate-300 mt-2">
          Upload a file, store its fingerprint on a local blockchain, and prove its integrity anytime.
        </p>
      </header>

      <section className="max-w-5xl mx-auto px-6 pb-16 space-y-6">
        <FileUploader onHashGenerated={handleHashGenerated} />

        <section className="bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-950/30">
          <h2 className="text-xl font-semibold mb-3">2. Store &amp; Verify</h2>
          <p className="text-sm text-slate-300 mb-4">
            Persist the hash on the blockchain or verify whether it has already been recorded.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRecordHash}
              disabled={!hasHash || isRecording}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700 disabled:cursor-not-allowed transition"
            >
              {isRecording ? 'Mining…' : 'Add Hash to Blockchain'}
            </button>
            <button
              type="button"
              onClick={handleVerifyHash}
              disabled={!hasHash || isVerifying}
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

        <BlockchainViewer blocks={blocks} isLoading={isLoadingBlocks} />
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
