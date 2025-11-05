const express = require('express');
const { Blockchain } = require('../blockchain');

const router = express.Router();
const blockchain = new Blockchain({ difficulty: 2 });

const normalizeHash = (hash) => (typeof hash === 'string' ? hash.trim().toLowerCase() : '');

const blockToResponse = (block) => {
  if (!block) {
    return null;
  }

  return {
    index: block.index,
    timestamp: block.timestamp,
    fileHash: block.fileHash,
    previousHash: block.previousHash,
    hash: block.hash,
    nonce: block.nonce,
    metadata: block.metadata,
  };
};

const extractMetadata = (body = {}) => {
  const metadata = {};
  const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const fileSizeRaw = body.fileSize;

  if (fileName) {
    metadata.fileName = fileName.slice(0, 180);
  }

  if (notes) {
    metadata.notes = notes.slice(0, 500);
  }

  if (typeof fileSizeRaw === 'number' && Number.isFinite(fileSizeRaw) && fileSizeRaw >= 0) {
    metadata.fileSize = Math.round(fileSizeRaw);
  } else if (typeof fileSizeRaw === 'string' && fileSizeRaw.trim() !== '') {
    const parsed = Number(fileSizeRaw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      metadata.fileSize = Math.round(parsed);
    }
  }

  return metadata;
};

router.post('/addFileHash', (req, res) => {
  const hash = normalizeHash(req.body?.fileHash);

  if (!hash) {
    return res.status(400).json({ message: 'fileHash is required' });
  }

  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return res.status(400).json({ message: 'fileHash must be a lowercase SHA-256 hex digest' });
  }

  const block = blockchain.addBlock(hash, extractMetadata(req.body));

  return res.status(201).json({
    message: 'File hash recorded successfully',
    block: blockToResponse(block),
    chainLength: blockchain.chain.length,
  });
});

router.post('/verifyFileHash', (req, res) => {
  const hash = normalizeHash(req.body?.fileHash);

  if (!hash) {
    return res.status(400).json({ message: 'fileHash is required' });
  }

  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return res.status(400).json({ message: 'fileHash must be a lowercase SHA-256 hex digest' });
  }

  const block = blockchain.findBlockByHash(hash);
  const exists = Boolean(block);

  return res.status(200).json({
    fileHash: hash,
    exists,
    block: blockToResponse(block),
    message: exists ? 'Hash found. File is verified.' : 'Hash not found. File may have been altered.',
  });
});

router.get('/getBlockchain', (req, res) => {
  return res.status(200).json({
    length: blockchain.chain.length,
    valid: blockchain.isChainValid(),
    difficulty: blockchain.difficulty,
    chain: blockchain.chain.map((block) => blockToResponse(block)),
  });
});

router.get('/getBlock/:index', (req, res) => {
  const index = Number.parseInt(req.params.index, 10);

  if (Number.isNaN(index) || index < 0) {
    return res.status(400).json({ message: 'Index must be a non-negative integer' });
  }

  const block = blockchain.getBlockByIndex(index);

  if (!block) {
    return res.status(404).json({ message: `No block found at index ${index}` });
  }

  return res.status(200).json({ block: blockToResponse(block) });
});

router.get('/findByHash/:hash', (req, res) => {
  const hash = normalizeHash(req.params.hash);

  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return res.status(400).json({ message: 'Provide a valid lowercase SHA-256 hash.' });
  }

  const block = blockchain.findBlockByHash(hash);

  if (!block) {
    return res.status(404).json({ message: 'Hash not recorded on the blockchain' });
  }

  return res.status(200).json({ block: blockToResponse(block) });
});

router.get('/metrics', (req, res) => {
  const stats = blockchain.getStats();
  const latestBlock = blockchain.getLatestBlock();

  return res.status(200).json({
    ...stats,
    valid: blockchain.isChainValid(),
    latestBlock: blockToResponse(latestBlock),
  });
});

module.exports = router;
