import { useEffect, useState } from "react";

import { Lucide, Modal, ModalBody, ModalFooter, ModalHeader } from "@/base-components";

import { findTypoSuggestions } from "../utils/keywordSuggestions";
import { addGlobalIndustry, createProject, fetchAllIndustries, fetchAllKeywords } from "./Api";

import SuccessModal from "./SuccessModal";

import Toast from "../assets/Shared/Toast";

const EditModal = ({
  show,
  onClose,
  formState,
  dispatchForm,
  handleSaveClick,
  isSaveButtonDisabled,
  onIndustryAdded,
  existingImages = [],
  refreshMetadata,
  isCreateMode = false,
  selectedRowData = null,
  setIsSaveButtonDisabled,
  setModifiedIndustries,
}) => {
  // Extract values from formState
  const {
    title: editTitle,
    techStack: editTechStack,
    industries: editIndustries,
    projectDescription: editProjectDescription,
    youTubeVideoLink: editYouTubeVideoLink,
    path: editPath,
    projectStatus: editProjectStatus,
    category: editCategory,
    projectStakeholders: editProjectStakeholders,
    deployInfra: editDeployInfra,
    primaryIndustry: editPrimaryIndustry,
    keywords: editKeywords,
  } = formState;

  // Create setter functions using dispatchForm
  const setEditTitle = (value) => dispatchForm({ type: "SET_FIELD", field: "title", value });
  const setEditIndustries = (value) => dispatchForm({ type: "SET_FIELD", field: "industries", value });
  const setEditYouTubeVideoLink = (value) => dispatchForm({ type: "SET_FIELD", field: "youTubeVideoLink", value });
  const setEditPath = (value) => dispatchForm({ type: "SET_FIELD", field: "path", value });
  const setEditProjectStatus = (value) => dispatchForm({ type: "SET_FIELD", field: "projectStatus", value });
  const setEditCategory = (value) => dispatchForm({ type: "SET_FIELD", field: "category", value });
  const setEditProjectStakeholders = (value) =>
    dispatchForm({ type: "SET_FIELD", field: "projectStakeholders", value });
  const setEditDeployInfra = (value) => dispatchForm({ type: "SET_FIELD", field: "deployInfra", value });
  const setEditPrimaryIndustry = (value) => dispatchForm({ type: "SET_FIELD", field: "primaryIndustry", value });
  const setEditKeywords = (value) => dispatchForm({ type: "SET_FIELD", field: "keywords", value });
  const [currentPage, setCurrentPage] = useState(1);

  const [expandedIndustries, setExpandedIndustries] = useState(new Set());

  const [availableIndustries, setAvailableIndustries] = useState(["All"]);

  const [newIndustryName, setNewIndustryName] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [isPrimaryIndustryDropdownOpen, setIsPrimaryIndustryDropdownOpen] = useState(false);

  const [validationError, setValidationError] = useState("");

  const [enlargedImage, setEnlargedImage] = useState(null);
  const [selectedIndustriesForDelete, setSelectedIndustriesForDelete] = useState(new Set());
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const [pendingGifs, setPendingGifs] = useState({});
  const [currentImages, setCurrentImages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [categoryDuplicateError, setCategoryDuplicateError] = useState("");
  const [stakeholderDuplicateError, setStakeholderDuplicateError] = useState("");
  const [keywordDuplicateError, setKeywordDuplicateError] = useState("");
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [keywordTypoSuggestion, setKeywordTypoSuggestion] = useState("");
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [availableKeywords, setAvailableKeywords] = useState([]);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [blobUrls, setBlobUrls] = useState({});

  // Function to get keyword suggestions based on input
  const getKeywordSuggestions = (input) => {
    if (!input || input?.length < 1) return [];

    const currentKeywords = Array.isArray(editKeywords) ? editKeywords : [];
    const inputLower = input?.toLowerCase();

    const suggestions = availableKeywords
      .filter(
        (keyword) =>
          keyword?.toLowerCase().includes(inputLower) &&
          !currentKeywords?.some((existing) => existing?.toLowerCase() === keyword?.toLowerCase())
      )
      .slice(0, 10);

    return suggestions;
  };

  // Fetch industries and keywords when modal opens

  useEffect(() => {
    if (show) {
      // Load industries if not already loaded

      if (availableIndustries?.length <= 1) {
        const loadIndustries = async () => {
          try {
            const industries = await fetchAllIndustries();

            if (Array.isArray(industries) && industries?.length > 0) {
              setAvailableIndustries(["All", ...industries]);
            } else {
              setAvailableIndustries(["All"]);
            }
          } catch (error) {
            setAvailableIndustries(["All"]);
          }
        };

        loadIndustries();
      }

      // Load keywords for suggestions

      const loadKeywords = async () => {
        try {
          const keywords = await fetchAllKeywords();

          setAvailableKeywords(keywords);
        } catch (error) {
          console.error("Failed to load keywords:", error);

          setAvailableKeywords([]);
        }
      };

      loadKeywords();
    }
  }, [show]);

  // Initialize current images and reset pending files when modal opens/closes

  useEffect(() => {
    if (show) {
      setCurrentPage(1); // Reset to first page when modal opens
      setCurrentImages(existingImages || []);
      setValidationError(""); // Clear validation error when modal opens
      setCategoryDuplicateError(""); // Clear category duplicate error
      setStakeholderDuplicateError(""); // Clear stakeholder duplicate error
      setKeywordDuplicateError(""); // Clear keyword duplicate error
      setFieldErrors({}); // Clear all field errors for fresh modal state

      // Check for existing GIFs in localStorage immediately
      if (editTitle && editIndustries?.length > 0) {
        const updatedIndustries = editIndustries?.map((industry) => {
          const normalizedTitle = editTitle?.replace(/[^a-zA-Z0-9]/g, "_");
          const normalizedIndustry = industry?.name?.replace(/[^a-zA-Z0-9]/g, "_");
          const storageKey = `gif_${normalizedTitle}_${normalizedIndustry}`;
          try {
            const storedGif = window.localStorage.getItem(storageKey);
            if (storedGif) {
              return { ...industry, gif: `data:image/gif;base64,${storedGif}` };
            }
          } catch (error) {}
          return industry;
        });
        setEditIndustries(updatedIndustries);
      }

      // Ensure status is properly set for both new and existing projects

      if (isCreateMode && !editProjectStatus) {
        setEditProjectStatus("inprogress");
      } else if (!isCreateMode && selectedRowData && !editProjectStatus) {
        setEditProjectStatus(selectedRowData?.status || "inprogress");
      }
    } else {
      // Cleanup blob URLs
      Object.values(blobUrls).forEach((url) => URL.revokeObjectURL(url));
      setBlobUrls({});
      setPendingImages([]);
      setPendingGifs({});
      setCurrentImages([]);
      setValidationError("");
      setCategoryDuplicateError("");
      setStakeholderDuplicateError("");
      setKeywordDuplicateError("");
    }
  }, [show]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event?.target?.closest?.(".industries-dropdown")) {
        setIsDropdownOpen(false);
      }
      if (isStatusDropdownOpen && !event?.target?.closest?.(".status-dropdown")) {
        setIsStatusDropdownOpen(false);
      }
      if (isPrimaryIndustryDropdownOpen && !event?.target?.closest?.(".primary-industry-dropdown")) {
        setIsPrimaryIndustryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isStatusDropdownOpen, isPrimaryIndustryDropdownOpen]);

  // Scroll to top when modal opens to ensure full visibility

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";

      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  // Check if all required fields are filled and update save button state
  useEffect(() => {
    if (show && setIsSaveButtonDisabled) {
      if (isCreateMode) {
        // For create mode, only require title and at least one industry
        const hasRequiredFields = editTitle?.trim() && editIndustries?.length > 0;
        setIsSaveButtonDisabled(!hasRequiredFields);
      } else {
        // For edit mode, require all fields to be filled
        const hasRequiredFields =
          editTitle?.trim() &&
          editIndustries?.length > 0 &&
          editIndustries?.every(
            (industry) =>
              industry?.description?.trim() &&
              industry?.problemStatement?.trim() &&
              industry?.solution?.trim() &&
              industry?.marketingLine?.trim() &&
              industry?.gif
          );
        setIsSaveButtonDisabled(!hasRequiredFields);
      }
    }
  }, [editTitle, editIndustries, show, setIsSaveButtonDisabled, isCreateMode]);

  // Handle pending GIF uploads after save completion
  useEffect(() => {
    const handleSaveCompleted = (event) => {
      const { projectTitle, isCreateMode: wasCreateMode } = event?.detail || {};
      if (!wasCreateMode && pendingGifs && Object.keys(pendingGifs)?.length > 0) {
        // Upload GIFs in background without blocking
        setTimeout(async () => {
          for (const [industryIndex, gifFile] of Object.entries(pendingGifs)) {
            try {
              const { uploadGif } = await import("./Api");
              const industryName = editIndustries?.[parseInt(industryIndex)]?.name;
              if (industryName) {
                await uploadGif(projectTitle, industryName, gifFile);
              }
            } catch (error) {
              console.error(`Error uploading GIF for industry ${industryIndex}:`, error);
            }
          }
          setPendingGifs({});
          if (refreshMetadata) refreshMetadata();
        }, 100);
      }
    };

    if (show) {
      window.addEventListener("saveCompleted", handleSaveCompleted);
      return () => window.removeEventListener("saveCompleted", handleSaveCompleted);
    }
  }, [show, pendingGifs, editIndustries, refreshMetadata]);

  if (!show) return null;

  const validateMandatoryFields = () => {
    const errors = {};

    if (!editTitle?.trim()) {
      errors.title = "Title is required";
    }

    if (!editIndustries || editIndustries?.length === 0) {
      errors.industries = "At least one Industry must be selected";
    }

    const totalImages = currentImages?.length + pendingImages?.length;

    if (totalImages < 4) {
      errors.images = "Minimum 4 images required";
    } else if (totalImages > 5) {
      errors.images = "Maximum 5 images allowed";
    }

    // Validate industry fields

    editIndustries?.forEach((industry, index) => {
      if (!industry.description?.trim()) {
        errors[`industry_${index}_description`] = "Project Description is required";
      }

      if (!industry?.problemStatement?.trim()) {
        errors[`industry_${index}_problemStatement`] = "Problem Statement is required";
      }

      if (!industry?.solution?.trim()) {
        errors[`industry_${index}_solution`] = "Solution is required";
      }

      if (!industry?.marketingLine?.trim()) {
        errors[`industry_${index}_marketingLine`] = "Marketing Line is required";
      }

      if (!industry?.gif) {
        errors[`industry_${index}_gif`] = "GIF is required";
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors)?.length === 0;
  };

  const validatePage1Fields = () => {
    const errors = {};

    if (!editTitle?.trim()) {
      errors.title = "Title is required";
    }

    if (!editIndustries || editIndustries?.length === 0) {
      errors.industries = "At least one Industry must be selected";
    }

    if (!editPrimaryIndustry?.trim()) {
      errors.primaryIndustry = "Primary Industry is required";
    }

    if (!editProjectStakeholders || editProjectStakeholders?.length === 0) {
      errors.stakeholders = "At least one Project Stakeholder is required";
    }

    setFieldErrors(errors);
    const isValid = Object.keys(errors)?.length === 0;

    return isValid;
  };

  const handleCreateProject = async () => {
    if (!validateMandatoryFields()) {
      const totalImages = currentImages?.length + pendingImages?.length;

      if (totalImages < 4) {
        setValidationError("You haven't added the required number of images. Please add at least 4 images.");
      }

      return;
    }

    try {
      const projectData = {
        title: editTitle?.trim(),

        description: editProjectDescription?.trim() || "",

        category: Array.isArray(editCategory) ? editCategory : [],

        path: editPath?.trim() || "",

        tech_stack: editTechStack?.trim() || "",

        deploy_infra: Boolean(editDeployInfra),

        status: editProjectStatus || "inprogress",

        Project_stakeholders: Array.isArray(editProjectStakeholders) ? editProjectStakeholders : [],

        Primary_industry: editPrimaryIndustry?.trim() || "",

        search_keywords: Array.isArray(editKeywords) ? editKeywords : [],

        industry: editIndustries?.map?.((ind) => ({
          industry_name: ind?.name,

          description: ind?.description || "",

          marketing_headline: ind?.marketingLine || "",

          problem_statement: ind?.problemStatement || "",

          solution: ind?.solution || "",

          demo_gif: "",
        })),

        images: [],

        youtube_link: editYouTubeVideoLink?.trim() || "",
      };

      const result = await createProject(projectData);

      if (
        result &&
        (result?.success === true ||
          (result?.data && result?.data?.success === true) ||
          (result?.data && result?.data?.status_code === 200))
      ) {
        const projectTitle = editTitle.trim();

        // Upload pending media in background
        if (pendingImages?.length > 0 || (pendingGifs && Object.keys(pendingGifs)?.length > 0)) {
          setTimeout(async () => {
            try {
              if (pendingImages?.length > 0) {
                const { uploadImages } = await import("./Api");
                await uploadImages(projectTitle, pendingImages);
              }
              if (pendingGifs && Object.keys(pendingGifs)?.length > 0) {
                const { uploadGif } = await import("./Api");
                for (const [industryIndex, gifFile] of Object.entries(pendingGifs) || []) {
                  const industryName = editIndustries?.[parseInt(industryIndex)]?.name;
                  if (industryName) await uploadGif(projectTitle, industryName, gifFile);
                }
              }
              if (refreshMetadata) refreshMetadata();
            } catch (error) {
              console.error("Upload error:", error);
            }
          }, 300);
        } else if (refreshMetadata) {
          refreshMetadata();
        }

        // Notify dashboard to refresh after project creation

        window.dispatchEvent(
          new CustomEvent("projectUpdated", {
            detail: { action: "project-created", title: editTitle },
          })
        );

        // Show success notifications immediately

        setShowToast(true);

        setShowSuccessModal(true);

        setTimeout(() => {
          onClose(true);
        }, 2000);
      } else {
        console.error("Failed to create project:", result?.error);

        setErrorMessage("Failed to create project");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error creating project:", error);

      setErrorMessage("Failed to create project");
      setShowErrorModal(true);
    }
  };

  const handleDeleteSelectedIndustries = () => {
    if (isCreateMode) {
      // For create mode, just remove from local state

      const updatedIndustries = editIndustries?.filter((_, index) => !selectedIndustriesForDelete?.has(index));

      setEditIndustries(updatedIndustries);

      setSelectedIndustriesForDelete(new Set());

      // Clear field errors for deleted industries

      const newFieldErrors = { ...fieldErrors };

      Array.from(selectedIndustriesForDelete)?.forEach?.((index) => {
        delete newFieldErrors[`industry_${index}_description`];

        delete newFieldErrors[`industry_${index}_problemStatement`];

        delete newFieldErrors[`industry_${index}_solution`];

        delete newFieldErrors[`industry_${index}_marketingLine`];

        delete newFieldErrors[`industry_${index}_gif`];
      });

      setFieldErrors(newFieldErrors);
    } else {
      // For edit mode, just remove from local state - API call will be made on save

      const updatedIndustries = editIndustries?.filter?.((_, index) => !selectedIndustriesForDelete?.has?.(index));

      setEditIndustries(updatedIndustries);

      setSelectedIndustriesForDelete(new Set());

      // Clear field errors for deleted industries

      const newFieldErrors = { ...fieldErrors };

      Array.from(selectedIndustriesForDelete)?.forEach?.((index) => {
        delete newFieldErrors[`industry_${index}_description`];

        delete newFieldErrors[`industry_${index}_problemStatement`];

        delete newFieldErrors[`industry_${index}_solution`];

        delete newFieldErrors[`industry_${index}_marketingLine`];

        delete newFieldErrors[`industry_${index}_gif`];
      });

      setFieldErrors(newFieldErrors);
    }
  };

  return (
    <>
      <div>
        <Modal show={show} onHidden={onClose} size="modal-lg">
          {({ dismiss }) => (
            <>
              <ModalHeader>
                <h2 className="font-medium text-base mr-auto">
                  {isCreateMode
                    ? currentPage === 1
                      ? "Create New Project"
                      : editTitle || "New Project Details"
                    : editTitle || "Edit Project Details"}
                </h2>
                <button type="button" className="btn-close" onClick={dismiss} aria-label="Close">
                  ×
                </button>
              </ModalHeader>
              <ModalBody className="grid grid-cols-12 gap-4 gap-y-3 max-h-[70vh] overflow-y-auto">
                {currentPage === 1 ? (
                  // Page 1
                  <div className="col-span-12 space-y-6" onClick={() => setShowKeywordSuggestions(false)}>
                    {/* Title */}

                    <div>
                      <label className="block text-sm font-bold mb-3">
                        Title: <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        className={`form-control ${fieldErrors?.title ? "border-danger" : ""}`}
                        value={editTitle}
                        onChange={(e) => {
                          setEditTitle(e.target.value);
                          if (fieldErrors?.title) {
                            setFieldErrors((prev) => ({ ...prev, title: "" }));
                          }
                        }}
                        placeholder="Enter project title"
                      />

                      {fieldErrors?.title && <p className="text-red-500 text-sm mt-1">{fieldErrors?.title}</p>}
                    </div>

                    {/* Industries */}

                    <div>
                      <div className="relative industries-dropdown">
                        <label className="block text-sm font-bold mb-3">
                          Industries: <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <button
                            type="button"
                            className="form-select text-left flex justify-between items-center"
                            style={{ border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsDropdownOpen(!isDropdownOpen);
                            }}
                          >
                            <div className="flex flex-nowrap gap-2 flex-1 overflow-hidden">
                              {editIndustries?.length > 0 ? (
                                <>
                                  {editIndustries?.slice(0, 2).map((industry, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium text-white whitespace-nowrap"
                                      style={{ backgroundColor: "#2C4685", minWidth: "fit-content" }}
                                    >
                                      {industry?.name}

                                      <button
                                        type="button"
                                        className="ml-1 text-white hover:text-gray-200"
                                        onClick={(e) => {
                                          e.stopPropagation();

                                          const updatedIndustries = editIndustries?.filter((_, i) => i !== index);
                                          const removedIndustry = editIndustries?.[index];

                                          setEditIndustries(updatedIndustries);

                                          // Clear primary industry if it was the one being removed
                                          if (editPrimaryIndustry === removedIndustry?.name) {
                                            setEditPrimaryIndustry("");
                                          }
                                        }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}

                                  {editIndustries?.length > 2 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                      +{editIndustries?.length - 2} more
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-gray-700">Select Industries</span>
                              )}
                            </div>

                            <span
                              className={`transform transition-transform duration-200 ml-2 ${
                                isDropdownOpen ? "rotate-180" : ""
                              }`}
                            >
                              ▼
                            </span>
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                              <div className="flex items-center py-3 px-4 border-b border-gray-200 bg-gray-50">
                                <input
                                  type="text"
                                  className="form-control flex-1"
                                  value={newIndustryName}
                                  onChange={(e) => setNewIndustryName(e.target.value)}
                                  onKeyPress={async (e) => {
                                    if (e.key === "Enter" && newIndustryName?.trim()) {
                                      const trimmedName = newIndustryName?.trim();

                                      if (availableIndustries?.includes(trimmedName)) {
                                        alert("This industry already exists");

                                        return;
                                      }

                                      try {
                                        const addResult = await addGlobalIndustry(trimmedName);

                                        if (addResult?.success) {
                                          const newAvailable = [...availableIndustries, trimmedName];

                                          setAvailableIndustries(newAvailable);

                                          const newSelected = [
                                            ...editIndustries,
                                            {
                                              name: trimmedName,
                                              description: "",
                                              problemStatement: "",
                                              solution: "",
                                              marketingLine: "",
                                              gif: null,
                                            },
                                          ];

                                          setEditIndustries(newSelected);

                                          if (onIndustryAdded) onIndustryAdded(trimmedName);

                                          setNewIndustryName("");
                                        } else {
                                          alert("Failed to add industry: " + (addResult?.error || "Unknown error"));
                                        }
                                      } catch (error) {
                                        alert("Error adding industry: " + (error?.message || "Unknown error"));
                                      }
                                    }
                                  }}
                                  placeholder="Add New Industry"
                                />
                              </div>

                              {availableIndustries
                                .filter(
                                  (industry) =>
                                    newIndustryName === "" ||
                                    industry?.toLowerCase().includes(newIndustryName?.toLowerCase())
                                )
                                .map((industry) => {
                                  const isSelected =
                                    industry === "All"
                                      ? editIndustries?.length === availableIndustries?.length - 1
                                      : editIndustries?.some?.((ind) => ind?.name === industry);

                                  return (
                                    <div
                                      key={industry}
                                      className="flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (industry === "All") {
                                          if (editIndustries?.length === availableIndustries?.length - 1) {
                                            setEditIndustries([]);
                                          } else {
                                            const allIndustries = availableIndustries
                                              ?.filter((ind) => ind !== "All")
                                              ?.map((ind) => ({
                                                name: ind,
                                                description: "",
                                                problemStatement: "",
                                                solution: "",
                                                marketingLine: "",
                                                gif: null,
                                              }));
                                            setEditIndustries(allIndustries);
                                            if (!editPrimaryIndustry && allIndustries?.length > 0) {
                                              setEditPrimaryIndustry(allIndustries?.[0]?.name);
                                            }
                                          }
                                        } else {
                                          const isCurrentlySelected = editIndustries?.some?.(
                                            (ind) => ind?.name === industry
                                          );
                                          if (isCurrentlySelected) {
                                            const updatedIndustries = editIndustries?.filter?.(
                                              (ind) => ind?.name !== industry
                                            );
                                            setEditIndustries(updatedIndustries);
                                            if (editPrimaryIndustry === industry) {
                                              setEditPrimaryIndustry(
                                                updatedIndustries?.length > 0 ? updatedIndustries?.[0]?.name : ""
                                              );
                                            }
                                          } else {
                                            const newIndustries = [
                                              ...editIndustries,
                                              {
                                                name: industry,
                                                description: "",
                                                problemStatement: "",
                                                solution: "",
                                                marketingLine: "",
                                                gif: null,
                                              },
                                            ];
                                            setEditIndustries(newIndustries);
                                            if (!editPrimaryIndustry) {
                                              setEditPrimaryIndustry(industry);
                                            }
                                          }
                                        }
                                        if (fieldErrors?.industries) {
                                          setFieldErrors((prev) => ({ ...prev, industries: "" }));
                                        }
                                      }}
                                    >
                                      <div
                                        className="w-4 h-4 border-2 rounded flex items-center justify-center mr-3"
                                        style={{
                                          backgroundColor: isSelected ? "rgb(44, 70, 133)" : "white",
                                          borderColor: isSelected ? "rgb(44, 70, 133)" : "#d1d5db",
                                        }}
                                      >
                                        {isSelected && (
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                      <span className="text-sm text-gray-700">{industry}</span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>

                        {fieldErrors?.industries && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors?.industries}</p>
                        )}
                      </div>
                    </div>

                    {/* Primary Industry */}
                    <div>
                      <div className="relative primary-industry-dropdown">
                        <label className="block text-sm font-bold mb-3">
                          Primary Industry: <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <button
                            type="button"
                            className="form-select text-left flex justify-between items-center"
                            style={{ border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                            onClick={() => setIsPrimaryIndustryDropdownOpen(!isPrimaryIndustryDropdownOpen)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">
                                {editPrimaryIndustry || "Select Primary Industry"}
                              </span>
                            </div>

                            <span
                              className={`transform transition-transform duration-200 ml-2 ${
                                isPrimaryIndustryDropdownOpen ? "rotate-180" : ""
                              }`}
                            >
                              ▼
                            </span>
                          </button>

                          {isPrimaryIndustryDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
                              {editIndustries?.map((industry, index) => (
                                <div
                                  key={index}
                                  className="flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                  onClick={() => {
                                    setEditPrimaryIndustry(industry?.name);
                                    setIsPrimaryIndustryDropdownOpen(false);
                                    if (fieldErrors?.primaryIndustry) {
                                      setFieldErrors((prev) => ({ ...prev, primaryIndustry: "" }));
                                    }
                                  }}
                                >
                                  <span className="text-sm text-gray-700">{industry?.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {fieldErrors?.primaryIndustry && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors?.primaryIndustry}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Select one industry as primary from your selected industries
                        </p>
                      </div>
                    </div>

                    {/* Status */}

                    <div>
                      <div className="relative status-dropdown">
                        <label className="block text-sm font-bold mb-3">Status:</label>

                        <div className="relative">
                          <button
                            type="button"
                            className="form-select text-left flex justify-between items-center"
                            style={{ border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">
                                {editProjectStatus === "completed" || editProjectStatus === "Completed"
                                  ? "Completed"
                                  : "InProgress"}
                              </span>
                            </div>

                            <span
                              className={`transform transition-transform duration-200 ml-2 ${
                                isStatusDropdownOpen ? "rotate-180" : ""
                              }`}
                            >
                              ▼
                            </span>
                          </button>

                          {isStatusDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <div
                                className="flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                                onClick={() => {
                                  setEditProjectStatus("inprogress");

                                  setIsStatusDropdownOpen(false);

                                  if (fieldErrors?.status) {
                                    setFieldErrors((prev) => ({ ...prev, status: "" }));
                                  }
                                }}
                              >
                                <div
                                  className="w-5 h-5 border-2 rounded-md flex items-center justify-center mr-3"
                                  style={{
                                    backgroundColor:
                                      editProjectStatus === "inprogress" || editProjectStatus === "InProgress"
                                        ? "#2C4685"
                                        : "white",

                                    borderColor:
                                      editProjectStatus === "inprogress" || editProjectStatus === "InProgress"
                                        ? "#2C4685"
                                        : "#d1d5db",
                                  }}
                                >
                                  {(editProjectStatus === "inprogress" || editProjectStatus === "InProgress") && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>

                                <span className="text-sm text-gray-700">InProgress</span>
                              </div>

                              <div
                                className="flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                  setEditProjectStatus("completed");

                                  setIsStatusDropdownOpen(false);

                                  if (fieldErrors.status) {
                                    setFieldErrors((prev) => ({ ...prev, status: "" }));
                                  }
                                }}
                              >
                                <div
                                  className="w-5 h-5 border-2 rounded-md flex items-center justify-center mr-3"
                                  style={{
                                    backgroundColor:
                                      editProjectStatus === "completed" || editProjectStatus === "Completed"
                                        ? "#2C4685"
                                        : "white",

                                    borderColor:
                                      editProjectStatus === "completed" || editProjectStatus === "Completed"
                                        ? "#2C4685"
                                        : "#d1d5db",
                                  }}
                                >
                                  {(editProjectStatus === "completed" || editProjectStatus === "Completed") && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>

                                <span className="text-sm text-gray-700">Completed</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {fieldErrors?.status && <p className="text-red-500 text-sm mt-1">{fieldErrors?.status}</p>}
                      </div>
                    </div>

                    {/* Deploy Infrastructure */}

                    <div>
                      <label className="block text-sm font-bold mb-3">Deploy Infrastructure:</label>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="deploy-true"
                            name="deploy-infra"
                            className="w-4 h-4 text-blue-900 border-gray-300 focus:ring-blue-800"
                            checked={editDeployInfra === true}
                            onChange={() => setEditDeployInfra(true)}
                          />

                          <label htmlFor="deploy-true" className="ml-2 text-sm text-gray-700">
                            TRUE
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="deploy-false"
                            name="deploy-infra"
                            className="w-4 h-4 text-blue-900 border-gray-300 focus:ring-blue-900"
                            checked={editDeployInfra === false}
                            onChange={() => setEditDeployInfra(false)}
                          />

                          <label htmlFor="deploy-false" className="ml-2 text-sm text-gray-700">
                            FALSE
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Preview Images */}

                    <div>
                      <label className="block text-sm font-bold mb-3">Preview Images:</label>

                      {/* Current Images from S3 */}

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            Current Images ({currentImages?.length}/5):
                          </h4>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {/* Current images */}

                          {currentImages?.map?.((imageUrl, idx) => (
                            <div key={`existing-${idx}`} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Current image ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setEnlargedImage(imageUrl)}
                                onError={(e) => {
                                  e.target.src = "/dashboard/images/GenAIDashboard.png";
                                }}
                              />

                              <button
                                onClick={() => {
                                  // Only remove from local state, don't call API until save

                                  setCurrentImages((prev) => prev?.filter((img) => img !== imageUrl));
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                title="Delete image"
                              >
                                ×
                              </button>
                            </div>
                          ))}

                          {/* Pending images for both create and edit mode - only render on page 1 */}

                          {currentPage === 1 &&
                            pendingImages?.map?.((file, idx) => {
                              const fileKey = `${file?.name}-${file?.size}-${idx}`;
                              let imageUrl = blobUrls?.[fileKey];
                              if (!imageUrl && currentPage === 1) {
                                imageUrl = URL.createObjectURL(file);
                                setBlobUrls((prev) => ({ ...prev, [fileKey]: imageUrl }));
                              }

                              return (
                                <div key={fileKey} className="relative">
                                  <img
                                    src={imageUrl}
                                    alt={`Pending image ${idx + 1}`}
                                    className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setEnlargedImage(imageUrl)}
                                  />
                                  <button
                                    onClick={() => {
                                      URL.revokeObjectURL(imageUrl);
                                      setBlobUrls((prev) => {
                                        const newUrls = { ...prev };
                                        delete newUrls?.[fileKey];
                                        return newUrls;
                                      });
                                      setPendingImages((prev) => prev?.filter?.((_, i) => i !== idx));
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                    title="Remove image"
                                  >
                                    ×
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-b">
                                    Pending
                                  </div>
                                </div>
                              );
                            })}

                          {/* Upload button/zone - only show if under limit */}

                          {currentImages?.length + pendingImages?.length < 5 && (
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                id="upload-to-s3"
                                onChange={(e) => {
                                  if (uploadInProgress) return;

                                  const files = Array.from(e.target.files || []);
                                  if (files?.length === 0) return;

                                  const invalidFiles = files?.filter((file) => !file?.type?.startsWith?.("image/"));
                                  if (invalidFiles?.length > 0) {
                                    setErrorMessage(
                                      "Please select only valid image files (.jpg, .jpeg, .png, .gif, .webp)"
                                    );
                                    setShowErrorModal(true);
                                    e.target.value = "";
                                    return;
                                  }

                                  const totalImages = currentImages?.length + pendingImages?.length;
                                  if (totalImages + files?.length > 5) {
                                    setErrorMessage(`Maximum 5 images allowed. You can add ${5 - totalImages} more.`);
                                    setShowErrorModal(true);
                                    e.target.value = "";
                                    return;
                                  }

                                  setUploadInProgress(true);
                                  setPendingImages((prev) => [...prev, ...files]);
                                  setTimeout(() => setUploadInProgress(false), 500);
                                  e.target.value = "";
                                }}
                              />

                              <label
                                htmlFor="upload-to-s3"
                                className="cursor-pointer w-16 h-16 border-2 border-dashed border-blue-400 rounded flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <svg
                                  className="w-6 h-6 text-blue-400 hover:text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              </label>
                            </div>
                          )}
                        </div>

                        {currentImages?.length + pendingImages?.length < 4 && (
                          <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                            Warning: Minimum 4 images required
                          </p>
                        )}

                        {currentImages?.length + pendingImages?.length === 5 && (
                          <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                            Warning: Maximum limit reached (5/5 images). Delete an existing image to upload a new one.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Path */}

                    <div>
                      <label className="block text-sm font-bold mb-3">Path:</label>

                      <input
                        type="text"
                        className="form-control"
                        value={editPath || ""}
                        onChange={(e) => setEditPath(e.target.value)}
                        placeholder="Enter project path (e.g., /project-name or https://example.com)"
                      />
                    </div>

                    {/* Category */}

                    <div>
                      <div className="relative">
                        <label className="block text-sm font-bold mb-3">Category:</label>

                        <div className="relative">
                          <div className="w-full px-2 py-1 border-2 border-gray-200 hover:border-blue-300 rounded-lg text-left flex flex-wrap items-center gap-2 min-h-[44px] bg-gray-50 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
                            {(Array.isArray(editCategory) ? editCategory : [])?.map((category, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium text-white whitespace-nowrap"
                                style={{ backgroundColor: "#2C4685", minWidth: "fit-content" }}
                              >
                                {category}

                                <button
                                  type="button"
                                  className="ml-1 text-white hover:text-gray-200"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const updatedCategories = (Array.isArray(editCategory) ? editCategory : [])?.filter(
                                      (_, i) => i !== index
                                    );

                                    setEditCategory(updatedCategories);
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}

                            <input
                              type="text"
                              className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-sm"
                              style={{ border: "none", outline: "none", boxShadow: "none" }}
                              placeholder={
                                (Array.isArray(editCategory) ? editCategory : [])?.length > 0
                                  ? "Add another category..."
                                  : "Enter categories (e.g., Analytics, AI, Data)"
                              }
                              onFocus={() => setCategoryDuplicateError("")}
                              onChange={() => setCategoryDuplicateError("")}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();

                                  const category = e.target.value.trim();

                                  const currentCategories = Array.isArray(editCategory) ? editCategory : [];

                                  if (category) {
                                    if (
                                      currentCategories?.some(
                                        (cat) => cat?.toLowerCase?.() === category?.toLowerCase?.()
                                      )
                                    ) {
                                      setCategoryDuplicateError("This category already exists.");

                                      return;
                                    }

                                    setCategoryDuplicateError("");

                                    setEditCategory([...currentCategories, category]);

                                    e.target.value = "";
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const category = e.target.value.trim();

                                const currentCategories = Array.isArray(editCategory) ? editCategory : [];

                                if (category) {
                                  if (
                                    currentCategories?.some((cat) => cat?.toLowerCase() === category?.toLowerCase())
                                  ) {
                                    setCategoryDuplicateError("This category already exists.");

                                    e.target.value = "";

                                    return;
                                  }

                                  setCategoryDuplicateError("");

                                  setEditCategory([...currentCategories, category]);

                                  e.target.value = "";
                                }
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Press Enter to add category</p>
                        {categoryDuplicateError && (
                          <p className="text-red-500 text-sm mt-1">{categoryDuplicateError}</p>
                        )}
                      </div>
                    </div>

                    {/* Project Stakeholders */}

                    <div>
                      <div className="relative">
                        <label className="block text-sm font-bold mb-3">
                          Project Stakeholders: <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <div className="w-full px-2 py-1 border-2 border-gray-200 hover:border-blue-300 rounded-lg text-left flex flex-wrap items-center gap-2 min-h-[44px] bg-gray-50 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
                            {(editProjectStakeholders || [])?.map?.((stakeholder, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium text-white whitespace-nowrap"
                                style={{ backgroundColor: "#2C4685", minWidth: "fit-content" }}
                              >
                                {stakeholder}

                                <button
                                  type="button"
                                  className="ml-1 text-white hover:text-gray-200"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const updatedStakeholders = (editProjectStakeholders || [])?.filter(
                                      (_, i) => i !== index
                                    );

                                    setEditProjectStakeholders(updatedStakeholders);
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}

                            <input
                              type="email"
                              className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-sm focus:ring-0 focus:border-none focus:outline-none"
                              style={{ boxShadow: "none" }}
                              placeholder={
                                (editProjectStakeholders || [])?.length > 0
                                  ? "Add another stakeholder..."
                                  : "Enter project stakeholder email"
                              }
                              onFocus={() => {}}
                              onChange={() => {}}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  const email = e?.target?.value?.trim?.();
                                  if (email && !email?.endsWith("@cloudthat.com")) {
                                    setStakeholderDuplicateError("Email must be from @cloudthat.com domain");
                                    return;
                                  }
                                  if (email && (editProjectStakeholders || [])?.includes(email)) {
                                    setStakeholderDuplicateError("This stakeholder email already exists.");
                                    return;
                                  }
                                  if (email) {
                                    setStakeholderDuplicateError("");
                                    setEditProjectStakeholders([...(editProjectStakeholders || []), email]);
                                    e.target.value = "";
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const email = e?.target?.value?.trim?.();
                                if (email && !email?.endsWith("@cloudthat.com")) {
                                  setStakeholderDuplicateError("Email must be from @cloudthat.com domain");
                                  e.target.value = "";
                                  return;
                                }
                                if (email && (editProjectStakeholders || [])?.includes(email)) {
                                  setStakeholderDuplicateError("This stakeholder email already exists.");
                                  e.target.value = "";
                                  return;
                                }
                                if (email) {
                                  setStakeholderDuplicateError("");
                                  setEditProjectStakeholders([...(editProjectStakeholders || []), email]);
                                  e.target.value = "";
                                }
                              }}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">Press Enter to add email addresses</p>
                        {stakeholderDuplicateError && (
                          <p className="text-red-500 text-sm mt-1">{stakeholderDuplicateError}</p>
                        )}
                        {fieldErrors.stakeholders && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.stakeholders}</p>
                        )}
                      </div>
                    </div>

                    {/* Search Keywords */}
                    <div>
                      <div className="relative">
                        <label className="block text-sm font-bold mb-3">Search Keywords:</label>
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <div className="w-full px-2 py-1 border-2 border-gray-200 hover:border-blue-300 rounded-lg bg-gray-50 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
                            {/* Input field row */}
                            <input
                              type="text"
                              className="w-full bg-transparent border-none outline-none text-sm py-2"
                              style={{ border: "none", outline: "none", boxShadow: "none" }}
                              placeholder={
                                (Array.isArray(editKeywords) ? editKeywords : [])?.length > 0
                                  ? "Add another search keyword..."
                                  : "Add another search keyword..."
                              }
                              onFocus={() => setKeywordDuplicateError("")}
                              onChange={(e) => {
                                setKeywordDuplicateError("");
                                setKeywordTypoSuggestion("");
                                const input = e?.target?.value;

                                const suggestions = getKeywordSuggestions(input);
                                setKeywordSuggestions(suggestions);
                                setShowKeywordSuggestions(suggestions?.length > 0 && input?.length >= 1);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  setShowKeywordSuggestions(false);
                                  const keyword = e?.target?.value?.trim?.();
                                  const currentKeywords = Array.isArray(editKeywords) ? editKeywords : [];
                                  if (keyword) {
                                    // Check for duplicates
                                    if (currentKeywords?.some((kw) => kw?.toLowerCase() === keyword?.toLowerCase())) {
                                      setKeywordDuplicateError("This keyword already exists.");
                                      return;
                                    }

                                    setKeywordDuplicateError("");
                                    setKeywordTypoSuggestion("");
                                    setEditKeywords([...currentKeywords, keyword]);
                                    setShouldScrollToBottom(true);
                                    e.target.value = "";
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                setTimeout(() => {
                                  const keyword = e?.target?.value?.trim?.();
                                  const currentKeywords = Array.isArray(editKeywords) ? editKeywords : [];
                                  if (keyword) {
                                    // Check for duplicates
                                    if (currentKeywords?.some((kw) => kw?.toLowerCase() === keyword?.toLowerCase())) {
                                      setKeywordDuplicateError("This keyword already exists.");
                                      e.target.value = "";
                                      return;
                                    }

                                    // Check if keyword exists in database
                                    const exactMatch = availableKeywords?.find(
                                      (k) => k?.toLowerCase() === keyword?.toLowerCase()
                                    );
                                    if (!exactMatch) {
                                      // Check for typos only when complete keyword doesn't exist
                                      const typoSuggestions = findTypoSuggestions(keyword, availableKeywords);
                                      if (typoSuggestions?.length > 0) {
                                        setKeywordTypoSuggestion(`Did you mean "${typoSuggestions?.[0]}"?`);
                                        return;
                                      }
                                    }

                                    setKeywordDuplicateError("");
                                    setEditKeywords([...currentKeywords, keyword]);
                                    setShouldScrollToBottom(true);
                                    e.target.value = "";
                                  }
                                  setShowKeywordSuggestions(false);
                                }, 200);
                              }}
                            />
                            {/* Keywords tags row */}
                            {(Array.isArray(editKeywords) ? editKeywords : [])?.length > 0 && (
                              <div
                                ref={(el) => {
                                  if (el && shouldScrollToBottom) {
                                    setTimeout(() => {
                                      el.scrollTop = el?.scrollHeight;
                                      setShouldScrollToBottom(false);
                                    }, 0);
                                  }
                                }}
                                className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 max-h-20 overflow-y-auto"
                                style={{ scrollbarWidth: "thin", scrollbarColor: "#9ca3af #e5e7eb" }}
                              >
                                {(Array.isArray(editKeywords) ? editKeywords : [])?.map((keyword, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium text-gray-700 whitespace-nowrap border"
                                    style={{
                                      backgroundColor: "#E2E8F0",
                                      borderColor: "#CBD5E0",
                                      minWidth: "fit-content",
                                    }}
                                  >
                                    {keyword}
                                    <button
                                      type="button"
                                      className="ml-1 text-gray-500 hover:text-gray-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedKeywords = (
                                          Array.isArray(editKeywords) ? editKeywords : []
                                        )?.filter((_, i) => i !== index);
                                        setEditKeywords(updatedKeywords);
                                      }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Keyword Suggestions Dropdown */}
                          {showKeywordSuggestions && keywordSuggestions?.length > 0 && (
                            <div
                              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {keywordSuggestions?.map((keyword, index) => (
                                <div
                                  key={index}
                                  className="px-3 py-2 text-sm border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    const currentKeywords = Array.isArray(editKeywords) ? editKeywords : [];
                                    setEditKeywords([...currentKeywords, keyword]);
                                    setShouldScrollToBottom(true);
                                    setShowKeywordSuggestions(false);
                                    setKeywordTypoSuggestion("");
                                    // Clear the input
                                    const input = e?.target?.closest(".relative")?.querySelector("input");
                                    if (input) input.value = "";
                                  }}
                                >
                                  {keyword}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Press Enter to add search keywords for search filtering
                        </p>
                        {keywordDuplicateError && <p className="text-red-500 text-sm mt-1">{keywordDuplicateError}</p>}
                      </div>
                    </div>

                    {/* YouTube Video Link */}

                    <div>
                      <label className="block text-sm font-bold mb-3">YouTube Video Link:</label>

                      <input
                        type="url"
                        className="form-control"
                        value={editYouTubeVideoLink || ""}
                        onChange={(e) => setEditYouTubeVideoLink(e.target.value)}
                        placeholder="Enter YouTube video URL"
                      />
                    </div>
                  </div>
                ) : (
                  // Page 2
                  <div
                    className="col-span-12 space-y-6"
                    style={{ minHeight: "460px" }}
                    onClick={() => setShowKeywordSuggestions(false)}
                  >
                    {/* Validation Error Message */}
                    {validationError && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {validationError}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold mb-3">Selected Industries:</label>

                      {editIndustries?.length > 0 ? (
                        <div className="space-y-4">
                          {editIndustries?.map((industry, index) => {
                            const isExpanded = expandedIndustries?.has(index);

                            return (
                              <div key={index} className="border border-gray-300 rounded-md bg-white">
                                <div
                                  className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                  onClick={() => {
                                    const newExpanded = new Set(expandedIndustries);

                                    if (isExpanded) {
                                      newExpanded.delete(index);
                                    } else {
                                      newExpanded.add(index);
                                    }

                                    setExpandedIndustries(newExpanded);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        className={`w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 ${
                                          industry.name === editPrimaryIndustry ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                        checked={selectedIndustriesForDelete?.has(index)}
                                        disabled={industry?.name === editPrimaryIndustry}
                                        onChange={(e) => {
                                          const newSelected = new Set(selectedIndustriesForDelete);

                                          if (e.target.checked) {
                                            newSelected.add(index);
                                          } else {
                                            newSelected.delete(index);
                                          }

                                          setSelectedIndustriesForDelete(newSelected);
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                      />
                                      {industry?.name === editPrimaryIndustry && (
                                        <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                          Primary industry can't be deleted
                                        </div>
                                      )}
                                    </div>

                                    <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                      {industry?.name}
                                      {industry?.name === editPrimaryIndustry && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                          Primary
                                        </span>
                                      )}
                                    </h3>

                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        industry?.description &&
                                        industry?.problemStatement &&
                                        industry?.solution &&
                                        industry?.marketingLine
                                          ? "bg-green-400"
                                          : "bg-gray-300"
                                      }`}
                                      title={
                                        industry?.description &&
                                        industry?.problemStatement &&
                                        industry?.solution &&
                                        industry?.marketingLine
                                          ? "Complete"
                                          : "Incomplete"
                                      }
                                    ></span>
                                  </div>

                                  <span
                                    className={`transform transition-transform duration-200 cursor-pointer ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                    onClick={() => {
                                      const newExpanded = new Set(expandedIndustries);

                                      if (isExpanded) {
                                        newExpanded.delete(index);
                                      } else {
                                        newExpanded.add(index);
                                      }

                                      setExpandedIndustries(newExpanded);
                                    }}
                                  >
                                    ▼
                                  </span>
                                </div>

                                {isExpanded && (
                                  <div className="px-4 pb-4 space-y-2 border-t border-gray-200">
                                    <div className="mt-2">
                                      <label className="block text-sm font-bold mb-2">
                                        Project Description: <span className="text-red-500">*</span>
                                      </label>

                                      <textarea
                                        className={`form-control resize-none ${
                                          fieldErrors[`industry_${index}_description`] ? "border-danger" : ""
                                        }`}
                                        style={{ height: "100px" }}
                                        value={industry?.description || ""}
                                        onChange={(e) => {
                                          const updatedIndustries = [...editIndustries];
                                          updatedIndustries[index].description = e.target.value;
                                          setEditIndustries(updatedIndustries);
                                          // Clear field error
                                          if (fieldErrors?.[`industry_${index}_description`]) {
                                            setFieldErrors((prev) => ({
                                              ...prev,
                                              [`industry_${index}_description`]: "",
                                            }));
                                          }
                                          // Track modified industry
                                          if (setModifiedIndustries && !isCreateMode) {
                                            setModifiedIndustries((prev) => new Set([...prev, index]));
                                          }
                                        }}
                                        placeholder="Enter project description for this industry"
                                      />

                                      {fieldErrors?.[`industry_${index}_description`] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {fieldErrors?.[`industry_${index}_description`]}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-sm font-bold mb-2">Industry Description:</label>
                                      <textarea
                                        className="form-control resize-none"
                                        style={{ height: "80px" }}
                                        value={industry?.industryDescription || ""}
                                        onChange={(e) => {
                                          const updatedIndustries = [...editIndustries];
                                          updatedIndustries[index].industryDescription = e.target.value;
                                          setEditIndustries(updatedIndustries);
                                          // Track modified industry
                                          if (setModifiedIndustries && !isCreateMode) {
                                            setModifiedIndustries((prev) => new Set([...prev, index]));
                                          }
                                        }}
                                        placeholder="Enter industry-specific description"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-bold mb-2">
                                        Problem Statement: <span className="text-red-500">*</span>
                                      </label>

                                      <textarea
                                        className={`form-control resize-none ${
                                          fieldErrors[`industry_${index}_problemStatement`] ? "border-danger" : ""
                                        }`}
                                        style={{ height: "100px" }}
                                        value={industry?.problemStatement}
                                        onChange={(e) => {
                                          const updatedIndustries = [...editIndustries];
                                          updatedIndustries[index].problemStatement = e.target.value;
                                          setEditIndustries(updatedIndustries);
                                          // Clear field error
                                          if (fieldErrors?.[`industry_${index}_problemStatement`]) {
                                            setFieldErrors((prev) => ({
                                              ...prev,
                                              [`industry_${index}_problemStatement`]: "",
                                            }));
                                          }
                                          // Track modified industry
                                          if (setModifiedIndustries && !isCreateMode) {
                                            setModifiedIndustries((prev) => new Set([...prev, index]));
                                          }
                                        }}
                                        placeholder="Describe the key challenges this industry faces"
                                      />

                                      {fieldErrors?.[`industry_${index}_problemStatement`] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {fieldErrors?.[`industry_${index}_problemStatement`]}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-sm font-bold mb-2">
                                        Solution: <span className="text-red-500">*</span>
                                      </label>

                                      <textarea
                                        className={`form-control resize-none ${
                                          fieldErrors?.[`industry_${index}_solution`] ? "border-danger" : ""
                                        }`}
                                        style={{ height: "100px" }}
                                        value={industry?.solution}
                                        onChange={(e) => {
                                          const updatedIndustries = [...editIndustries];
                                          updatedIndustries[index].solution = e.target.value;
                                          setEditIndustries(updatedIndustries);
                                          // Clear field error
                                          if (fieldErrors?.[`industry_${index}_solution`]) {
                                            setFieldErrors((prev) => ({ ...prev, [`industry_${index}_solution`]: "" }));
                                          }
                                          // Track modified industry
                                          if (setModifiedIndustries && !isCreateMode) {
                                            setModifiedIndustries((prev) => new Set([...prev, index]));
                                          }
                                        }}
                                        placeholder="Explain how your project addresses the problem"
                                      />

                                      {fieldErrors?.[`industry_${index}_solution`] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {fieldErrors?.[`industry_${index}_solution`]}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <div>
                                        <label className="block text-sm font-bold mb-2">
                                          Marketing Line: <span className="text-red-500">*</span>
                                        </label>

                                        <textarea
                                          className={`form-control resize-none ${
                                            fieldErrors?.[`industry_${index}_marketingLine`] ? "border-danger" : ""
                                          }`}
                                          style={{ height: "80px" }}
                                          value={industry?.marketingLine || ""}
                                          onChange={(e) => {
                                            const words = e.target.value
                                              .trim()
                                              .split(/\s+/)
                                              .filter((word) => word?.length > 0);
                                            if (words.length <= 50) {
                                              const updatedIndustries = [...editIndustries];
                                              updatedIndustries[index].marketingLine = e.target.value;
                                              setEditIndustries(updatedIndustries);
                                              // Clear field error
                                              if (fieldErrors?.[`industry_${index}_marketingLine`]) {
                                                setFieldErrors((prev) => ({
                                                  ...prev,
                                                  [`industry_${index}_marketingLine`]: "",
                                                }));
                                              }
                                              // Track modified industry
                                              if (setModifiedIndustries && !isCreateMode) {
                                                setModifiedIndustries((prev) => new Set([...prev, index]));
                                              }
                                            }
                                          }}
                                          placeholder="Enter marketing line for this industry (max 50 words)"
                                        />

                                        <div className="text-xs text-gray-500 mt-1">
                                          {industry?.marketingLine
                                            ? industry?.marketingLine
                                                .trim()
                                                .split(/\s+/)
                                                .filter((word) => word.length > 0).length
                                            : 0}
                                          /50 words
                                        </div>

                                        {fieldErrors?.[`industry_${index}_marketingLine`] && (
                                          <p className="text-red-500 text-sm mt-1">
                                            {fieldErrors?.[`industry_${index}_marketingLine`]}
                                          </p>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-sm font-bold mb-2 whitespace-nowrap">
                                          Add GIF: <span className="text-red-500">*</span>
                                        </label>

                                        {industry?.gif ? (
                                          <div className="space-y-2">
                                            <div className="flex items-center text-green-600">
                                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>

                                              <span className="text-xs font-medium">GIF Added Successfully! (1/1)</span>
                                            </div>

                                            <div className="relative inline-block">
                                              <img
                                                src={
                                                  typeof industry.gif === "string"
                                                    ? industry.gif
                                                    : URL.createObjectURL(industry?.gif)
                                                }
                                                alt="Selected GIF"
                                                className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() =>
                                                  setEnlargedImage(
                                                    typeof industry.gif === "string"
                                                      ? industry.gif
                                                      : URL.createObjectURL(industry?.gif)
                                                  )
                                                }
                                              />

                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();

                                                  const normalizedTitle = editTitle?.replace(/[^a-zA-Z0-9]/g, "_");

                                                  const normalizedIndustry = industry?.name?.replace(
                                                    /[^a-zA-Z0-9]/g,
                                                    "_"
                                                  );

                                                  const storageKey = `gif_${normalizedTitle}_${normalizedIndustry}`;

                                                  localStorage.removeItem(storageKey);

                                                  const updatedIndustries = [...editIndustries];

                                                  updatedIndustries[index].gif = null;

                                                  setEditIndustries(updatedIndustries);
                                                }}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                                title="Delete GIF"
                                              >
                                                ×
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="relative">
                                            <input
                                              type="file"
                                              accept=".gif,.mp4,video/mp4,image/gif"
                                              className="hidden"
                                              id={`gif-upload-${index}`}
                                              onChange={async (e) => {
                                                const file = e.target.files[0];

                                                if (!file) return;

                                                // Check if industry already has a GIF

                                                if (industry?.gif) {
                                                  // alert(
                                                  //   "This industry already has a GIF! Only 1 GIF is allowed per industry. Please delete the existing GIF first."
                                                  // );

                                                  e.target.value = "";

                                                  return;
                                                }

                                                if (file?.type === "image/gif" || file?.type === "video/mp4") {
                                                  // Check if this is a new industry (index >= original industries count)

                                                  const originalIndustriesCount =
                                                    selectedRowData?.industries?.length || 0;

                                                  const isNewIndustry = index >= originalIndustriesCount;

                                                  if (isCreateMode || isNewIndustry) {
                                                    // Store for upload after project creation or after new industry is saved

                                                    setPendingGifs((prev) => ({ ...prev, [index]: file }));

                                                    // Update local state for preview

                                                    const localUrl = URL.createObjectURL(file);

                                                    const updatedIndustries = [...editIndustries];

                                                    updatedIndustries[index].gif = localUrl;

                                                    setEditIndustries(updatedIndustries);

                                                    // Clear field error

                                                    if (fieldErrors?.[`industry_${index}_gif`]) {
                                                      setFieldErrors((prev) => ({
                                                        ...prev,
                                                        [`industry_${index}_gif`]: "",
                                                      }));
                                                    }
                                                  } else {
                                                    // Store for upload when save is clicked

                                                    setPendingGifs((prev) => ({ ...prev, [index]: file }));

                                                    // Update local state for preview

                                                    const localUrl = URL.createObjectURL(file);

                                                    const updatedIndustries = [...editIndustries];

                                                    updatedIndustries[index].gif = localUrl;

                                                    setEditIndustries(updatedIndustries);

                                                    // Clear field error

                                                    if (fieldErrors?.[`industry_${index}_gif`]) {
                                                      setFieldErrors((prev) => ({
                                                        ...prev,
                                                        [`industry_${index}_gif`]: "",
                                                      }));
                                                    }
                                                  }
                                                } else {
                                                  // alert("Please select a valid GIF or MP4 file");
                                                }

                                                e.target.value = "";
                                              }}
                                            />

                                            <label
                                              htmlFor={`gif-upload-${index}`}
                                              className={`cursor-pointer w-16 h-16 border-2 border-dashed rounded flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-colors ${
                                                fieldErrors[`industry_${index}_gif`]
                                                  ? "border-red-500"
                                                  : "border-blue-400"
                                              }`}
                                            >
                                              <svg
                                                className="w-6 h-6 text-blue-400 hover:text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                />
                                              </svg>
                                            </label>
                                          </div>
                                        )}

                                        {fieldErrors?.[`industry_${index}_gif`] && (
                                          <p className="text-red-500 text-sm mt-1">
                                            {fieldErrors?.[`industry_${index}_gif`]}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No industries selected. Please go back to page 1 to add industries.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                {currentPage === 1 ? (
                  <div className="flex justify-end w-full">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (validatePage1Fields()) {
                          setCurrentPage(2);
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0 w-full">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setValidationError("");
                        setCurrentPage(1);
                      }}
                    >
                      Previous
                    </button>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                      <button
                        type="button"
                        className={`btn ${
                          selectedIndustriesForDelete?.size === 0
                            ? "btn-secondary opacity-50 cursor-not-allowed"
                            : "btn-danger"
                        } flex items-center justify-center`}
                        disabled={selectedIndustriesForDelete?.size === 0}
                        onClick={() => {
                          handleDeleteSelectedIndustries();
                        }}
                      >
                        <Lucide icon="Trash2" className="w-4 h-4 mr-2" />
                        Delete Selected
                        {selectedIndustriesForDelete?.size > 0 ? ` (${selectedIndustriesForDelete?.size})` : ""}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-primary ${isSaveButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isSaveButtonDisabled}
                        onClick={() => {
                          if (isCreateMode) {
                            if (validateMandatoryFields()) {
                              handleCreateProject();
                            } else {
                              const totalImages = currentImages?.length + pendingImages?.length;
                              if (totalImages < 4) {
                                setValidationError(
                                  "You haven't added the required number of images. Please add at least 4 images."
                                );
                              } else {
                                setValidationError("Please fill all mandatory fields before creating the project.");
                              }
                            }
                          } else {
                            handleSaveClick(currentImages, pendingImages, pendingGifs);
                          }
                        }}
                      >
                        {isCreateMode ? "Create Project" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}
              </ModalFooter>
            </>
          )}
        </Modal>
      </div>

      {/* Image Enlargement Modal */}
      <Modal show={!!enlargedImage} onHidden={() => setEnlargedImage(null)} size="xl">
        <ModalBody className="p-0">
          <div className="relative">
            <img src={enlargedImage} alt="Enlarged" className="w-full h-auto max-h-[80vh] object-contain" />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black bg-opacity-60 text-white border-0 cursor-pointer text-xl hover:bg-opacity-80 transition-colors"
            >
              ×
            </button>
          </div>
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirmModal} onHidden={() => setShowDeleteConfirmModal(false)}>
        <ModalHeader>
          <h2 className="font-medium text-base mr-auto">Confirm Deletion</h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600 text-center">
            Are you sure you want to delete {selectedIndustriesForDelete?.size} selected{" "}
            {selectedIndustriesForDelete?.size === 1 ? "industry" : "industries"}? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-secondary mr-2" onClick={() => setShowDeleteConfirmModal(false)}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              setShowDeleteConfirmModal(false);
              handleDeleteSelectedIndustries();
            }}
          >
            Delete
          </button>
        </ModalFooter>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Project has been created successfully!"
      />

      {/* Toast Notification */}
      {showToast && <Toast action="added" projectName={editTitle || "Project"} onClose={() => setShowToast(false)} />}

      {/* Error Modal */}
      <Modal show={showErrorModal} onHidden={() => setShowErrorModal(false)}>
        <ModalHeader>
          <h2 className="font-medium text-base mr-auto text-red-600">Error</h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600 text-center">{errorMessage}</p>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-primary" onClick={() => setShowErrorModal(false)}>
            OK
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default EditModal;
