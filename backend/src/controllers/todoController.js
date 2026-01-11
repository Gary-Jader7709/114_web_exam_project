import mongoose from "mongoose";
import Todo from "../models/todo.js";
import { ok, fail } from "../utils/apiResponse.js";

const ALLOWED_PRIORITIES = ["低", "中", "高"];

function parseDueDate(dueDate) {
  if (dueDate === null || dueDate === undefined || dueDate === "") return null;
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return "__INVALID__";
  return d;
}

function normalizeCategory(category) {
  const c = (category ?? "").toString().trim();
  return c ? c : "其他";
}

export async function createTodo(req, res, next) {
  try {
    const { title, note, category, dueDate, priority } = req.body;

    if (!title || !title.trim()) return fail(res, "title is required", 400);

    if (priority !== undefined && !ALLOWED_PRIORITIES.includes(priority)) {
      return fail(res, `Invalid priority. Use: ${ALLOWED_PRIORITIES.join(", ")}`, 400);
    }

    const parsedDue = parseDueDate(dueDate);
    if (parsedDue === "__INVALID__") return fail(res, "Invalid dueDate format", 400);

    const todo = await Todo.create({
      title: title.trim(),
      note: (note || "").trim(),
      done: false,
      category: normalizeCategory(category),
      dueDate: parsedDue,
      priority: priority || "中",
    });

    return ok(res, todo, "Created", 201);
  } catch (err) {
    return next(err);
  }
}

export async function getTodos(req, res, next) {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    return ok(res, todos, "OK");
  } catch (err) {
    return next(err);
  }
}

export async function getTodoById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return fail(res, "Invalid ID format", 400, { type: "CastError" });
    }

    const todo = await Todo.findById(id);
    if (!todo) return fail(res, "Todo not found", 404);

    return ok(res, todo, "OK");
  } catch (err) {
    return next(err);
  }
}

export async function updateTodo(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return fail(res, "Invalid ID format", 400, { type: "CastError" });
    }

    const { title, note, done, category, dueDate, priority } = req.body;

    if (priority !== undefined && !ALLOWED_PRIORITIES.includes(priority)) {
      return fail(res, `Invalid priority. Use: ${ALLOWED_PRIORITIES.join(", ")}`, 400);
    }

    const updates = {};

    if (title !== undefined) {
      if (!title || !title.trim()) return fail(res, "title is required", 400);
      updates.title = title.trim();
    }
    if (note !== undefined) updates.note = (note || "").trim();
    if (done !== undefined) updates.done = !!done;

    if (category !== undefined) updates.category = normalizeCategory(category);
    if (priority !== undefined) updates.priority = priority;

    if (dueDate !== undefined) {
      const parsedDue = parseDueDate(dueDate);
      if (parsedDue === "__INVALID__") return fail(res, "Invalid dueDate format", 400);
      updates.dueDate = parsedDue;
    }

    const todo = await Todo.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!todo) return fail(res, "Todo not found", 404);

    return ok(res, todo, "Updated");
  } catch (err) {
    return next(err);
  }
}

export async function deleteTodo(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return fail(res, "Invalid ID format", 400, { type: "CastError" });
    }

    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) return fail(res, "Todo not found", 404);

    return ok(res, todo, "Deleted");
  } catch (err) {
    return next(err);
  }
}
