const crypto = require('crypto');

/**
 * Simple blockchain tailored for storing file hashes with a proof-of-work constraint.
 */
class Block {
  constructor(index, timestamp, fileHash, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.fileHash = fileHash;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(`${this.index}${this.timestamp}${this.fileHash}${this.previousHash}${this.nonce}`)
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (!this.hash.startsWith(target)) {
      this.nonce += 1;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor({ difficulty = 2 } = {}) {
    this.difficulty = difficulty;
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, new Date().toISOString(), 'GENESIS', '0');
    genesisBlock.hash = genesisBlock.calculateHash();
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(fileHash) {
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      fileHash,
      this.getLatestBlock().hash
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  isHashPresent(fileHash) {
    return this.chain.some((block) => block.fileHash === fileHash);
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
}

module.exports = {
  Block,
  Blockchain,
};
