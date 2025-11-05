import { useState } from 'react';
import { computeSHA256 } from '../utils/hash';

const FileUploader = ({ onHashGenerated }) => {
  const [fileName, setFileName] = useState('');
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setError('Please choose a file.');
      setFileName('');
      setHash('');
      return;
    }

    setIsProcessing(true);
    setError('');
    setFileName(file.name);

    try {
      const digest = await computeSHA256(file);
      setHash(digest);
      onHashGenerated(digest);
    } catch (err) {
      console.error(err);
      setError('Failed to compute hash. Try another file.');
      setHash('');
      onHashGenerated('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-950/30">
      <h2 className="text-xl font-semibold mb-3">1. Upload File</h2>
      <p className="text-sm text-slate-300 mb-4">
        Select a file to compute its SHA-256 hash locally in your browser. No file data leaves your device.
      </p>
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 transition"
      >
        <span className="text-slate-200">Click to choose a file</span>
        <span className="text-xs text-slate-400 mt-1">SHA-256 hash is calculated instantly</span>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
      </label>

      <div className="mt-4 space-y-2">
        {fileName && <p className="text-sm text-slate-200">Selected: {fileName}</p>}
        {isProcessing && <p className="text-sm text-blue-300">Computing hash...</p>}
        {hash && (
          <p className="text-xs font-mono break-words bg-slate-900/60 border border-slate-700 rounded-md p-3">
            {hash}
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </section>
  );
};

export default FileUploader;
