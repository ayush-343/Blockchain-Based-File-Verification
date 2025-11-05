# Blockchain File Verification Framework

A local, educational framework that demonstrates how blockchain concepts can secure file integrity. Users hash a file in the browser, persist the hash on a simple proof-of-work blockchain, and later verify whether the file has been altered.

## Features
- React + Vite (JavaScript + JSX) frontend with TailwindCSS styling
- Node.js + Express backend with an in-memory blockchain
- Proof-of-work mining (difficulty 2) on each new block
- REST API covering hash storage, verification, and full chain inspection
- Podman-ready Containerfiles for both frontend and backend services

## Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- Podman (optional, for container workflows)

## Project Structure
```
blockchain-file-verification/
├── backend/
│   ├── Containerfile
│   ├── package.json
│   └── src/
│       ├── blockchain.js
│       ├── routes/
│       │   └── blockchainRoutes.js
│       └── server.js
├── frontend/
│   ├── Containerfile
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── BlockchainViewer.jsx
│   │   │   └── FileUploader.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── utils/hash.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── podman-commands.md
└── README.md
```

## Local Development (Node + npm)

### Backend
```powershell
cd backend
npm install
npm run dev
```
The backend listens on `http://localhost:5000`.

### Frontend
```powershell
cd frontend
npm install
npm run dev
```
The frontend listens on `http://localhost:5173` and proxies `/api/*` requests to the backend.

## Container Workflow (Podman)
1. Build containers:
   ```powershell
   podman build -t file-verification-backend ./backend
   podman build -t file-verification-frontend ./frontend
   ```
2. Run containers:
   ```powershell
   podman run -d -p 5000:5000 file-verification-backend
   podman run -d -p 5173:5173 file-verification-frontend
   ```

Additional lifecycle commands live in [`podman-commands.md`](./podman-commands.md).

## REST API Reference

### `POST /api/addFileHash`
Adds a block containing the provided SHA-256 hash.
```json
{
  "fileHash": "9f2c94c1ee13d1d8fd17cfca9ce4d5fa1865d2ca6c6f74b09f5c5c1a58ed4c0a"
}
```
**Response**
```json
{
  "message": "File hash recorded successfully",
  "block": {
    "index": 1,
    "timestamp": "2025-11-05T12:00:00.000Z",
    "fileHash": "9f2c94c1ee13d1d8fd17cfca9ce4d5fa1865d2ca6c6f74b09f5c5c1a58ed4c0a",
    "previousHash": "0037c62f...",
    "hash": "00b9a8b9...",
    "nonce": 8421
  },
  "chainLength": 2
}
```

### `POST /api/verifyFileHash`
Checks whether the hash exists on the blockchain.
```json
{
  "fileHash": "9f2c94c1ee13d1d8fd17cfca9ce4d5fa1865d2ca6c6f74b09f5c5c1a58ed4c0a"
}
```
**Response**
```json
{
  "fileHash": "9f2c94c1ee13d1d8fd17cfca9ce4d5fa1865d2ca6c6f74b09f5c5c1a58ed4c0a",
  "exists": true,
  "message": "Hash found. File is verified."
}
```

### `GET /api/getBlockchain`
Returns the in-memory blockchain.
```json
{
  "length": 2,
  "valid": true,
  "difficulty": 2,
  "chain": [
    {
      "index": 0,
      "timestamp": "2025-11-05T11:59:58.000Z",
      "fileHash": "GENESIS",
      "previousHash": "0",
      "hash": "f1d2f4...",
      "nonce": 0
    },
    {
      "index": 1,
      "timestamp": "2025-11-05T12:00:00.000Z",
      "fileHash": "9f2c94c1ee13d1d8fd17cfca9ce4d5fa1865d2ca6c6f74b09f5c5c1a58ed4c0a",
      "previousHash": "f1d2f4...",
      "hash": "00b9a8b9...",
      "nonce": 8421
    }
  ]
}
```

## Verification Workflow
1. **Upload** a file in the frontend. Its SHA-256 hash is generated locally.
2. **Store** the hash with "Add Hash to Blockchain". The backend mines a new block.
3. **Verify** by re-uploading the same file later and using "Verify Hash".
4. **Inspect** the blockchain ledger to learn how blocks link through hashes.

## Testing Checklist
- [ ] Backend `npm run dev` responds to `/api/health`
- [ ] `POST /api/addFileHash` mines block with hash starting with `00`
- [ ] Frontend `npm run dev` allows upload, storage, and verification
- [ ] Blockchain table shows new block after adding hash
- [ ] Containers build and run via Podman commands

## Notes
- The blockchain is kept in memory. Restarting the backend resets the chain.
- Proof-of-work difficulty is intentionally low to keep responses fast.
- TailwindCSS styles compile during build (`npm run build`).
