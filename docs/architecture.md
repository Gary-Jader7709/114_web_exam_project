# 系統架構圖

```mermaid
flowchart LR
  U[User Browser] --> FE[Frontend (React/Vite) :5173]
  FE -->|HTTP Fetch| BE[Backend (Express API) :5000]
  BE --> DB[(MongoDB :27017)]
