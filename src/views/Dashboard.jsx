import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../Context/SearchContext.jsx";
import Lucide from "../base-components/lucide/index";
import CategorySidebar from "../components/sidebar/CategorySideBar";

// ─────────────────────────────────────────────────────────────────────────────
// FIXED INDUSTRIES — only these three appear in the left sidebar
// ─────────────────────────────────────────────────────────────────────────────
export const FIXED_INDUSTRIES = [
  { id: "all", name: "All" },
  { id: "bfsi-fsi-fintech", name: "BFSI/FSI/FinTech" },
  { id: "manufacturing-energy", name: "Manufacturing & Energy" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT STORE
// Add your projects here. Each project follows this schema:
//
// {
//   id: "unique-id",                         REQUIRED
//   title: "Project Title",                  REQUIRED
//   industryId: "bfsi-fsi-fintech",          REQUIRED — must match FIXED_INDUSTRIES id
//   status: "completed",                     REQUIRED — "completed" | "inprogress"
//   path: "/your-route",                     REQUIRED — route for Try it for Free
//
//   gifUrl: "https://...",                   Card thumbnail / demo GIF
//   youtubeUrl: "https://youtu.be/xxxxx",    YouTube video on detail page
//   techStack: ["OCR", "NLP", "Azure AI"],   Tech tags on detail page
//
//   marketingHeadline: "...",                Bold subtitle on card
//   demoOverview: "...",                     Demo Overview paragraph on detail page
//   problemStatement: "...",                 Problem Statement on detail page
//   solution: "...",                         Solution section on detail page
//   description: "...",                      Short text on card (also fallback)
//
//   images: ["https://..."],                 Optional screenshot carousel
// }
// ─────────────────────────────────────────────────────────────────────────────
export const PROJECTS = [
  // Paste your project objects here. Example (uncomment to use):
  //
  // {
  //   id: "intellidoc",
  //   title: "IntelliDoc",
  //   industryId: "manufacturing-energy",
  //   status: "completed",
  //   path: "/intellidoc",
  //   gifUrl: "https://your-azure-blob.blob.core.windows.net/gifs/intellidoc.gif",
  //   youtubeUrl: "https://youtu.be/YOUR_VIDEO_ID",
  //   techStack: ["OCR", "NLP", "AI Workflow Automation"],
  //   marketingHeadline: "Keep Production Flowing — No Paper Jams",
  //   demoOverview: "Optimizes document-heavy supply chain workflows, reducing errors and improving production continuity.",
  //   problemStatement: "Manual handling of invoices, compliance certificates, and safety reports leads to errors, delayed audits, and supply chain inefficiencies.",
  //   solution: "IntelliDoc processes procurement, quality, and compliance documents automatically, ensuring accurate data capture and quick approvals.",
  //   description: "AI Workflow automation extracts invoices, QC forms, and safety logs across supply chains.",
  //   images: [],
  // },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { searchTerm = "" } = useSearch();

  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategories((prev) => {
      if (categoryId === "all") return ["all"];
      const withoutAll = prev.filter((id) => id !== "all");
      if (withoutAll.includes(categoryId)) {
        const filtered = withoutAll.filter((id) => id !== categoryId);
        return filtered.length === 0 ? ["all"] : filtered;
      }
      return [...withoutAll, categoryId];
    });
  }, []);

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((project) => {
      const categoryMatch =
        selectedCategories.includes("all") ||
        selectedCategories.includes(project.industryId);

      if (!searchTerm) return categoryMatch;

      const normalized = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, "");
      const check = (text = "") =>
        text.toLowerCase().replace(/[^a-z0-9]/g, "").includes(normalized);

      const searchMatch =
        check(project.title) ||
        check(project.description) ||
        check(project.marketingHeadline) ||
        check(project.demoOverview) ||
        (project.techStack || []).some(check);

      return categoryMatch && searchMatch;
    });
  }, [selectedCategories, searchTerm]);

  const renderProjectCard = (project) => {
    const isCompleted = project.status?.toLowerCase() === "completed";

    const handleKnowMore = (e) => {
      e.stopPropagation();
      if (!isCompleted) return;
      navigate(`/project-details/${encodeURIComponent(project.title)}`, {
        state: { projectDetail: project.title },
      });
    };

    return (
      <div
        key={project.id}
        className="intro-y col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4"
      >
        <div className="box h-full min-h-[200px] cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out flex flex-col group">
          <div className="p-5 flex flex-col h-full">
            <div className="h-40 overflow-hidden rounded-md 2xl:h-56 image-fit relative">
              {project.gifUrl ? (
                <img
                  alt={project.title}
                  className="rounded-md object-cover w-full h-full"
                  src={project.gifUrl}
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-md">
                  <Lucide icon="Image" className="w-10 h-10 text-gray-300" />
                </div>
              )}
              {!isCompleted && (
                <div className="absolute inset-0 bg-[#2C4685] bg-opacity-80 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">Coming Soon</span>
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <h2 className="text-base font-bold text-primary text-center mb-3">
                {project.title}
              </h2>
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-400 leading-snug line-clamp-2 min-h-[2.5rem] text-center mb-3">
                {project.marketingHeadline || "Innovative Solution"}
              </h3>

              {project.description && (
                <>
                  <div className="border-t border-dotted border-gray-300 mb-3" />
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 text-center px-2 mb-4 flex-grow">
                    {project.description.length > 80
                      ? `${project.description.substring(0, 80)}...`
                      : project.description}
                  </p>
                </>
              )}

              <div className="text-center mt-auto pb-2">
                <button
                  className={`relative px-4 py-2 rounded-md text-xs shadow-lg transition-all duration-300 ease-out transform overflow-hidden ${
                    isCompleted
                      ? "bg-primary text-white hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
                      : "bg-gray-500 text-white cursor-not-allowed"
                  }`}
                  onClick={handleKnowMore}
                  disabled={!isCompleted}
                >
                  <span className="relative z-10">
                    {isCompleted ? "KNOW MORE" : "COMING SOON"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddProjectPlaceholder = () => (
    <div className="intro-y col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4">
      <div className="box h-full min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-blue-200 bg-blue-50 dark:bg-darkmode-800 dark:border-darkmode-400 rounded-lg p-6 cursor-default">
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-darkmode-700 flex items-center justify-center mb-4">
          <Lucide icon="Plus" className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-primary mb-1">Add a Project</h3>
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Open{" "}
          <code className="bg-gray-100 px-1 rounded text-gray-700 text-[11px]">
            src/views/Dashboard.jsx
          </code>
          <br />
          and add objects to the{" "}
          <code className="bg-gray-100 px-1 rounded text-gray-700 text-[11px]">
            PROJECTS
          </code>{" "}
          array.
        </p>
        <div className="mt-4 bg-white dark:bg-darkmode-600 border border-blue-200 dark:border-darkmode-400 rounded-md p-3 text-left w-full max-w-xs">
          <p className="text-[10px] font-mono text-gray-600 leading-5">
            id, title, industryId,<br />
            status, youtubeUrl,<br />
            techStack, demoOverview,<br />
            problemStatement, solution
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen relative">
      {!sidebarOpen && (
        <button
          className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-white bg-opacity-30 hover:bg-opacity-100 rounded-md shadow-lg border transition-all duration-300"
          onClick={() => setSidebarOpen(true)}
        >
          <Lucide icon="Menu" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity duration-300" />
        </button>
      )}

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "fixed top-4 left-0 bottom-16 translate-x-0" : "hidden lg:block"
        } lg:relative lg:translate-x-0 lg:top-0 lg:left-0 lg:bottom-0 transition-transform duration-300 ease-in-out z-50 w-56 lg:w-64 lg:h-full`}
      >
        <CategorySidebar
          categories={FIXED_INDUSTRIES}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div
        className={`w-full lg:flex-1 overflow-y-auto scroll-smooth pr-2 lg:pl-9 transition-all duration-300 ${
          sidebarOpen ? "lg:blur-none blur-sm brightness-90" : ""
        }`}
        style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 #f1f5f9" }}
      >
        <div className="grid grid-cols-12 gap-4 sm:gap-6 md:gap-8 lg:gap-9 my-5 mx-4 sm:mx-6 md:mx-8 lg:mx-3 pt-4 lg:pt-0">
          {filteredProjects.map((project) => renderProjectCard(project))}
          <AddProjectPlaceholder />

          {filteredProjects.length === 0 && !searchTerm && (
            <div className="col-span-12 text-center py-10">
              <p className="text-sm text-gray-400">
                No projects yet for this industry. Add projects to the{" "}
                <code className="bg-gray-100 px-1 rounded text-gray-600 text-xs">PROJECTS</code>{" "}
                array in Dashboard.jsx.
              </p>
            </div>
          )}

          {filteredProjects.length === 0 && searchTerm && (
            <div className="col-span-12 text-center py-10">
              <h3 className="text-xl font-semibold mb-2 text-gray-500">No projects found</h3>
              <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
