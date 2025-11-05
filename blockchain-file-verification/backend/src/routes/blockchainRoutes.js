const express = require('express');
const { Blockchain } = require('../blockchain');

const router = express.Router();
const blockchain = new Blockchain({ difficulty: 2 });

const normalizeHash = (hash) => (typeof hash === 'string' ? hash.trim().toLowerCase() : '');

router.post('/addFileHash', (req, res) => {
  const hash = normalizeHash(req.body?.fileHash);

  if (!hash) {
    return res.status(400).json({ message: 'fileHash is required' });
  }

  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return res.status(400).json({ message: 'fileHash must be a lowercase SHA-256 hex digest' });
  }

  const block = blockchain.addBlock(hash);

  return res.status(201).json({
    message: 'File hash recorded successfully',
    block: {
      index: block.index,
      timestamp: block.timestamp,
      fileHash: block.fileHash,
      previousHash: block.previousHash,
      hash: block.hash,
      nonce: block.nonce,
    },
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

  const exists = blockchain.isHashPresent(hash);

  return res.status(200).json({
    fileHash: hash,
    exists,
    message: exists ? 'Hash found. File is verified.' : 'Hash not found. File may have been altered.',
  });
});

router.get('/getBlockchain', (req, res) => {
  return res.status(200).json({
    length: blockchain.chain.length,
    valid: blockchain.isChainValid(),
    difficulty: blockchain.difficulty,
    chain: blockchain.chain,
  });
});

module.exports = router;
