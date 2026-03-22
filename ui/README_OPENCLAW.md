# India-innovators UI integrated into ontology

This UI is imported from:
https://github.com/sayan-stack/India-innovators

with minimal changes to make it functional with your local ontology backend.

## What was wired
- Graph page -> `GET http://localhost:8000/api/graph`
- Risk cards/trends/alerts -> `GET http://localhost:8000/api/risk` and `/api/feed`
- Feed Monitor page -> `GET http://localhost:8000/api/feed`

## Run backend
```powershell
cd "C:\Users\DEBANJAN MONDAL\.openclaw\workspace\ontology"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Run frontend (full UI)
```powershell
cd "C:\Users\DEBANJAN MONDAL\.openclaw\workspace\ontology\ui"
npm install
npm run dev
```

Open:
- Frontend UI: http://localhost:5173
- Backend API: http://localhost:8000

Optional API base override:
```powershell
$env:VITE_API_BASE="http://localhost:8000"
npm run dev
```
