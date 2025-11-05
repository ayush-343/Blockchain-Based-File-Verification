const crypto = require('crypto');

/**
 * Simple blockchain tailored for storing file hashes with a proof-of-work constraint.
 */
class Block {
  constructor(index, timestamp, fileHash, previousHash = '', metadata = {}, options = {}) {
    this.index = index;
    this.timestamp = timestamp instanceof Date ? timestamp.toISOString() : timestamp;
    this.fileHash = fileHash;
    this.previousHash = previousHash;
    this.nonce = Number.isFinite(options.nonce) ? options.nonce : 0;
    this.metadata = { ...metadata };
    this.hash = typeof options.hash === 'string' ? options.hash : this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        `${this.index}${this.timestamp}${this.fileHash}${this.previousHash}${this.nonce}${JSON.stringify(
          this.metadata
        )}`
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (!this.hash.startsWith(target)) {
      this.nonce += 1;
      this.hash = this.calculateHash();
    }
  }

  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      fileHash: this.fileHash,
      previousHash: this.previousHash,
      hash: this.hash,
      nonce: this.nonce,
      metadata: this.metadata,
    };
  }

  toDocument() {
    const json = this.toJSON();
    return {
      ...json,
      timestamp: new Date(this.timestamp),
    };
  }

  static fromData(data) {
    if (!data) {
      return null;
    }
    const timestamp = data.timestamp instanceof Date ? data.timestamp.toISOString() : data.timestamp;
    return new Block(
      data.index,
      timestamp,
      data.fileHash,
      data.previousHash,
      data.metadata || {},
      { nonce: data.nonce, hash: data.hash }
    );
  }
}

class Blockchain {
  constructor({ difficulty = 2, blocks = null } = {}) {
    this.difficulty = difficulty;
    if (Array.isArray(blocks) && blocks.length > 0) {
      this.chain = blocks.map((block) => (block instanceof Block ? block : Block.fromData(block)));
    } else {
      this.chain = [this.createGenesisBlock()];
    }
  }

  replaceChainFromData(blocks = []) {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return;
    }

    const hydratedBlocks = blocks
      .map((block) => (block instanceof Block ? block : Block.fromData(block)))
      .filter(Boolean)
      .sort((a, b) => a.index - b.index);

    if (hydratedBlocks.length === 0) {
      return;
    }

    this.chain = hydratedBlocks;
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, new Date().toISOString(), 'GENESIS', '0', {
      label: 'Genesis block',
    });
    genesisBlock.hash = genesisBlock.calculateHash();
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(fileHash, metadata = {}) {
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      fileHash,
      this.getLatestBlock().hash,
      metadata
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  isHashPresent(fileHash) {
    return Boolean(this.findBlockByHash(fileHash));
  }

  findBlockByHash(fileHash) {
    return this.chain.find((block) => block.fileHash === fileHash);
  }

  getBlockByIndex(index) {
    return this.chain.find((block) => block.index === index);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i += 1) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) {
        return false;
      }

      if (current.previousHash !== previous.hash) {
        return false;
      }
    }
    return true;
  }

  getStats() {
    const recordedBlocks = this.chain.filter((block) => block.index !== 0);
    const uniqueHashes = new Set(recordedBlocks.map((block) => block.fileHash));
    const latestBlock = this.getLatestBlock();
    const genesisBlock = this.chain[0];

    const chainAgeSeconds = Math.max(
      0,
      (new Date(latestBlock.timestamp).getTime() - new Date(genesisBlock.timestamp).getTime()) /
        1000
    );

    const averageNonce =
      recordedBlocks.length === 0
        ? 0
        : Math.round(
            recordedBlocks.reduce((acc, block) => acc + block.nonce, 0) / recordedBlocks.length
          );

    return {
      totalBlocks: this.chain.length,
      recordedHashes: recordedBlocks.length,
      totalUniqueHashes: uniqueHashes.size,
      difficulty: this.difficulty,
      lastMinedAt: latestBlock.timestamp,
      genesisTimestamp: genesisBlock.timestamp,
      chainAgeSeconds,
      averageNonce,
    };
  }
}

module.exports = {
  Block,
  Blockchain,
};
