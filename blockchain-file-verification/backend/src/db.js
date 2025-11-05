'use strict';

const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

let cachedClient = null;
let cachedDb = null;

const getMongoConfig = () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'fileVerification';

  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Add it to backend/.env before starting the server.');
  }

  return { uri, dbName };
};

async function connectToDatabase() {
  if (cachedDb && cachedClient) {
    return { client: cachedClient, db: cachedDb };
  }

  const { uri, dbName } = getMongoConfig();
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  await client.connect();

  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

function getDb() {
  if (!cachedDb) {
    throw new Error('Database connection not initialised. Call connectToDatabase() first.');
  }
  return cachedDb;
}

async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

async function checkMongoStatus() {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  closeConnection,
  checkMongoStatus,
};
