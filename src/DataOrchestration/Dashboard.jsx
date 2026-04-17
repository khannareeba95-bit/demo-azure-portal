import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_DATA_ORCH_API_URL || "";

export default function DataOrchestrationDashboard() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!API_BASE) {
      // Fallback mock data until API is wired up
      setPipelines([
        { id: "p1", name: "Ingestion Pipeline", status: "running", lastRun: "2026-04-15T04:00:00Z", records: 12400 },
        { id: "p2", name: "Transform & Enrich", status: "completed", lastRun: "2026-04-15T03:30:00Z", records: 11980 },
        { id: "p3", name: "Knowledge Graph Sync", status: "idle", lastRun: "2026-04-14T22:00:00Z", records: 8750 },
      ]);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/pipelines`)
      .then((r) => r.json())
      .then((data) => setPipelines(data.pipelines || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = {
    running: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    idle: "bg-gray-100 text-gray-500",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Data Orchestration</h1>
        <p className="text-sm text-gray-500 mt-1">Enterprise knowledge management — pipeline overview</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-gray-400">Loading pipelines…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {pipelines.map((p) => (
            <div key={p.id} className="box p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-800">{p.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status] || statusColor.idle}`}>
                  {p.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">
                Last run: {new Date(p.lastRun).toLocaleString()}
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                {p.records?.toLocaleString()}
                <span className="text-xs font-normal text-gray-400 ml-1">records</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="box p-5 rounded-lg">
        <h2 className="font-semibold text-sm text-gray-700 mb-3">External Dashboard</h2>
        <p className="text-xs text-gray-500 mb-4">
          Full Data Orchestration experience is hosted at{" "}
          <a
            href="https://datasymphonys.movetoaws.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            datasymphonys.movetoaws.com
          </a>
        </p>
        <a
          href="https://datasymphonys.movetoaws.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-primary text-white text-xs px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Open Full Dashboard ↗
        </a>
      </div>
    </div>
  );
}
