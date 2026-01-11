import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    done: { type: Boolean, default: false },

    // ✅ 類別允許自訂文字
    category: { type: String, default: "其他", trim: true, maxlength: 20 },

    // ✅ 截止日期可為 null
    dueDate: { type: Date, default: null },

    // ✅ 優先順序固定選項
    priority: { type: String, enum: ["低", "中", "高"], default: "中" },
  },
  { timestamps: true }
);

export default mongoose.model("Todo", todoSchema);
