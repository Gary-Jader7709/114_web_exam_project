const BASE = "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = body?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

export const api = {
  listTodos: () => request("/api/todos"),
  createTodo: (payload) =>
    request("/api/todos", { method: "POST", body: JSON.stringify(payload) }),
  updateTodo: (id, payload) =>
    request(`/api/todos/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTodo: (id) => request(`/api/todos/${id}`, { method: "DELETE" }),
};
