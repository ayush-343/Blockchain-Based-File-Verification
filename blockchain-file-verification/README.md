# Blockchain File Verification Framework

A local, educational framework that demonstrates how blockchain concepts can secure file integrity. Users hash a file in the browser, persist the hash on a simple proof-of-work blockchain, and later verify whether the file has been altered.

## Features
- React + Vite (JavaScript + JSX) frontend with TailwindCSS styling, richer dashboards, and verification history
- Node.js + Express backend with MongoDB persistence, file metadata capture, and chain analytics
- Proof-of-work mining (difficulty 2) on each new block with nonce statistics
- REST API covering hash storage, lookup, metrics, and full ledger inspection
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
│   │   │   ├── BlockDetailCard.jsx
│   │   │   ├── BlockchainViewer.jsx
│   │   │   ├── FileUploader.jsx
│   │   │   ├── StatsBoard.jsx
│   │   │   └── VerificationHistory.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── utils/
│   │       ├── format.js
│   │       └── hash.js
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

## GitHub Pages Deployment

This repository ships with a GitHub Actions workflow that builds the frontend and publishes it to GitHub Pages.

1. Ensure the repo already has the `frontend` build artifacts committed (run `npm run build` locally to confirm).
2. Push or merge to `main`. The `Deploy Frontend to GitHub Pages` workflow runs automatically and uploads `frontend/dist`.
3. In GitHub → **Settings → Pages**, set **Source** to **GitHub Actions** the first time you enable Pages. The workflow output includes the live URL (e.g. `https://ayush-343.github.io/Blockchain-Based-File-Verification/`).
4. Subsequent pushes to `main` rebuild and redeploy automatically. You can also trigger it manually via **Actions → Deploy Frontend to GitHub Pages → Run workflow**.

> The workflow sets `VITE_BASE_PATH=/Blockchain-Based-File-Verification/` so paths resolve correctly when hosted at `/repo/`.

## REST API Reference

### `POST /api/addFileHash`
Adds a block containing the provided SHA-256 hash and optional metadata.
```json
{
  "fileHash": "9f2c94c1ee13d1d8fd17cfca9ce4d5fa1865d2ca6c6f74b09f5c5c1a58ed4c0a",
  "fileName": "project-report.pdf",
  "fileSize": 42812,
  "notes": "Release 1.2 submission"
}
```
**Response**
```json
{
  "message": "File hash recorded successfully",
  "block": {
    "index": 4,
    "timestamp": "2025-11-05T12:00:00.000Z",
    "fileHash": "9f2c94c1ee13d1d8fd17cfca9ce4d5fa1865d2ca6c6f74b09f5c5c1a58ed4c0a",
    "previousHash": "005c1a0...",
    "hash": "00931bb...",
    "nonce": 1332,
    "metadata": {
      "fileName": "project-report.pdf",
      "fileSize": 42812,
      "notes": "Release 1.2 submission"
    }
  },
  "chainLength": 5
}
```

### `POST /api/verifyFileHash`
Checks whether the hash exists on the blockchain and returns block context when found.
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
  "message": "Hash found. File is verified.",
  "block": {
    "index": 4,
    "timestamp": "2025-11-05T12:00:00.000Z",
    "fileHash": "9f2c94c1ee13d1d8fd17cfca9ce4d5fa1865d2ca6c6f74b09f5c5c1a58ed4c0a",
    "previousHash": "005c1a0...",
    "hash": "00931bb...",
    "nonce": 1332,
    "metadata": {
      "fileName": "project-report.pdf",
      "fileSize": 42812,
      "notes": "Release 1.2 submission"
    }
  }
}
```

### `GET /api/getBlockchain`
Returns the full in-memory blockchain, including metadata per block.
```json
{
  "length": 5,
  "valid": true,
  "difficulty": 2,
  "chain": [
    {
      "index": 0,
      "timestamp": "2025-11-05T11:59:58.000Z",
      "fileHash": "GENESIS",
      "previousHash": "0",
      "hash": "f1d2f4...",
      "nonce": 0,
      "metadata": {
        "label": "Genesis block"
      }
    },
    "...additional blocks..."
  ]
}
```

### `GET /api/getBlock/:index`
Retrieve a single block by its index, useful for deep dives or demo scripts.

### `GET /api/findByHash/:hash`
Look up a block directly by its SHA-256 file hash.

### `GET /api/metrics`
Returns chain analytics (block counts, unique hashes, average nonce, last mined block) used by the frontend dashboard.

## Verification Workflow
1. **Upload** a file (or paste a hash manually). The browser computes SHA-256 locally and surfaces file metadata.
2. **Annotate & store** with optional notes before mining a block via "Add Hash to Blockchain".
3. **Verify** later by recomputing or pasting the hash, reviewing returned block metadata for full context.
4. **Inspect** dashboards for ledger health, block stats, and recent activity. Use the ledger table or lookup endpoints for deeper analysis.

## Testing Checklist
- [ ] Backend `npm run dev` responds to `/api/health`
- [ ] `POST /api/addFileHash` mines block with hash starting with `00` and returns metadata
- [ ] `GET /api/metrics` reports valid chain stats
- [ ] Frontend `npm run dev` allows upload, storage, verification, and shows history entries
- [ ] Blockchain table reflects metadata and refresh button works
- [ ] Containers build and run via Podman commands

## Notes
- Hashes persist in MongoDB (`fileVerification.blocks`). Provide a valid Atlas connection string in `backend/.env` before starting the backend.
- Proof-of-work difficulty is intentionally low to keep responses fast.
- TailwindCSS styles compile during build (`npm run build`).
