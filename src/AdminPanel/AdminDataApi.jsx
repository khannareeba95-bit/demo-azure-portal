// AdminDataApi.jsx — fetches documents, logs, and pipelines for the admin panel
import { ENDPOINTS } from "../config/endpoints";
const API_BASE = ENDPOINTS.ADMIN_API;

const MOCK_DATA = {
  documents: [
    { id: "d1", name: "Invoice_Q1_2026.pdf", project: "IntelliDoc", status: "processed", uploadedAt: "2026-04-14T10:00:00Z" },
    { id: "d2", name: "Safety_Report_March.pdf", project: "IntelliDoc", status: "processing", uploadedAt: "2026-04-15T04:30:00Z" },
    { id: "d3", name: "Compliance_Cert_2026.pdf", project: "IntelliDoc", status: "failed", uploadedAt: "2026-04-13T08:00:00Z" },
  ],
  logs: [
    { id: "l1", level: "INFO", message: "Pipeline 'Ingestion' started", timestamp: "2026-04-15T04:00:00Z", project: "Data Orchestration" },
    { id: "l2", level: "WARN", message: "OCR confidence below threshold on page 3", timestamp: "2026-04-15T04:31:00Z", project: "IntelliDoc" },
    { id: "l3", level: "ERROR", message: "Failed to parse document: corrupt PDF", timestamp: "2026-04-13T08:05:00Z", project: "IntelliDoc" },
    { id: "l4", level: "INFO", message: "Knowledge graph sync completed", timestamp: "2026-04-14T22:05:00Z", project: "Data Orchestration" },
  ],
  pipelines: [
    { id: "p1", name: "Ingestion Pipeline", status: "running", lastRun: "2026-04-15T04:00:00Z", records: 12400 },
    { id: "p2", name: "Transform & Enrich", status: "completed", lastRun: "2026-04-15T03:30:00Z", records: 11980 },
    { id: "p3", name: "Knowledge Graph Sync", status: "idle", lastRun: "2026-04-14T22:00:00Z", records: 8750 },
  ],
};

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function fetchAdminDocuments() {
  try {
    const data = await apiFetch("/admin/documents");
    return data.documents || [];
  } catch {
    return MOCK_DATA.documents;
  }
}

export async function fetchAdminLogs() {
  try {
    const data = await apiFetch("/admin/logs");
    return data.logs || [];
  } catch {
    return MOCK_DATA.logs;
  }
}

export async function fetchAdminPipelines() {
  try {
    const data = await apiFetch("/admin/pipelines");
    return data.pipelines || [];
  } catch {
    return MOCK_DATA.pipelines;
  }
}
