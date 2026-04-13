import { LoadingIcon, Lucide } from "@/base-components";
import { useCallback, useContext, useEffect, useReducer, useState } from "react";
import UserContext from "../Context/UserContext";
import Toast from "../assets/Shared/Toast";
import { useToast } from "../hooks/useToast";
import {
  deleteProject,
  deployInfrastructure,
  fetchAllIndustries,
  getDeploymentStatus,
  handleSave,
  stopInfrastructure,
  updateProjectsOrder,
} from "./Api";
import EditModal from "./EditModal";
import SuccessModal from "./SuccessModal";

function Main() {
  const { metadata: data, refreshMetadata, setMetadata } = useContext(UserContext);
  const { toasts, showToast, removeToast } = useToast();

  // Form state with useReducer
  const [formState, dispatchForm] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "SET_FIELD":
          return { ...state, [action.field]: action.value };
        case "SET_ALL":
          return { ...state, ...action.payload };
        case "RESET":
          return {
            title: "",
            marketingLine: "",
            problemStatement: "",
            solution: "",
            image: "",
            gif: "",
            techStack: "",
            industries: [],
            projectDescription: "",
            youTubeVideoLink: "",
            path: "",
            category: [],
            projectStakeholders: [],
            deployInfra: false,
            projectStatus: "InProgress",
            primaryIndustry: "",
            keywords: [],
          };
        default:
          return state;
      }
    },
    {
      title: "",
      marketingLine: "",
      problemStatement: "",
      solution: "",
      image: "",
      gif: "",
      techStack: "",
      industries: [],
      projectDescription: "",
      youTubeVideoLink: "",
      path: "",
      category: [],
      projectStakeholders: [],
      deployInfra: false,
      projectStatus: "InProgress",
      primaryIndustry: "",
      keywords: [],
    }
  );

  // UI state with useReducer
  const [uiState, dispatchUI] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "SET_FIELD":
          return { ...state, [action.field]: action.value };
        case "RESET":
          return {
            deleteModalPreview: false,
            successModal: false,
            showIndustryManagement: false,
            showDeleteConfirm: false,
            showStopConfirm: false,
            isCreateMode: false,
            isSaveButtonDisabled: true,
            isLoading: true,
          };
        default:
          return state;
      }
    },
    {
      deleteModalPreview: false,
      successModal: false,
      showIndustryManagement: false,
      showDeleteConfirm: false,
      showStopConfirm: false,
      isCreateMode: false,
      isSaveButtonDisabled: true,
      isLoading: true,
    }
  );

  // Simple state
  const [deployingProjects, setDeployingProjects] = useState(new Set());
  const [deploymentStatuses, setDeploymentStatuses] = useState({});

  // Remaining simple state
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModal, setIsErrorModal] = useState(false);
  const [updatedemosproject, setUpdateDemosProject] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({ gif: null, images: [] });
  const [industries, setIndustries] = useState([]);
  const [newIndustryName, setNewIndustryName] = useState("");
  const [deletingIndustry, setDeletingIndustry] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [stopProjectTitle, setStopProjectTitle] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const [modifiedIndustries, setModifiedIndustries] = useState(new Set());

  // Load initial deployment statuses when data loads
  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
    const loadInitialDeploymentStatuses = async () => {
      if (!data || data?.length === 0) return;

      const projectsWithDeployInfra = data?.filter((project) => project?.deploy_infra);

      for (const project of projectsWithDeployInfra) {
        // Set fallback status from project data immediately
        setDeploymentStatuses((prev) => ({
          ...prev,
          [project?.title]: {
            status: project?.deployment_status || "not-deployed",
          },
        }));
      }
    };

    loadInitialDeploymentStatuses();
  }, [data]);

  // Poll deployment status every 3 minutes - only for projects that support it
  useEffect(() => {
    if (!data || data?.length === 0) return;

    const pollDeploymentStatus = async () => {
      try {
        // Only poll projects that are in transitional states to avoid unnecessary API calls
        const activeDeployments = Object.keys(deploymentStatuses)?.filter((projectTitle) => {
          const status = deploymentStatuses?.[projectTitle]?.status;
          return (
            status &&
            ["starting", "deploy-started", "in-progress", "stopping", "deploying", "completed"].includes(status)
          );
        });

        if (activeDeployments?.length === 0) return;

        let hasStatusChanges = false;

        for (const projectTitle of activeDeployments) {
          try {
            const result = await getDeploymentStatus(projectTitle);
            if (result?.success && result?.data) {
              const newStatus = result?.data?.deployment_status;
              const currentStatus = deploymentStatuses?.[projectTitle]?.status;

              if (newStatus !== currentStatus) {
                hasStatusChanges = true;
                setDeploymentStatuses((prev) => ({
                  ...prev,
                  [projectTitle]: {
                    status: newStatus,
                  },
                }));

                // Handle status change notifications
                if (newStatus === "failed") {
                  showToast(`Deployment failed for ${projectTitle}`, "error");
                } else if (currentStatus === "stopping" && newStatus === "stopped") {
                  showToast("Infrastructure stopped successfully", "success");
                }
              }
            }
          } catch (error) {
            console.log("Polling error for project:", projectTitle);
          }
        }
      } catch (error) {
        console.log("Polling function error:", error);
      }
    };

    // Poll every 3 minutes (180000ms) only if there are active deployments
    const hasActiveDeployments = Object.values(deploymentStatuses)?.some(
      (status) =>
        status &&
        ["starting", "deploy-started", "in-progress", "stopping", "deploying", "completed"].includes(status?.status)
    );

    if (hasActiveDeployments) {
      const interval = setInterval(pollDeploymentStatus, 180000);
      return () => clearInterval(interval);
    }
  }, [deploymentStatuses]);

  // Load industries when industry management is opened - only if not already loaded

  useEffect(() => {
    if (uiState?.showIndustryManagement && industries?.length === 0) {
      loadIndustries();
    }
  }, [uiState.showIndustryManagement]);

  const loadIndustries = async () => {
    try {
      const fetchedIndustries = await fetchAllIndustries();

      setIndustries(fetchedIndustries || []);
    } catch (error) {
      console.error("Error loading industries:", error);
    }
  };

  // Prevent navigation away from admin panel when modal is open

  useEffect(() => {
    if (uiState?.deleteModalPreview) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();

        return "";
      };
      const handlePopState = (e) => {
        e.preventDefault();
        window.history.pushState(null, "", "/adminpanel");
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [uiState.deleteModalPreview]);

  const hasChanges = () => {
    if (!originalData) return false;

    // Compare only non-industry fields since industries are handled separately
    const formStateWithoutIndustries = {
      title: formState?.title,
      marketingLine: formState?.marketingLine,
      problemStatement: formState?.problemStatement,
      solution: formState?.solution,
      gif: formState?.gif,
      path: formState?.path,
      techStack: formState?.techStack,
      projectDescription: formState?.projectDescription,
      youTubeVideoLink: formState?.youTubeVideoLink,
      projectStatus: formState?.projectStatus,
      category: formState?.category,
      projectStakeholders: formState?.projectStakeholders,
      deployInfra: formState?.deployInfra,
      primaryIndustry: formState?.primaryIndustry,
      keywords: formState?.keywords,
    };

    const originalWithoutIndustries = {
      title: originalData?.title || "",
      marketingLine: originalData?.marketing_line || "",
      problemStatement: originalData?.problem_statement || "",
      solution: originalData?.solution || "",
      gif: originalData?.gif || "",
      path: originalData?.path || "",
      techStack: originalData?.techstack || "",
      projectDescription: originalData?.description || "",
      youTubeVideoLink: originalData?.youtube_link || "",
      projectStatus: originalData?.status || "InProgress",
      category: originalData?.category || [],
      projectStakeholders: originalData?.Project_stakeholders || [],
      deployInfra: originalData?.deploy_infra || false,
      primaryIndustry: originalData?.Primary_industry || "",
      keywords: originalData?.search_keywords || [],
    };

    return JSON.stringify(formStateWithoutIndustries) !== JSON.stringify(originalWithoutIndustries);
  };

  const handleSaveClick = async (currentImages = [], pendingImages = [], pendingGifs = {}) => {
    // Check if there are any changes at all
    const hasFormChanges = hasChanges();
    const hasIndustryChanges = modifiedIndustries && modifiedIndustries?.size > 0;
    const hasPendingUploads = pendingImages?.length > 0 || Object.keys(pendingGifs)?.length > 0;

    if (!uiState?.isCreateMode && !hasFormChanges && !hasIndustryChanges && !hasPendingUploads) {
      // No changes at all, just close the modal
      dispatchUI({ type: "SET_FIELD", field: "deleteModalPreview", value: false });
      return;
    }

    dispatchUI({ type: "SET_FIELD", field: "isSaveButtonDisabled", value: true });

    try {
      const result = await handleSave(
        selectedRowData,
        formState,
        modifiedIndustries,
        currentImages,
        pendingImages,
        pendingGifs
      );

      if (result?.success) {
        dispatchUI({ type: "SET_FIELD", field: "deleteModalPreview", value: false });

        const action = uiState?.isCreateMode ? "added" : "updated";

        setSuccessMessage(<>Project {action} successfully!</>);
        setIsErrorModal(false);
        dispatchUI({ type: "SET_FIELD", field: "successModal", value: true });

        // Refresh only once at the end

        if (refreshMetadata) {
          setTimeout(() => refreshMetadata(), 100);
        }

        // Trigger event for EditModal to upload pending GIFs

        window.dispatchEvent(
          new CustomEvent("saveCompleted", {
            detail: { projectTitle: formState?.title, isCreateMode: uiState?.isCreateMode },
          })
        );
      } else {
        console.error("ADMIN: Save failed:", result?.error);

        if (result?.showModal) {
          dispatchUI({ type: "SET_FIELD", field: "deleteModalPreview", value: false });
          setSuccessMessage(result?.error || "Failed to save changes. Please try again.");
          setIsErrorModal(true);
          dispatchUI({ type: "SET_FIELD", field: "successModal", value: true });
        } else {
          //alert(result?.error || "Failed to save changes. Please try again.");
        }
      }
    } catch (error) {
      console.error("ADMIN: Save error:", error);
      // alert("An unexpected error occurred while saving.");
    } finally {
      dispatchUI({ type: "SET_FIELD", field: "isSaveButtonDisabled", value: false });
    }
  };

  const handleUpdateDemosProject = async () => {
    try {
      // Extract project titles in current order

      const projectIds = data?.map((project) => project?.title);

      const result = await updateProjectsOrder(projectIds);

      if (result?.success) {
        setUpdateDemosProject(false);

        if (refreshMetadata) {
          await refreshMetadata();
        }

        // showProjectToast('reordered', 'Projects');

        setSuccessMessage(<>Projects reordered successfully!</>);
        setIsErrorModal(false);
        dispatchUI({ type: "SET_FIELD", field: "successModal", value: true });
      } else {
        console.error("Failed to update project order:", result?.error);

        //alert("Failed to update project order: " + (result?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating project order:", error);

      //alert("Error updating project order: " + (error?.message || "Unknown error"));
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null) return;
    const updatedData = [...data];
    const [movedItem] = updatedData?.splice(draggedIndex, 1);
    updatedData.splice(dropIndex, 0, movedItem);

    setMetadata(updatedData);
    setDraggedIndex(null);
    setUpdateDemosProject(true);
  };

  const handleDeleteProjects = async () => {
    try {
      const projectsToDelete = Array.from(selectedProjects);

      const results = await Promise.all(projectsToDelete?.map((title) => deleteProject(title)));

      const successful = results?.filter((r) => r?.success)?.length;
      const failed = results?.filter((r) => !r?.success)?.length;

      if (successful > 0) {
        await refreshMetadata();
        setSelectedProjects(new Set());
        // showProjectToast('deleted', `${successful} project${successful > 1 ? 's' : ''}`);
        setSuccessMessage(
          <>
            Successfully deleted {successful} project{successful > 1 ? "s" : ""}!
          </>
        );
        setIsErrorModal(false);
        dispatchUI({ type: "SET_FIELD", field: "successModal", value: true });
      }

      if (failed > 0) {
        console.error(`Failed to delete ${failed} projects`);
      }
    } catch (error) {
      console.error("Error deleting projects:", error);
    } finally {
      dispatchUI({ type: "SET_FIELD", field: "showDeleteConfirm", value: false });
    }
  };

  // Update loading state when data changes
  useEffect(() => {
    if (data !== undefined) {
      dispatchUI({ type: "SET_FIELD", field: "isLoading", value: false });
    }
    const timer = setTimeout(() => {
      dispatchUI({ type: "SET_FIELD", field: "isLoading", value: false });
    }, 3000);
    return () => clearTimeout(timer);
  }, [data]);

  // REAL API DEPLOYMENT FUNCTIONS:
  const handleDeployInfrastructure = async (projectTitle) => {
    // Prevent multiple simultaneous calls
    if (deployingProjects?.has(projectTitle)) {
      return;
    }

    try {
      setDeployingProjects((prev) => new Set([...prev, projectTitle]));

      // Set immediate deploying status
      setDeploymentStatuses((prev) => ({
        ...prev,
        [projectTitle]: { status: "deploying" },
      }));

      const result = await deployInfrastructure(projectTitle);

      if (result?.success) {
        // Update status based on API response
        const newStatus = result?.data?.deployment_status || "starting";
        setDeploymentStatuses((prev) => ({
          ...prev,
          [projectTitle]: { status: newStatus },
        }));

        showToast("Infrastructure deployment started!", "success");

        // Call status check API after 10 seconds
        setTimeout(async () => {
          try {
            const statusResult = await getDeploymentStatus(projectTitle);
            if (statusResult?.success) {
              setDeploymentStatuses((prev) => ({
                ...prev,
                [projectTitle]: { status: statusResult?.data?.deployment_status },
              }));
            }
          } catch (error) {
            console.log("Status check error:", error);
          }
        }, 10000);
      } else {
        // Handle cooldown error specifically
        if (result?.statusCode === 429) {
          showToast("Please wait 5 minutes between RDS operations");
          // Don't reset status for cooldown errors
        } else {
          // Reset status on other failures
          setDeploymentStatuses((prev) => ({
            ...prev,
            [projectTitle]: { status: "not-deployed" },
          }));
          showToast("Deployment failed");
        }
      }
    } catch (error) {
      // Reset status on error
      setDeploymentStatuses((prev) => ({
        ...prev,
        [projectTitle]: { status: "not-deployed" },
      }));
      showToast(error?.message || "Deployment failed", "error");
    } finally {
      // Always remove from deploying projects
      setDeployingProjects((prev) => {
        const updated = new Set(prev);
        updated.delete(projectTitle);
        return updated;
      });
    }
  };

  const handleStopInfrastructure = async (projectTitle) => {
    // Prevent multiple simultaneous calls
    if (deployingProjects?.has(projectTitle)) {
      return;
    }

    try {
      // Set immediate stopping status BEFORE adding to deployingProjects
      setDeploymentStatuses((prev) => ({
        ...prev,
        [projectTitle]: { status: "stopping" },
      }));

      setDeployingProjects((prev) => new Set([...prev, projectTitle]));

      // Show immediate stopping initiated message
      showToast("Infrastructure stopping initiated", "info");

      const result = await stopInfrastructure(projectTitle);

      if (result?.success) {
        // Update status based on API response
        const newStatus = result?.data?.deployment_status || "stopped";
        setDeploymentStatuses((prev) => ({
          ...prev,
          [projectTitle]: { status: newStatus },
        }));

        // Call status check API after 10 seconds
        setTimeout(async () => {
          try {
            const statusResult = await getDeploymentStatus(projectTitle);
            if (statusResult?.success) {
              setDeploymentStatuses((prev) => ({
                ...prev,
                [projectTitle]: { status: statusResult?.data?.deployment_status },
              }));
            }
          } catch (error) {
            console.log("Status check error:", error);
          }
        }, 10000);
      } else {
        // Handle cooldown error specifically
        if (result?.statusCode === 429) {
          showToast("Please wait 5 minutes between RDS operations");
          // Don't reset status for cooldown errors
        } else {
          // Reset status on other failures
          setDeploymentStatuses((prev) => ({
            ...prev,
            [projectTitle]: { status: "completed" },
          }));
          showToast("Stop infrastructure failed");
        }
      }
    } catch (error) {
      // Reset status on error
      setDeploymentStatuses((prev) => ({
        ...prev,
        [projectTitle]: { status: "completed" },
      }));
      showToast("Stop infrastructure failed");
    } finally {
      // Always remove from deploying projects
      setDeployingProjects((prev) => {
        const updated = new Set(prev);
        updated.delete(projectTitle);
        return updated;
      });
    }
  };

  const confirmStopInfrastructure = async () => {
    dispatchUI({ type: "SET_FIELD", field: "showStopConfirm", value: false });
    setStopProjectTitle("");
  };

  const getDeployButtonContent = (project) => {
    // Use deployment status from polling state (most up-to-date)
    const polledStatus = deploymentStatuses?.[project?.title];
    const projectStatus = {
      status: polledStatus?.status || project?.deployment_status || "not-deployed",
    };

    const isDeploying = deployingProjects?.has(project?.title);

    if (isDeploying) {
      // Check the actual status to show correct text
      if (projectStatus?.status === "stopping") {
        return { text: "Stopping...", color: "btn-primary", disabled: true };
      }
      return { text: "Deploying...", color: "btn-primary", disabled: true };
    }

    if (projectStatus?.status === "deploying") {
      return { text: "Deploying...", color: "btn-primary", disabled: true };
    }

    switch (projectStatus?.status) {
      case "starting":
      case "deploy-started":
        return {
          text: "Starting...",
          color: "btn-primary",
          //disabled: true
        };
      case "in-progress":
        return {
          text: "In Progress",
          color: "btn-primary",
          //disabled: true
        };
      case "completed":
        return {
          text: "Stop",
          color: "btn-danger",
          action: "stop",
          // disabled: true
        };
      case "stopping":
        return {
          text: "Stopping...",
          color: "btn-primary",
          //disabled: true
        };
      case "stopped":
        return {
          text: "Deploy",
          color: "btn-primary",
          //disabled: true
        };
      case "failed":
        return {
          text: "Retry Deploy",
          color: "btn-warning",
          //disabled: true
        };
      case "not-deployed":
      default:
        return {
          text: "Deploy",
          color: "btn-primary",
          //disabled: true
        };
    }
  };

  const displayData = data && data?.length > 0 ? data : [];

  const shouldShowTable = !uiState?.isLoading;

  return (
    <>
      {!shouldShowTable ? (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <LoadingIcon icon="circles" className="w-8 h-8 mb-4" />

            <p className="text-gray-600">Loading admin panel...</p>

            <button
              onClick={() => {
                dispatchUI({ type: "SET_FIELD", field: "isLoading", value: false });
                if (refreshMetadata) refreshMetadata();
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Force Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-2 mt-2">
          <div className="intro-y col-span-12 overflow-x-auto lg:overflow-visible overflow-visible">
            <div className="flex justify-end mb-2 gap-2">
              {selectedProjects?.size > 0 && (
                <button
                  className="btn btn-danger intro-x shadow-md"
                  onClick={() => dispatchUI({ type: "SET_FIELD", field: "showDeleteConfirm", value: true })}
                >
                  <Lucide icon="Trash2" className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedProjects?.size})
                </button>
              )}

              {updatedemosproject && (
                <button className="btn btn-primary intro-x  shadow-md" onClick={handleUpdateDemosProject}>
                  Update Projects Order
                </button>
              )}

              <button
                className="btn btn-primary intro-x shadow-md"
                onClick={() => {
                  setSelectedRowData(null);
                  setOriginalData(null);
                  dispatchForm({ type: "RESET" });
                  setSelectedFiles({ gif: null, images: [] });
                  dispatchUI({ type: "SET_FIELD", field: "isCreateMode", value: true });
                  dispatchUI({ type: "SET_FIELD", field: "deleteModalPreview", value: true });
                  dispatchUI({ type: "SET_FIELD", field: "isSaveButtonDisabled", value: false });
                }}
              >
                <Lucide icon="Plus" className="w-4 h-4 mr-2" />
                Add New Project
              </button>
            </div>
            <div className="block lg:hidden">
              {/* Mobile Card View */}

              {displayData?.map((row, index) => (
                <div key={row?.id} className="intro-x bg-white rounded-lg shadow-md p-3 mb-3 border">
                  <div className="flex items-start mb-2">
                    <div className="relative flex justify-center mr-3 mt-1">
                      <div
                        className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer ${
                          selectedProjects?.has(row?.title)
                            ? "border-transparent bg-blue-800"
                            : "border-gray-300 bg-white"
                        }`}
                        onClick={() => {
                          const newSelected = new Set(selectedProjects);

                          if (selectedProjects?.has(row?.title)) {
                            newSelected.delete(row?.title);
                          } else {
                            newSelected.add(row?.title);
                          }

                          setSelectedProjects(newSelected);
                        }}
                      >
                        {selectedProjects?.has(row?.title) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{row?.title}</h3>

                      <p className="text-sm text-gray-600 mb-1">ID: {row?.id}</p>

                      <p className="text-sm text-primary mb-1">Path: {row?.path}</p>
                    </div>

                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => {
                        setSelectedRowData(row);
                        setOriginalData(row);
                        dispatchForm({
                          type: "SET_ALL",
                          payload: {
                            title: row?.title,
                            marketingLine: row?.marketing_line || "",
                            problemStatement: row?.problem_statement || "",
                            solution: row?.solution || "",
                            image: row?.img,
                            gif: row?.gif || "",
                            techStack: row?.techstack,
                            industries: row?.industries || [],
                            projectDescription: row?.description || "",
                            youTubeVideoLink: row?.youtube_link || "",
                            path: row?.path || "",
                            category: row?.category || [],
                            projectStakeholders:
                              row?.Project_stakeholders || row?.project_stakeholders || row?.stakeholders || [],
                            deployInfra: row?.deploy_infra || false,
                            projectStatus: row?.status || "InProgress",
                            primaryIndustry: row?.Primary_industry || "",
                            keywords: Array.isArray(row?.search_keywords) ? row?.search_keywords : [],
                          },
                        });
                        setSelectedFiles({ gif: null, images: [] });
                        dispatchUI({ type: "SET_FIELD", field: "isCreateMode", value: false });
                        dispatchUI({ type: "SET_FIELD", field: "deleteModalPreview", value: true });
                        dispatchUI({ type: "SET_FIELD", field: "isSaveButtonDisabled", value: true });
                      }}
                    >
                      <Lucide icon="Edit" className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      <strong>Industries:</strong>{" "}
                      {row?.industries && row?.industries?.length > 0
                        ? row?.industries?.map((ind) => ind?.name || ind?.industry_name || "Unknown")?.join(", ")
                        : "None"}
                    </div>

                    <div>
                      <strong>Project Stakeholders:</strong>{" "}
                      {(row?.Project_stakeholders || row?.project_stakeholders || row?.stakeholders) &&
                      (row?.Project_stakeholders || row?.project_stakeholders || row?.stakeholders)?.length > 0
                        ? (row?.Project_stakeholders || row?.project_stakeholders || row?.stakeholders)?.join(", ")
                        : "None"}
                    </div>

                    <div>
                      <strong>Deploy Infrastructure:</strong>
                      {row?.deploy_infra ? (
                        (() => {
                          const buttonConfig = getDeployButtonContent(row);
                          return (
                            <button
                              className={`ml-2 btn ${buttonConfig?.color} btn-sm px-4 py-1 text-xs`}
                              disabled={buttonConfig?.disabled || false}
                              onClick={() => {
                                if (buttonConfig?.action === "stop") {
                                  handleStopInfrastructure(row?.title);
                                } else {
                                  handleDeployInfrastructure(row?.title);
                                }
                              }}
                            >
                              {buttonConfig?.text}
                            </button>
                          );
                        })()
                      ) : (
                        <span className="ml-2 text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <table className="hidden lg:table table-report -mt-2 w-full border-collapse overflow-visible">
              <thead>
                <tr>
                  <th className="text-center w-10"></th>
                  <th className="text-center w-16 break-words">ID</th>
                  <th className="text-center w-48 break-words">TITLE</th>
                  <th className="text-center w-48 break-words">PROJECT STAKEHOLDERS</th>
                  <th className="text-center w-36 break-words">PATH</th>
                  <th className="text-center w-72 break-words">INDUSTRIES</th>
                  <th className="text-center w-36 break-words">DEPLOY INFRASTRUCTURE</th>
                  <th className="text-center w-24 break-words">ACTION</th>
                </tr>
              </thead>
              <tbody className="overflow-visible">
                {displayData?.length > 0 ? (
                  displayData?.map((row, index) => (
                    <tr
                      key={row?.id}
                      className="intro-x bg-white border-b border-gray-200 hover:bg-gray-50 h-12"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                    >
                      <td className="text-center py-2 px-3">
                        <div className="relative flex justify-center">
                          <div
                            className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer ${
                              selectedProjects?.has(row?.title) ? "border-transparent" : "border-gray-300 bg-white"
                            }`}
                            style={{ backgroundColor: selectedProjects?.has(row?.title) ? "#2C4685" : "white" }}
                            onClick={() => {
                              const newSelected = new Set(selectedProjects);
                              selectedProjects.has(row?.title)
                                ? newSelected.delete(row?.title)
                                : newSelected.add(row?.title);
                              setSelectedProjects(newSelected);
                            }}
                          >
                            {selectedProjects?.has(row?.title) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-2 px-3">{row?.id}</td>
                      <td className="text-center py-2 px-3">
                        <h3>{row?.title}</h3>
                      </td>
                      <td className="text-center py-2 px-3">
                        <div className="relative group">
                          <span>
                            {(() => {
                              const stakeholders =
                                row?.Project_stakeholders || row?.project_stakeholders || row?.stakeholders;
                              if (!stakeholders || stakeholders?.length === 0) return "None";
                              return stakeholders?.[0] + (stakeholders?.length > 1 ? "..." : "");
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-2 px-3">
                        <h3 className="text-primary">{row?.path}</h3>
                      </td>
                      <td className="text-center py-2 px-3">
                        <div className="relative group">
                          <span>
                            {(() => {
                              if (!row?.industries || row?.industries?.length === 0) return "None";
                              const industries = row?.industries?.map(
                                (ind) => ind?.name || ind?.industry_name || "Unknown"
                              );
                              const displayIndustries = industries?.slice(0, 2);
                              return displayIndustries?.join(", ") + (industries?.length > 2 ? "..." : "");
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-2 px-3">
                        {row?.deploy_infra ? (
                          (() => {
                            const buttonConfig = getDeployButtonContent(row);
                            return (
                              <button
                                className={`btn ${buttonConfig?.color} btn-sm px-4 py-1 text-xs`}
                                disabled={buttonConfig?.disabled || false}
                                onClick={() =>
                                  buttonConfig?.action === "stop"
                                    ? handleStopInfrastructure(row?.title)
                                    : handleDeployInfrastructure(row?.title)
                                }
                              >
                                {buttonConfig?.text}
                              </button>
                            );
                          })()
                        ) : (
                          <span className="text-gray-400 text-lg">-</span>
                        )}
                      </td>
                      <td className="text-center py-2 px-3">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={() => {
                            setSelectedRowData(row);
                            setOriginalData(row);
                            dispatchForm({
                              type: "SET_ALL",
                              payload: {
                                title: row?.title,
                                marketingLine: row?.marketing_line || "",
                                problemStatement: row?.problem_statement || "",
                                solution: row?.solution || "",
                                image: row?.img,
                                gif: row?.gif || "",
                                techStack: row?.techstack,
                                industries: row?.industries || [],
                                projectDescription: row?.description || "",
                                youTubeVideoLink: row?.youtube_link || "",
                                path: row?.path || "",
                                category: row?.category || [],
                                projectStakeholders:
                                  row?.Project_stakeholders || row?.project_stakeholders || row?.stakeholders || [],
                                deployInfra: row?.deploy_infra || false,
                                projectStatus: row?.status || "InProgress",
                                primaryIndustry: row?.Primary_industry || "",
                                keywords: Array.isArray(row?.search_keywords) ? row?.search_keywords : [],
                              },
                            });
                            setSelectedFiles({ gif: null, images: [] });
                            dispatchUI({ type: "SET_FIELD", field: "isCreateMode", value: false });
                            dispatchUI({ type: "SET_FIELD", field: "deleteModalPreview", value: true });
                            dispatchUI({ type: "SET_FIELD", field: "isSaveButtonDisabled", value: true });
                          }}
                        >
                          <Lucide icon="Edit" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      <div>
                        <p className="text-lg mb-2">No projects found</p>
                        <p className="text-sm">Click "Add New Project" to create your first project</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditModal
        show={uiState?.deleteModalPreview}
        onClose={() => {
          dispatchUI({ type: "SET_FIELD", field: "deleteModalPreview", value: false });
          dispatchUI({ type: "SET_FIELD", field: "isCreateMode", value: false });
          setOriginalData(null);
          setModifiedIndustries(new Set());
          dispatchForm({ type: "RESET" });
          setSelectedFiles({ gif: null, images: [] });
          setTimeout(() => {
            if (window.location.pathname !== "/adminpanel") {
              window.history.pushState(null, "", "/adminpanel");
            }
          }, 100);
        }}
        formState={formState}
        dispatchForm={dispatchForm}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        existingImages={selectedRowData?.images || []}
        refreshMetadata={refreshMetadata}
        handleSaveClick={handleSaveClick}
        isSaveButtonDisabled={uiState?.isSaveButtonDisabled}
        setIsSaveButtonDisabled={useCallback(
          (value) => dispatchUI({ type: "SET_FIELD", field: "isSaveButtonDisabled", value }),
          [dispatchUI]
        )}
        lastEdited={selectedRowData?.lastEdited || new Date().toISOString()}
        selectedRowData={selectedRowData}
        isCreateMode={uiState?.isCreateMode}
        modifiedIndustries={modifiedIndustries}
        setModifiedIndustries={setModifiedIndustries}
      />

      <SuccessModal
        show={uiState?.successModal}
        onClose={() => {
          dispatchUI({ type: "SET_FIELD", field: "successModal", value: false });
          setIsErrorModal(false);
          setTimeout(() => {
            if (window.location.pathname !== "/adminpanel") {
              window.history.pushState(null, "", "/adminpanel");
            }
          }, 100);
        }}
        message={successMessage}
        isError={isErrorModal}
      />

      {/* Delete Confirmation Modal */}

      {uiState?.showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-20">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Confirm Deletion</h3>

            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete {selectedProjects?.size} selected project
              {selectedProjects?.size > 1 ? "s" : ""}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-secondary"
                onClick={() => dispatchUI({ type: "SET_FIELD", field: "showDeleteConfirm", value: false })}
              >
                Cancel
              </button>

              <button className="btn btn-danger" onClick={handleDeleteProjects}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Infrastructure Confirmation Modal */}
      {uiState?.showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-20">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Stop Infrastructure</h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to stop the infrastructure for <strong>"{stopProjectTitle}"</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  dispatchUI({ type: "SET_FIELD", field: "showStopConfirm", value: false });
                  setStopProjectTitle("");
                }}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmStopInfrastructure}>
                Stop Infrastructure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}

      {toasts?.map((toast) => (
        <Toast
          key={toast?.id}
          message={toast?.message}
          type={toast?.type}
          action={toast?.action}
          projectName={toast?.projectName}
          onClose={() => removeToast(toast?.id)}
        />
      ))}
    </>
  );
}

export default Main;
