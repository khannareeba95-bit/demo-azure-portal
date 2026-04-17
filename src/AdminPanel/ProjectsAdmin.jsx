import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_AZURE_API_URL;

const EMPTY = { id: "", name: "", description: "", route: "", videoUrl: "" };

async function apiRequest(path, method = "GET", body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return method === "DELETE" ? null : res.json();
}

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null); // id of project being edited
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiRequest("/projects")
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (p) => { setEditing(p.id); setForm(p); setError(""); };
  const handleCancel = () => { setEditing(null); setForm(EMPTY); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id || !form.name) return setError("ID and Name are required.");
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await apiRequest(`/projects/${form.id}`, "PUT", form);
      } else {
        await apiRequest("/projects", "POST", form);
      }
      handleCancel();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await apiRequest(`/projects/${id}`, "DELETE");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!API_BASE) {
    return (
      <div className="p-6 text-center text-red-500 text-sm">
        <code>VITE_AZURE_API_URL</code> is not set. Add it to your <code>.env</code> file.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-1">Projects Admin</h1>
      <p className="text-sm text-gray-500 mb-6">Manage projects stored in Azure Table Storage</p>

      {/* Form */}
      <div className="box p-5 mb-8 rounded-lg shadow-sm">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          {editing ? "Edit Project" : "Add New Project"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "id", label: "ID (RowKey)", placeholder: "e.g. intellidoc", disabled: !!editing },
            { key: "name", label: "Name", placeholder: "e.g. IntelliDoc" },
            { key: "route", label: "Route", placeholder: "e.g. /intellidoc" },
            { key: "videoUrl", label: "YouTube URL", placeholder: "https://youtu.be/..." },
          ].map(({ key, label, placeholder, disabled }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                disabled={disabled}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short project description"
            />
          </div>
          {error && <p className="md:col-span-2 text-xs text-red-500">{error}</p>}
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Update" : "Add Project"}
            </button>
            {editing && (
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Route</th>
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No projects found.</td></tr>
              )}
              {projects.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-mono text-xs text-gray-500">{p.id}</td>
                  <td className="py-2 pr-4 font-medium text-gray-700">{p.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{p.route}</td>
                  <td className="py-2 pr-4 text-gray-400 text-xs max-w-xs truncate">{p.description}</td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-xs px-3 py-1 border rounded hover:bg-gray-100">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs px-3 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
