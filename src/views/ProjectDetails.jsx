// ProjectDetails.jsx — Azure-ready version
// Reads project data from the static PROJECTS array in Dashboard.jsx.
// No AWS API calls. YouTube video shown on left, details on right.

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Lucide from "../base-components/lucide";
import BookDemoModal from "../components/BookDemoModal";
import { FIXED_INDUSTRIES, PROJECTS } from "./Dashboard";

// ── helpers ──────────────────────────────────────────────────────────────────

const getYouTubeVideoId = (url = "") => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const industryLabel = (industryId) => {
  const found = FIXED_INDUSTRIES.find((i) => i.id === industryId);
  return found ? found.name : industryId;
};

// ── component ─────────────────────────────────────────────────────────────────

export const ProjectDetails = () => {
  const { projectName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookDemoModal, setShowBookDemoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ── resolve project from static PROJECTS array ──────────────────────────
  useEffect(() => {
    const passedTitle = location?.state?.projectDetail;
    const searchTitle = passedTitle || decodeURIComponent(projectName || "");

    const found = PROJECTS.find(
      (p) =>
        p.title === searchTitle ||
        p.title.toLowerCase().replace(/\s+/g, "-") ===
          searchTitle.toLowerCase()
    );

    setProject(found || null);
    setLoading(false);
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, [projectName, location]);

  // ── loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  // ── not found ─────────────────────────────────────────────────────────────
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Project Not Found
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const videoId = getYouTubeVideoId(project.youtubeUrl || "");
  const images = project.images || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back button */}
          <Lucide
            icon="ArrowLeftCircle"
            className="w-10 h-10 cursor-pointer my-5 text-gray-600 hover:text-primary transition-colors"
            onClick={() => navigate("/")}
          />

          <div className="bg-white rounded-lg shadow-lg pt-2 px-8 pb-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {project.title}
              </h1>
              <p className="font-semibold text-gray-400 text-sm mb-3">
                {industryLabel(project.industryId)}
              </p>

              {/* Tech stack tags */}
              {(project.techStack || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* LEFT — YouTube video + screenshot carousel */}
              <div className="lg:w-1/2">
                {/* Video / enlarged screenshot */}
                <div
                  className="relative w-full rounded-xl overflow-hidden shadow-2xl"
                  style={{ paddingBottom: "56.25%" }}
                >
                  {selectedImage ? (
                    <>
                      <img
                        src={selectedImage}
                        alt="Enlarged screenshot"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                        onClick={() => setSelectedImage(null)}
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1.5 hover:bg-opacity-75 z-10"
                      >
                        <Lucide icon="X" className="w-5 h-5" />
                      </button>
                    </>
                  ) : videoId ? (
                    <iframe
                      className="absolute inset-0 w-full h-full rounded-xl"
                      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0&controls=1&showinfo=0`}
                      title={`${project.title} Demo Video`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center rounded-xl">
                      <Lucide icon="Video" className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">No video available</p>
                    </div>
                  )}
                </div>

                {/* Screenshot carousel */}
                {images.length > 0 && (
                  <div className="mt-4 relative">
                    <div className="overflow-hidden rounded-lg">
                      <div
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{
                          transform: `translateX(-${currentImageIndex * 25}%)`,
                        }}
                      >
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 w-1/4 px-1"
                          >
                            <img
                              src={img}
                              alt={`Screenshot ${idx + 1}`}
                              className="w-full h-28 object-cover rounded-lg cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300"
                              onClick={() => {
                                setSelectedImage(img);
                                setCurrentImageIndex(
                                  Math.max(0, Math.min(images.length - 4, idx - 1))
                                );
                              }}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/dashboard/images/GenAIDashboard.png";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {currentImageIndex > 0 && (
                      <button
                        onClick={() =>
                          setCurrentImageIndex((p) => Math.max(0, p - 1))
                        }
                        className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border border-gray-200 text-gray-700 w-10 h-10 rounded-full hover:bg-gray-50 z-20 flex items-center justify-center"
                      >
                        <Lucide icon="ChevronLeft" className="w-5 h-5" />
                      </button>
                    )}
                    {currentImageIndex < images.length - 4 && (
                      <button
                        onClick={() =>
                          setCurrentImageIndex((p) =>
                            Math.min(images.length - 4, p + 1)
                          )
                        }
                        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border border-gray-200 text-gray-700 w-10 h-10 rounded-full hover:bg-gray-50 z-20 flex items-center justify-center"
                      >
                        <Lucide icon="ChevronRight" className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT — Demo Overview, Problem Statement, Solution, Buttons */}
              <div className="lg:w-1/2">
                {/* Demo Overview */}
                {(project.demoOverview || project.description) && (
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                      Demo Overview
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-justify">
                      {project.demoOverview || project.description}
                    </p>
                  </div>
                )}

                {/* Problem Statement */}
                {project.problemStatement && (
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Problem Statement
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-justify text-sm">
                      {project.problemStatement}
                    </p>
                  </div>
                )}

                {/* Solution */}
                {project.solution && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Solution
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-justify text-sm">
                      {project.solution}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <button
                    onClick={() => setShowBookDemoModal(true)}
                    className="w-full lg:flex-1 bg-[#1e3a8a] text-white px-3 py-2 rounded-lg hover:bg-blue-900 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md transition-all duration-300 font-semibold text-sm whitespace-nowrap"
                  >
                    Book a Demo
                  </button>

                  <button
                    onClick={() =>
                      project.path && navigate(project.path)
                    }
                    className="w-full lg:flex-1 bg-[#1e3a8a] text-white px-3 py-2 rounded-lg hover:bg-blue-900 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md transition-all duration-300 font-semibold text-sm whitespace-nowrap"
                  >
                    Try it for Free
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full lg:flex-1 bg-[#1e3a8a] text-white px-3 py-2 rounded-lg hover:bg-blue-900 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md transition-all duration-300 font-semibold text-sm whitespace-nowrap"
                  >
                    Explore More Projects
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookDemoModal
        isOpen={showBookDemoModal}
        onClose={() => setShowBookDemoModal(false)}
        project={project}
      />
    </>
  );
};
