'use strict';

const { Blockchain } = require('../blockchain');

async function ensureBlockIndexes(blocksCollection) {
  await Promise.all([
    blocksCollection.createIndex({ index: 1 }, { unique: true }),
    blocksCollection.createIndex({ hash: 1 }, { unique: true }),
  ]);
}

async function upsertGenesisBlock(blocksCollection, genesisBlock) {
  await blocksCollection.updateOne(
    { index: genesisBlock.index },
    {
      $setOnInsert: genesisBlock.toDocument(),
    },
    { upsert: true }
  );
}

async function fetchAllBlocks(blocksCollection) {
  const cursor = blocksCollection.find({}, { sort: { index: 1 } });
  return cursor.toArray();
}

async function loadBlockchain(blocksCollection, { difficulty = 2 } = {}) {
  const existingBlocks = await fetchAllBlocks(blocksCollection);
  let blockchain;

  if (existingBlocks.length > 0) {
    blockchain = new Blockchain({ difficulty, blocks: existingBlocks });
  } else {
    blockchain = new Blockchain({ difficulty });
    await upsertGenesisBlock(blocksCollection, blockchain.getLatestBlock());
  }

  return blockchain;
}

async function syncBlockchain(blocksCollection, blockchain) {
  const blocks = await fetchAllBlocks(blocksCollection);
  if (blocks.length > 0) {
    blockchain.replaceChainFromData(blocks);
  }
  return blockchain;
}

async function persistBlock(blocksCollection, block) {
  await blocksCollection.insertOne(block.toDocument());
}

module.exports = {
  ensureBlockIndexes,
  loadBlockchain,
  persistBlock,
  syncBlockchain,
};
