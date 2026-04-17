// DashboardApi.jsx — Azure-ready version
// ─────────────────────────────────────────────────────────────────────────────
// Replace the Azure API base URL below once you have provisioned your Azure
// backend (e.g. Azure Functions or Azure API Management).
//
// The PROJECTS array in src/views/Dashboard.jsx is now the primary data source,
// so these functions are provided as stubs for future Azure integration.
// ─────────────────────────────────────────────────────────────────────────────

// TODO: Replace with your Azure API Management or Azure Functions URL
const AZURE_API_BASE_URL = import.meta.env.VITE_AZURE_API_URL || "";

/**
 * Fetch projects from an Azure backend.
 * Currently returns an empty array — projects are defined statically in Dashboard.jsx.
 * Uncomment and configure the fetch block once your Azure API is ready.
 */
export const fetchDashboardProjects = async () => {
  if (!AZURE_API_BASE_URL) {
    // No API configured — use static data in Dashboard.jsx
    return [];
  }

  try {
    const response = await fetch(`${AZURE_API_BASE_URL}/projects`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const result = await response.json();
      return Array.isArray(result) ? result : result.projects || [];
    }

    console.warn("Azure API responded with:", response.status);
    return [];
  } catch (error) {
    console.error("Error fetching projects from Azure API:", error);
    return [];
  }
};

/**
 * Fetch industry list from Azure backend.
 * Returns the three fixed industries used by the sidebar.
 */
export const fetchAllIndustries = async () => {
  return ["All", "BFSI/FSI/FinTech", "Manufacturing & Energy"];
};
