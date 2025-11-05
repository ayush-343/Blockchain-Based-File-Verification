# Podman Lifecycle Commands

## Build Images
```powershell
podman build -t file-verification-backend ./backend
podman build -t file-verification-frontend ./frontend
```

## Run Containers
```powershell
podman run -d --name file-verification-backend -p 5000:5000 file-verification-backend
podman run -d --name file-verification-frontend -p 5173:5173 file-verification-frontend
```

## Stop & Remove Containers
```powershell
podman stop file-verification-backend file-verification-frontend
podman rm file-verification-backend file-verification-frontend
```

## Tag Images for Registry
```powershell
podman tag file-verification-backend registry.example.com/your-namespace/file-verification-backend:v1
podman tag file-verification-frontend registry.example.com/your-namespace/file-verification-frontend:v1
```

## Push Images
```powershell
podman push registry.example.com/your-namespace/file-verification-backend:v1
podman push registry.example.com/your-namespace/file-verification-frontend:v1
```

## Version & Logs
```powershell
podman version
podman logs file-verification-backend
podman logs file-verification-frontend
```
