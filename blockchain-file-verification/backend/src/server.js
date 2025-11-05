const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const blockchainRoutes = require('./routes/blockchainRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', blockchainRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  // Basic log for container visibility.
  console.log(`Blockchain verification API running on port ${PORT}`);
});

module.exports = app;
