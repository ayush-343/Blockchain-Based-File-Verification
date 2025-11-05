'use strict';

const crypto = require('crypto');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function run() {
  const randomHash = crypto.createHash('sha256').update(`${Date.now()}-${Math.random()}`).digest('hex');

  console.log('Generated test hash:', randomHash);

  try {
    const storeResponse = await axios.post(`${API_BASE_URL}/addFileHash`, {
      fileHash: randomHash,
      fileName: 'mongo-connection-check.bin',
      notes: 'Automated connectivity test block',
    });

    const { block } = storeResponse.data;
    console.log('Stored block index:', block.index);

    const verifyResponse = await axios.post(`${API_BASE_URL}/verifyFileHash`, {
      fileHash: randomHash,
    });

    console.log('Verification status:', verifyResponse.data.exists);

    const blockResponse = await axios.get(`${API_BASE_URL}/getBlock/${block.index}`);
    console.log('Retrieved block metadata:', blockResponse.data.block.metadata);
  } catch (error) {
    if (error.response) {
      console.error('API request failed with status', error.response.status, error.response.data);
    } else {
      console.error('API request failed:', error.message);
    }
    process.exitCode = 1;
  }
}

run();
