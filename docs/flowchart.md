# CRUD 流程圖

```mermaid
sequenceDiagram
  participant User
  participant FE as Frontend (React)
  participant BE as Backend (Express)
  participant DB as MongoDB

  User->>FE: 操作 UI（新增/查詢/更新/刪除）
  FE->>BE: 發送 HTTP Request /api/todos...
  BE->>DB: Mongoose Query (CRUD)
  DB-->>BE: 回傳結果
  BE-->>FE: JSON (success/message/data)
  FE-->>User: 更新畫面 / 顯示提示 / 更新清單