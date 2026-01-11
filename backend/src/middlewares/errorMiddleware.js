import { fail } from "../utils/apiResponse.js";

export function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    return fail(res, "Invalid ID format", 400, { type: "CastError" });
  }

  return fail(
    res,
    err.message || "Internal Server Error",
    err.statusCode || 500,
    { type: err.name || "Error" }
  );
}
