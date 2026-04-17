import { useEffect, useState } from "react";
import { fetchAdminDocuments, fetchAdminLogs, fetchAdminPipelines } from "./AdminDataApi";

const STATUS_STYLES = {
  // documents
  processed: "bg-green-100 text-green-700",
  processing: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  // pipelines
  running: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  idle: "bg-gray-100 text-gray-500",
  // logs
  INFO: "bg-blue-50 text-blue-600",
  WARN: "bg-yellow-50 text-yellow-700",
  ERROR: "bg-red-50 text-red-600",
};

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-gray-700 mb-3 border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Badge({ value }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[value] || "bg-gray-100 text-gray-500"}`}>
      {value}
    </span>
  );
}

export default function AdminDataView() {
  const [docs, setDocs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminDocuments(), fetchAdminLogs(), fetchAdminPipelines()])
      .then(([d, l, p]) => { setDocs(d); setLogs(l); setPipelines(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading data…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Admin Data Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Documents, logs, and pipelines across all projects</p>
      </div>

      <Section title="Documents">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Project</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium text-gray-700">{d.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{d.project}</td>
                  <td className="py-2 pr-4"><Badge value={d.status} /></td>
                  <td className="py-2 text-gray-400 text-xs">{new Date(d.uploadedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Pipelines">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pipelines.map((p) => (
            <div key={p.id} className="box p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-700">{p.name}</span>
                <Badge value={p.status} />
              </div>
              <p className="text-2xl font-bold text-primary">{p.records?.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Last run: {new Date(p.lastRun).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Logs">
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-3 text-xs p-2 rounded-md bg-gray-50 border">
              <Badge value={l.level} />
              <div className="flex-1">
                <span className="text-gray-700">{l.message}</span>
                <span className="text-gray-400 ml-2">— {l.project}</span>
              </div>
              <span className="text-gray-400 whitespace-nowrap">{new Date(l.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
