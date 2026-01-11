# 114_web_exam_project - Todo CRUD（前後端 + MongoDB）

此專案為「網路程式設計」期末作業：自訂主題的前後端整合 Web App，具備完整 CRUD，並使用 MongoDB 儲存資料。

## 專案功能
- Todo CRUD
  - Create：新增待辦（含 類別 / 截止日 / 優先順序）
  - Read：列表顯示、狀態篩選（全部/未完成/已完成）
  - Update：切換完成狀態、更新資料
  - Delete：刪除單筆、清除全部 / 清除已完成
- 行事曆整合
  - 可切換月/週/日
  - 點選某一天可快速新增該日待辦（自動帶入截止日）
- 自訂配色（UI 主色、字色、完成/刪除色等）

## 技術選型
- Frontend：React + Vite
- Backend：Node.js + Express（RESTful API）
- Database：MongoDB（Docker）
- ODM：Mongoose

## 專案結構
114_web_exam_project/
backend/
frontend/
docs/
api-spec.md
architecture.md
flowchart.md
architecture.png
flowchart.png
README.md
.gitignore