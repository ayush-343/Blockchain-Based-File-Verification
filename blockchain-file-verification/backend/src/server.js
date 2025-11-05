const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectToDatabase, closeConnection, checkMongoStatus } = require('./db');
const { createBlockchainRouter } = require('./routes/blockchainRoutes');
const { ensureBlockIndexes, loadBlockchain, persistBlock, syncBlockchain } = require('./services/blockchainStore');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', async (req, res) => {
  const timestamp = new Date().toISOString();

  try {
    const mongoStatus = await checkMongoStatus();
    const blockchain = app.locals.blockchain;

    const response = {
      status: mongoStatus.ok ? 'ok' : 'degraded',
      timestamp,
      mongo: {
        status: mongoStatus.ok ? 'connected' : 'error',
        error: mongoStatus.ok ? null : mongoStatus.message,
      },
    };

    if (blockchain) {
      response.blockchain = {
        chainLength: blockchain.chain.length,
        difficulty: blockchain.difficulty,
      };
    }

    return res.status(mongoStatus.ok ? 200 : 503).json(response);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      timestamp,
      mongo: { status: 'error', error: error.message },
    });
  }
});
async function startServer() {
  try {
    const { db } = await connectToDatabase();
    const blocksCollection = db.collection('blocks');

    await ensureBlockIndexes(blocksCollection);

    const blockchain = await loadBlockchain(blocksCollection, { difficulty: 2 });
    const router = createBlockchainRouter({
      blockchain,
      blocksCollection,
      persistBlock: (block) => persistBlock(blocksCollection, block),
      syncChain: () => syncBlockchain(blocksCollection, blockchain),
    });

    app.locals.blockchain = blockchain;
    app.locals.blocksCollection = blocksCollection;

    app.use('/api', router);

    app.use((req, res) => {
      res.status(404).json({ message: 'Not found' });
    });

    app.listen(PORT, () => {
      console.log(`Blockchain verification API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server due to MongoDB connection issue', error);
    process.exit(1);
  }
}

startServer();

const gracefulShutdown = async () => {
  await closeConnection();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = app;
