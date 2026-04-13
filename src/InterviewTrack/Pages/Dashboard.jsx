import { LoadingIcon, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@/base-components";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lucide from "../../base-components/lucide";
import UserContext from "../../Context/UserContext";
import { isAdminAccess } from "../../utils/adminAuth";
import JD from "../PagesComponents/JD";
import MCQ from "../PagesComponents/MCQ";
import ResumeComparison from "../PagesComponents/ResumeComparision";
import UploadFile from "../PagesComponents/UploadFile";
import { fetchBulkFilePresignedUrl, fetchJobDescriptions, getHeaders, uploadFileToS3WithUrl } from "../utils/ApiCall";

function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [interviewPayload, setInterviewPayload] = useState(null);
  const [interviewResponse, setInterviewResponse] = useState(null);
  const { userDetails, userState } = useContext(UserContext);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [loadingInteview, setLoadingInterview] = useState(false);
  const [key, setKey] = useState(0);
  const [jobDescriptionSelected, setJobDescriptionSelected] = useState(null);
  const [processingCounts, setProcessingCounts] = useState(null);

  const [jdSearchTerm, setJdSearchTerm] = useState("");

  // Bulk Upload States
  const [bulkFiles, setBulkFiles] = useState([]);
  const [showProcessingButton, setShowProcessingButton] = useState(
    window.localStorage.getItem("interviewTrack_processButton") === "true" ?? false
  );

  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState({ uploaded: 0, total: 0 });
  const [bulkUploadedFiles, setBulkUploadedFiles] = useState(() => {
    const saved = window.localStorage.getItem("interviewTrack_uploadResults");
    return saved ? JSON.parse(saved) : [];
  });

  // Tab State
  const [activeTab, setActiveTab] = useState(() => {
    return parseInt(window?.localStorage?.getItem("interviewTrack_activeTab")) || 0;
  });
  // Add state for drag & drop
  const [isDragOver, setIsDragOver] = useState(false);
  // Job Description States

  const [selectedJDs, setSelectedJDs] = useState(() => {
    const saved = window.localStorage.getItem("interviewTrack_selectedJDs");
    return saved ? JSON.parse(saved) : [];
  });
  const [failedFiles, setFailedFiles] = useState([]);

  //   ref for auto scroll once upload results found
  const bulkUploadRef = useRef(null);

  const [isUploadResultsOpen, setIsUploadResultsOpen] = useState(false);

  const [jobDescriptionsOptions, setJobDescriptionOptions] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(() => {
    return localStorage.getItem("interviewTrack_processingStatus") || null;
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [excelDownloadUrl, setExcelDownloadUrl] = useState(() => {
    return localStorage.getItem("interviewTrack_excelDownloadUrl") || null;
  });
  const [currentFolderID, setCurrentFolderID] = useState(() => {
    return localStorage.getItem("interviewTrack_folderID") || null;
  });
  const [jdRefreshTrigger, setJdRefreshTrigger] = useState(0);

  const navigate = useNavigate();

  // Add this useEffect after your existing ones
  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
    window.localStorage.setItem("interviewTrack_activeTab", activeTab.toString());
  }, [activeTab]);
  useEffect(() => {
    window.localStorage.setItem("interviewTrack_selectedJDs", JSON.stringify(selectedJDs));
  }, [selectedJDs]);

  useEffect(() => {
    window.localStorage.setItem("interviewTrack_uploadResults", JSON.stringify(bulkUploadedFiles));
  }, [bulkUploadedFiles]);
  useEffect(() => {
    loadJobDescriptions();
  }, [jdRefreshTrigger]);

  useEffect(() => {
    if (currentFolderID) {
      window.localStorage.setItem("interviewTrack_folderID", currentFolderID);
    }
  }, [currentFolderID]);
  useEffect(() => {
    window.localStorage.setItem("interviewTrack_processButton", showProcessingButton?.toString());
  }, [showProcessingButton]);

  useEffect(() => {
    if (processingStatus) {
      localStorage.setItem("interviewTrack_processingStatus", processingStatus);
    } else {
      localStorage.removeItem("interviewTrack_processingStatus");
    }
  }, [processingStatus]);
  // Add useEffect to persist excelDownloadUrl
  useEffect(() => {
    if (excelDownloadUrl) {
      localStorage.setItem("interviewTrack_excelDownloadUrl", excelDownloadUrl);
    } else {
      localStorage.removeItem("interviewTrack_excelDownloadUrl");
    }
  }, [excelDownloadUrl]);
  const handleJDUpdated = () => {
    setJdRefreshTrigger((prev) => prev + 1);
  };

  const handleJDSelection = (value) => {
    setSelectedJDs((prev) => {
      if (prev.includes(value)) {
        return prev.filter((jd) => jd !== value);
      } else {
        if (prev?.length >= 3) {
          toast.warning("Maximum 3 Job Descriptions can be selected");
          return prev;
        }
        return [...prev, value];
      }
    });
  };
  // Add this useEffect after your existing useEffects
  useEffect(() => {
    if (processingStatus === "processing") {
      setTimeout(() => {
        bulkUploadRef.current?.scrollTo({
          top: bulkUploadRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100); // Small delay to ensure DOM is updated
    }
  }, [processingStatus]);

  //select all checkbox
  const handleSelectAll = () => {
    const allJDValues = filteredJDOptions?.map((jd) => jd.value);
    if (selectedJDs.length === allJDValues.length) {
      setSelectedJDs([]);
    } else {
      setSelectedJDs(allJDValues);
    }
  };
  // Filter JDs based on search term
  const filteredJDOptions = jobDescriptionsOptions?.filter((jd) =>
    jd?.label?.toLowerCase().includes(jdSearchTerm?.toLowerCase())
  );

  const isAllSelected =
    filteredJDOptions?.length > 0 && filteredJDOptions?.every((jd) => selectedJDs?.includes(jd.value));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // if (files.length > 10) {
    //   toast.error("Only 10 files are allowed at a time.");
    //   return;
    // }

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const newFiles = files.filter((file) => validTypes.includes(file.type));
    const duplicateFiles = newFiles.filter((file) =>
      selectedFiles.some((selectedFile) => selectedFile.name === file.name)
    );
    if (duplicateFiles.length > 0) {
      toast.error("This file has already been selected.");
      return;
    }
    if (newFiles.length !== files.length) {
      toast.error("Only PDF, DOC, and DOCX files are allowed!");
      return;
    }

    // if (selectedFiles.length + newFiles.length > 10) {
    //   toast.error("You can only upload up to 10 files in total.");
    //   return;
    // }

    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadedFileInfo([]);
    setKey((prevKey) => prevKey + 1);
  };

  const startInterview = useCallback((payload) => {
    setInterviewPayload(payload);
    setIsInterviewStarted(true);
  }, []);

  const handleJobDescriptionSelected = (selectedOption) => {
    setJobDescriptionSelected(selectedOption);
  };

  const isDisabled = isAdmin && !jobDescriptionSelected;
  // Bulk Upload Handler with Parallel Processing

  const handleTabChange = (index) => {
    setActiveTab(index);
  };
  useEffect(() => {
    if (userDetails?.attributes?.email) {
      isAdminAccess(userDetails?.attributes?.email, setIsAdmin);
    }
  }, []);

  const loadJobDescriptions = async () => {
    try {
      const data = await fetchJobDescriptions();
      if (data?.statusCode === 200) {
        const jobDescriptions = Object.keys(data["Profile Data"]) || [];
        if (jobDescriptions.length > 0) {
          const formattedOptions = jobDescriptions.map((profile) => ({
            value: profile,
            label: profile.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
          }));

          setJobDescriptionOptions(formattedOptions);
        }
      }
    } catch (error) {
      // setErrorMessage("Error loading job descriptions.");
    } finally {
      //setLoading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (selectedJDs?.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (selectedJDs?.length === 0) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  // Enhanced file change handler
  const handleBulkFileChange = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
    // Reset the input value to allow selecting the same files again if needed
    event.target.value = "";
  };

  // File processing function
  const processFiles = (files) => {
    // Clear previous session data when new files are selected
    if (processingStatus === "completed" || excelDownloadUrl) {
      setProcessingStatus(null);
      setExcelDownloadUrl(null);
      setShowProcessingButton(false);
      setBulkUploadedFiles([]);
      setCurrentFolderID(null);
      setProcessingCounts(null);
      setFailedFiles([]);

      // Clear localStorage
      window.localStorage.removeItem("interviewTrack_processingStatus");
      window.localStorage.removeItem("interviewTrack_excelDownloadUrl");
      window.localStorage.removeItem("interviewTrack_processButton");
      window.localStorage.removeItem("interviewTrack_uploadResults");
      window.localStorage.removeItem("interviewTrack_folderID");

      toast.info("Previous session cleared. Starting new upload.");
    }
    const validFiles = files.filter((file) => {
      const validTypes = [".pdf", ".doc", ".docx"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      return validTypes.includes(fileExtension);
    });

    if (validFiles.length !== files.length) {
      toast.warning(`${files.length - validFiles.length} files skipped. Only PDF, DOC, and DOCX files are allowed.`);
    }

    //setBulkFiles(validFiles);
    setBulkFiles((prevFiles) => {
      const existingNames = prevFiles?.map((f) => f.name);
      const newFiles = validFiles?.filter((file) => !existingNames.includes(file.name));

      if (newFiles.length < validFiles.length) {
        toast.info(`${validFiles.length - newFiles.length} duplicate files skipped.`);
      }

      return [...prevFiles, ...newFiles];
    });

    setBulkUploadedFiles([]);
  };

  const handleBulkUpload = async () => {
    if (selectedJDs?.length === 0) {
      toast.error("Please select at least one Job Description first!");
      return;
    }
    const userID = userDetails?.attributes?.email;

    if (bulkFiles?.length === 0) return;

    if (bulkFiles?.length < 2) {
      toast.warning(
        "Please select at least 2 resumes for bulk upload. For single resumes, use the standard upload tab."
      );
      return;
    }

    setIsBulkUploading(true);
    setBulkUploadProgress({ uploaded: 0, total: bulkFiles.length });
    setBulkUploadedFiles([]);

    try {
      // Generate folder ID with current timestamp
      const now = new Date();
      const folderID = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
      setCurrentFolderID(folderID); // Store folder ID

      const BATCH_SIZE = 3; // Process 3 files at a time
      const batches = [];

      // Split files into batches
      for (let i = 0; i < bulkFiles?.length; i += BATCH_SIZE) {
        batches.push(bulkFiles.slice(i, i + BATCH_SIZE));
      }

      let uploadedCount = 0;
      const allUploadedFiles = [];

      // Process each batch
      for (const batch of batches) {
        const uploadPromises = batch?.map(async (file) => {
          try {
            // Fetch presigned URL with bulk upload payload
            const presignedUrl = await fetchBulkFilePresignedUrl(file?.name, folderID, selectedJDs, userID);

            if (presignedUrl) {
              // Upload file to S3
              await uploadFileToS3WithUrl(presignedUrl, file);
              const fileLocation = presignedUrl.split("?")[0];
              return {
                name: file.name,
                url: fileLocation,
                status: "success",
                folderID: folderID,
              };
            }
          } catch (error) {
            return {
              name: file.name,
              status: "failed",
              error: error.message,
            };
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(uploadPromises);
        allUploadedFiles.push(...batchResults.filter(Boolean));
        uploadedCount += batch.length;

        // Update progress
        setBulkUploadProgress({ uploaded: uploadedCount, total: bulkFiles.length });
        setBulkUploadedFiles([...allUploadedFiles]);
      }

      // Show final results
      const successCount = allUploadedFiles.filter((f) => f.status === "success").length;
      const failCount = allUploadedFiles.filter((f) => f.status === "failed").length;

      toast.success(`Bulk upload completed! ${successCount} succeeded, ${failCount} failed. Folder ID: ${folderID}`);

      // Clear files after successful upload
      if (successCount > 0) {
        setShowProcessingButton(true);
        // setProcessingStatus("processing");
        setBulkFiles([]);
      }
    } catch (error) {
      toast.error(error.message || "Error during bulk upload.");
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!currentFolderID) return;

    setIsCheckingStatus(true);
    try {
      const payload = {
        type: "bulk_upload",
        user_id: userDetails?.attributes?.email,
        method: "get_processed_data",
        folderID: currentFolderID,
        jd_names_list: selectedJDs,
      };
      const Url = await fetch("https://cnp4204jii.execute-api.ap-south-1.amazonaws.com/dev/bulk-resume-upload", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((res) => res.json());

      if (Url?.errorMessage) {
        toast.warning("Something went wrong try again!");
        return;
      }

      if (Url?.statusCode === 200) {
        const failedResumes = Url?.failed_resumes || [];
        setFailedFiles(failedResumes);
        if (Url?.res) {
          setExcelDownloadUrl(Url?.res);
          setProcessingStatus("completed");
          setProcessingCounts(Url?.count || null);
          toast.success("Processing completed! Excel file is ready for download.");
        }
        // else {
        //   toast.info("Still processing... Please wait and try again.");
        // }
      } else if (Url?.statusCode === 400) {
        if (Url?.count) {
          setProcessingCounts(Url?.count);
          toast.info("Processing in progress...");
        } else {
          toast.info("Still processing... Please wait and try again.");
        }
        //toast.info("Still processing... Please wait and try again.");
      } else {
        toast.warning("Processing status check failed. Please try again.");
      }
    } catch (error) {
      toast.error("Error checking processing status.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Add this function to clear data when needed
  const clearPersistedData = () => {
    window.localStorage.removeItem("interviewTrack_uploadResults");
    window.localStorage.removeItem("interviewTrack_folderID");
    window.localStorage.removeItem("interviewTrack_processingStatus");
    window.localStorage.removeItem("interviewTrack_processButton");
    window.localStorage.removeItem("interviewTrack_selectedJDs");
    window.localStorage.removeItem("interviewTrack_excelDownloadUrl");

    setExcelDownloadUrl(null);
    setProcessingStatus(null);
    setProcessingCounts(null);
    setShowProcessingButton(false);
    setBulkUploadedFiles([]);
    setCurrentFolderID(null);
    setSelectedJDs([]);
    setFailedFiles([]);
  };

  // Update handleDownloadExcel to clear data after download
  const handleDownloadExcel = async () => {
    if (!excelDownloadUrl) return;

    try {
      const response = await fetch(excelDownloadUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bulk-upload-results-${currentFolderID}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Excel file downloaded successfully!");

      // Clear persisted data after successful download
      clearPersistedData();
      setProcessingStatus(null);
      setBulkUploadedFiles([]);
      setCurrentFolderID(null);
    } catch (error) {
      toast.error("Error downloading Excel file.");
    }
  };

  const handleStartProcessFiles = async () => {
    try {
      setProcessingStatus("processing");
      setShowProcessingButton(false); // Hide button once processing starts
      const payload = {
        type: "bulk_upload",
        user_id: userDetails?.attributes?.email,
        method: "bulk_process",
        folderID: currentFolderID,
        jd_names_list: selectedJDs,
      };
      const res = await fetch("https://cnp4204jii.execute-api.ap-south-1.amazonaws.com/dev/bulk-resume-upload", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((res) => res.json());

      if (res?.statusCode === 200 && res?.body) {
        const excelUrl = res?.body?.res?.res;
        const failedResumes = res?.body?.failed_resumes || [];
        setFailedFiles(failedResumes);
        if (excelUrl) {
          setExcelDownloadUrl(excelUrl);
          setProcessingStatus("completed");
          toast.success("Processing completed! Excel file is ready for download.");
        } else {
          toast.info("Still processing... Please wait and try again.");
        }
      } else if (res?.statusCode === 400) {
        toast.info("Processing started... Please wait and try refresh status.");
      }
      // else {
      //   toast.error("Error starting processing.");
      //   setShowProcessingButton(true); // Show button again on error
      //   setProcessingStatus(null);
      // }
    } catch (error) {}
  };

  const extractFileName = (fullPath) => {
    const keyIndex = fullPath?.indexOf("key__");
    if (keyIndex !== -1) {
      return fullPath?.substring(keyIndex + 5); // 5 is length of 'key__'
    }
    // Fallback: return just the filename if no 'key__' found
    return fullPath?.split("/").pop();
  };

  return (
    <>
      <>
        {!isInterviewStarted && (
          <div className="my-5 flex items-center justify-between">
            <div className="flex items-center ">
              <Lucide
                icon="ArrowLeftCircle"
                className="w-10 h-10 cursor-pointer my-5 mx-5"
                onClick={() => navigate("/")}
              />
              <h1 className=" text-2xl text-[#1a3b8b] font-bold ">HiRE</h1>
            </div>
            {isAdmin && <JD onJobDescriptionSelected={handleJobDescriptionSelected} onJDUpdated={handleJDUpdated} />}
          </div>
        )}

        <div className="w-full p-[20px] rounded-lg mx-auto">
          <TabGroup
            selectedIndex={activeTab}
            onChange={handleTabChange}
            className="col-span-12 intro-x box p-5  w-full sm:col-span-6 md:col-span-4 border-black border-opacity-10 border-t sm:border-t-0 border-l md:border-l-0 border-dashed -ml-4 md:ml-0 md:pl-0"
          >
            <TabList className="nav-link-tabs flex-col sm:flex-row justify-center lg:justify-start text-center">
              <Tab className="w-full py-1 text-base cursor-pointer">Standard Upload (Up to 10 files)</Tab>
              <Tab className="w-full py-1 text-base cursor-pointer">Bulk Upload (10+ files)</Tab>
            </TabList>
            <TabPanels className="mt-5">
              <TabPanel className="leading-relaxed">
                {activeTab === 0 && (
                  <div className="w-full mx-auto flex justify-center flex-col items-center">
                    {!isInterviewStarted ? (
                      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-auto">
                        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-start my-4">
                          <UploadFile
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                            isUploading={isUploading}
                            handleFileChange={handleFileChange}
                            setIsUploading={setIsUploading}
                            uploadedFileInfo={uploadedFileInfo}
                            setUploadedFileInfo={setUploadedFileInfo}
                            isProcessing={isProcessing}
                            setIsProcessing={setIsProcessing}
                            key={key}
                            isUploadComplete={isUploadComplete}
                            setIsUploadComplete={setIsUploadComplete}
                            isDisabled={isDisabled}
                          />

                          {uploadedFileInfo.length > 0 && (
                            <ResumeComparison
                              uploadedFileInfo={uploadedFileInfo}
                              setUploadedFileInfo={setUploadedFileInfo}
                              isProcessing={isProcessing}
                              setIsProcessing={setIsProcessing}
                              startInterview={startInterview}
                              setInterviewResponse={setInterviewResponse}
                              setSelectedFiles={setSelectedFiles}
                              isUploadComplete={isUploadComplete}
                              setLoadingInterview={setLoadingInterview}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <MCQ
                        loadingInteview={loadingInteview}
                        interviewPayload={interviewPayload}
                        interviewResponse={interviewResponse}
                      />
                    )}
                  </div>
                )}
              </TabPanel>
              <TabPanel className="leading-relaxed">
                {activeTab === 1 && (
                  <div className="w-full mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-auto">
                      <h1 className="font-sans font-semibold text-xl inline-flex items-center w-full mb-4">
                        <Lucide icon="CloudUpload" className="w-6 h-6 mr-2 text-primary" />
                        Bulk Upload Resumes
                      </h1>

                      <div className="flex gap-6 h-[600px]">
                        {/*  JD Sidebar with Search and Select All */}
                        <div className="w-1/3 bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col h-full">
                          <h2 className="font-medium text-gray-700 mb-3 inline-flex items-center flex-shrink-0">
                            <Lucide icon="FileText" className="w-5 h-5 mr-2" />
                            Select Job Descriptions ({selectedJDs?.length})
                          </h2>
                          {/* Add warning message */}
                          <div className="mb-3 flex-shrink-0">
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 flex items-center">
                              <Lucide icon="Info" className="w-3 h-3 mr-1 flex-shrink-0" />
                              Maximum 3 Job Descriptions can be selected
                            </div>
                          </div>

                          {/* Search Input */}
                          {/* Search Input */}
                          <div className="mb-3 flex-shrink-0">
                            <input
                              type="text"
                              placeholder="Search job descriptions..."
                              value={jdSearchTerm}
                              onChange={(e) => setJdSearchTerm(e.target.value)}
                              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          {/* Select All Option */}
                          {/* {filteredJDOptions?.length > 0 && (
                            <div
                              className="p-2 mb-2 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary hover:bg-blue-50 transition-all flex-shrink-0"
                              onClick={handleSelectAll}
                            >
                              <div className="flex items-center">
                                <div className="relative mr-3">
                                  <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                      isAllSelected ? "bg-primary border-primary" : "bg-transparent border-gray-400"
                                    }`}
                                  >
                                    {isAllSelected && <Lucide icon="Check" className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {isAllSelected ? "Deselect All" : "Select All"} ({filteredJDOptions?.length})
                                </span>
                              </div>
                            </div>
                          )} */}

                          {/* JD List */}
                          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-2 pr-2">
                            {filteredJDOptions?.map((jd, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  selectedJDs.includes(jd?.value)
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white border-gray-200 hover:border-primary hover:bg-blue-50"
                                }`}
                                onClick={() => handleJDSelection(jd?.value)}
                              >
                                <div className="flex items-center">
                                  <div className="relative mr-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedJDs?.includes(jd?.value)}
                                      onChange={() => handleJDSelection(jd?.value)}
                                      className="sr-only"
                                    />
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        selectedJDs.includes(jd?.value)
                                          ? "bg-white border-white"
                                          : "bg-transparent border-gray-400"
                                      }`}
                                    >
                                      {selectedJDs?.includes(jd?.value) && (
                                        <Lucide icon="Check" className="w-3 h-3 text-primary" />
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm font-medium">{jd?.label}</span>
                                </div>
                              </div>
                            ))}
                            {filteredJDOptions?.length === 0 && jdSearchTerm && (
                              <div className="text-sm text-gray-500 text-center py-4">
                                No job descriptions match "{jdSearchTerm}"
                              </div>
                            )}
                            {jobDescriptionsOptions?.length === 0 && (
                              <div className="text-sm text-gray-500 text-center py-4">
                                No Job Descriptions available
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Scrollable Upload Area */}
                        <div ref={bulkUploadRef} className="flex-1 flex flex-col h-full">
                          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pr-2">
                            <div className="space-y-4">
                              {/* File Selection Area */}
                              <div
                                className={`bg-gray-50 p-4 rounded-lg border-2 border-dashed transition-all ${
                                  isDragOver ? "border-primary bg-blue-50" : "border-gray-300"
                                } ${
                                  selectedJDs?.length === 0 || processingStatus === "processing"
                                    ? "opacity-50 pointer-events-none"
                                    : ""
                                }`}
                                onDragOver={processingStatus === "processing" ? undefined : handleDragOver}
                                onDragLeave={processingStatus === "processing" ? undefined : handleDragLeave}
                                onDrop={processingStatus === "processing" ? undefined : handleDrop}
                              >
                                <div className="text-center py-6">
                                  <Lucide icon="CloudUpload" className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                                  <h3 className="text-lg font-medium text-gray-700 mb-2">Drag & Drop Resume Files</h3>
                                  <p className="text-sm text-gray-500 mb-4">
                                    Drop multiple PDF, DOC, or DOCX files here, or click to browse
                                  </p>

                                  <label
                                    className={`btn btn-primary px-6 w-auto py-2 text-sm font-medium ${
                                      selectedJDs?.length === 0 || processingStatus === "processing"
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                    htmlFor={processingStatus === "processing" ? undefined : "bulkFileInput"}
                                  >
                                    <Lucide icon="FolderOpen" className="w-4 h-4 mr-2" />
                                    Browse Multiple Files
                                  </label>
                                </div>

                                <input
                                  type="file"
                                  id="bulkFileInput"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  onChange={handleBulkFileChange}
                                  disabled={
                                    isBulkUploading || selectedJDs?.length === 0 || processingStatus === "processing"
                                  }
                                  multiple
                                />

                                {/* Selected Files Display */}
                                {bulkFiles?.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                      {/* <p className="text-sm font-medium text-gray-700">
                                          Selected {bulkFiles?.length} file(s)
                                        </p> */}
                                      <div className="mt-2 text-sm">
                                        <span className={bulkFiles.length >= 2 ? "text-green-600" : "text-orange-600"}>
                                          {bulkFiles?.length} file{bulkFiles?.length !== 1 ? "s" : ""} selected
                                          {bulkFiles?.length < 2 && " (minimum 2 required)"}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => setBulkFiles([])}
                                        className={`text-xs hover:text-red-800 ${
                                          processingStatus === "processing"
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-red-600"
                                        }`}
                                        disabled={processingStatus === "processing"}
                                      >
                                        Clear All
                                      </button>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto bg-white p-3 rounded border">
                                      {bulkFiles?.map((file, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between text-xs text-gray-600 py-1"
                                        >
                                          <span>• {file?.name}</span>
                                          <span className="text-gray-400">
                                            {(file?.size / 1024 / 1024).toFixed(2)} MB
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Upload Button and Progress */}
                              <div className="space-y-3">
                                <button
                                  className={`btn px-6 py-3 text-sm font-medium flex items-center justify-center w-full ${
                                    bulkFiles?.length &&
                                    !isBulkUploading &&
                                    selectedJDs?.length > 0 &&
                                    bulkFiles?.length >= 2
                                      ? "btn-primary hover:bg-primary/90"
                                      : "btn-secondary cursor-not-allowed"
                                  }`}
                                  onClick={handleBulkUpload}
                                  disabled={
                                    !bulkFiles?.length ||
                                    isBulkUploading ||
                                    selectedJDs?.length === 0 ||
                                    processingStatus === "processing" ||
                                    bulkFiles?.length < 2
                                  }
                                >
                                  {isBulkUploading ? (
                                    <>
                                      <LoadingIcon icon="spinning-circles" className="w-4 h-4 mr-2" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Lucide icon="CloudUpload" className="w-4 h-4 mr-2" />
                                      Upload {bulkFiles?.length} Files
                                    </>
                                  )}
                                </button>

                                {/* Progress Bar */}
                                {isBulkUploading && bulkUploadProgress?.total > 0 && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${(bulkUploadProgress?.uploaded / bulkUploadProgress?.total) * 100}%`,
                                      }}
                                    ></div>
                                    <p className="text-xs text-gray-600 mt-1 text-center">
                                      {bulkUploadProgress?.uploaded} of {bulkUploadProgress?.total} files uploaded
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Upload Results with Accordion */}
                              {bulkUploadedFiles?.length > 0 && (
                                <div className="bg-gray-50 rounded-lg border border-gray-200">
                                  <button
                                    onClick={() => setIsUploadResultsOpen(!isUploadResultsOpen)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                                  >
                                    <h3 className="font-medium text-gray-700 flex items-center">
                                      <Lucide icon="FileCheck" className="w-4 h-4 mr-2" />
                                      Upload Results ({bulkUploadedFiles.length})
                                    </h3>
                                    <Lucide
                                      icon={isUploadResultsOpen ? "ChevronUp" : "ChevronDown"}
                                      className="w-4 h-4 text-gray-500"
                                    />
                                  </button>

                                  {isUploadResultsOpen && (
                                    <div className="px-4 pb-4">
                                      <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 bg-white rounded border p-3">
                                        {bulkUploadedFiles?.map((file, index) => (
                                          <div
                                            key={index}
                                            className={`text-xs py-2 px-2 flex items-center border-b border-gray-100 last:border-b-0 ${
                                              file?.status === "success" ? "text-green-600" : "text-red-600"
                                            }`}
                                          >
                                            <Lucide
                                              icon={file?.status === "success" ? "CheckCircle" : "XCircle"}
                                              className="w-3 h-3 mr-2 flex-shrink-0"
                                            />
                                            <span className="flex-1">
                                              {file?.name} -{" "}
                                              {file?.status === "success" ? "Success" : `Failed: ${file?.error}`}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* Start Processing Button  */}
                              {showProcessingButton && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                                  <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-blue-900 flex items-center text-base">
                                      <Lucide icon="CheckCircle2" className="w-5 h-5 mr-2 text-green-600" />
                                      Ready to Process
                                    </h3>
                                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                      {bulkUploadedFiles?.length}
                                      {bulkUploadedFiles?.length === 1 ? "file" : "files"}
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                                    Files uploaded successfully. Click below to start processing the resumes.
                                  </p>

                                  <button
                                    onClick={handleStartProcessFiles}
                                    className="w-full btn btn-primary px-6 py-3.5 text-sm font-semibold flex items-center justify-center rounded-lg hover:shadow-md transition-all duration-200 group"
                                  >
                                    <Lucide
                                      icon="Play"
                                      className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform"
                                    />
                                    Start Processing
                                  </button>
                                </div>
                              )}

                              {/* Processing Status */}
                              {processingStatus && (
                                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-base">
                                    <Lucide icon="Clock" className="w-5 h-5 mr-2 text-primary" />
                                    Processing Status
                                  </h3>

                                  {processingStatus === "processing" && (
                                    <div className="space-y-4">
                                      <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700">
                                        <LoadingIcon icon="spinning-circles" className="w-5 h-5 mr-3" />
                                        <div className="flex-1">
                                          <span className="text-sm">
                                            Processing uploaded resumes... This may take approximately 2–3 minutes.
                                          </span>
                                          {processingCounts && (
                                            <div className="mt-2">
                                              <div className="text-xs text-blue-600 mb-1">
                                                Progress: {processingCounts?.processed_resume} of{" "}
                                                {processingCounts?.resume_count} resumes processed
                                              </div>
                                              <div className="w-full bg-blue-200 rounded-full h-2">
                                                <div
                                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                  style={{
                                                    width: `${
                                                      (processingCounts?.processed_resume /
                                                        processingCounts?.resume_count) *
                                                      100
                                                    }%`,
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <button
                                        onClick={handleRefreshStatus}
                                        disabled={isCheckingStatus}
                                        className="btn btn-outline-primary w-fit px-5 py-2 text-sm flex items-center rounded-lg"
                                      >
                                        {isCheckingStatus ? (
                                          <>
                                            <LoadingIcon icon="spinning-circles" className="w-4 h-4 mr-2" />
                                            Checking...
                                          </>
                                        ) : (
                                          <>
                                            <Lucide icon="RefreshCw" className="w-4 h-4 mr-2" />
                                            Refresh Status
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}

                                  {processingStatus === "completed" && excelDownloadUrl && (
                                    <div className="space-y-4">
                                      <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">
                                        <Lucide icon="CheckCircle" className="w-5 h-5 mr-3" />
                                        <div className="flex-1">
                                          <span className="text-sm">Processing completed! Excel file is ready.</span>
                                          {processingCounts && (
                                            <div className="text-xs text-green-600 mt-1">
                                              {processingCounts?.processed_resume} of {processingCounts?.resume_count}{" "}
                                              resumes processed
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Add warning message */}
                                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                        <Lucide icon="AlertTriangle" className="w-3 h-3 inline mr-1" />
                                        Warning: Selecting new files will clear this download link and start a new
                                        session.
                                      </div>

                                      {failedFiles?.length > 0 && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                                          <h4 className="text-red-700 font-medium mb-2">
                                            Failed Files ({failedFiles?.length}):
                                          </h4>
                                          <div className="flex  flex-col text-sm text-red-600">
                                            {failedFiles?.map((fileName, index) => (
                                              <div key={index} className="flex items-start mb-2">
                                                {/* <Lucide icon="AlertCircle" className="w-4 h-4 mr-1" /> */}
                                                {index + 1}. {extractFileName(fileName)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <button
                                        onClick={handleDownloadExcel}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white 
         px-5 py-2.5 rounded-md text-sm font-medium shadow-sm 
         transition-all duration-200"
                                      >
                                        <Lucide icon="Download" className="w-4 h-4" />
                                        <span>Download Excel Report</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Warning Message */}
                              {/* Warning Message - Only show when trying to upload without JD selection */}
                              {selectedJDs?.length === 0 && !processingStatus && !excelDownloadUrl && (
                                <div className="text-sm text-amber-600 flex text-left items-center  bg-amber-50 p-3 rounded-lg border border-amber-200">
                                  <Lucide icon="AlertTriangle" className="w-4 h-4 inline mr-2" />
                                  Please select at least one Job Description from the sidebar before uploading resumes.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </>
      {/* )} */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default Dashboard;
