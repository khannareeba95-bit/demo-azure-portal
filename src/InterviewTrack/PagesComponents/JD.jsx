import { LoadingIcon } from "@/base-components";
import { useEffect, useState } from "react";
import Lucide from "../../base-components/lucide";
import { fetchJDPresignedUrl, fetchJobDescriptions, uploadJDtoS3 } from "../utils/ApiCall";
import JDContent from "./JDContent";
import JDFileModal from "./JDFileModal";

function JD({ onJobDescriptionSelected, onJDUpdated }) {
  const [jobDescriptionSelected, setJobDescriptionSelected] = useState(null);
  const [jobDescriptionOptions, setJobDescriptionOptions] = useState([]);
  const [originalJobDescriptionOptions, setOriginalJobDescriptionOptions] = useState([]);
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [profileData, setProfileData] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [updatedJDData, setUpdatedJDData] = useState(false);
  const [updatingJD, setUpdatingJD] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFileName, setModalFileName] = useState("");
  const [modalFileUrl, setModalFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setErrorMessage("");
    setUpdatingJD(null);

    if (isOtherSelected && !customJobDescription.trim()) {
      setJobDescriptionOptions(originalJobDescriptionOptions);
      setIsOtherSelected(false);
    }
  };

  useEffect(() => {
    loadJobDescriptions();
  }, [updatedJDData]);

  const loadJobDescriptions = async () => {
    setLoading(true);
    try {
      const data = await fetchJobDescriptions();
      if (data.statusCode === 200) {
        const jobDescriptions = data["Profile Name"] || Object.keys(data["Profile Data"] || {});
        if (jobDescriptions.length > 0) {
          const formattedOptions = jobDescriptions.map((profile) => ({
            value: profile,
            label: profile.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
          }));
          setJobDescriptionOptions(formattedOptions);
          setOriginalJobDescriptionOptions(formattedOptions);
        } else {
          setErrorMessage("No job descriptions available.");
        }
        setProfileData(data["Profile Data"]);
      } else {
        setErrorMessage("Failed to fetch job descriptions.");
      }
    } catch (error) {
      setErrorMessage("Error loading job descriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadJD = async (fileKey, jdProfile) => {
    setIsUploading(true);
    try {
      const presignedUrl = await fetchJDPresignedUrl(fileKey, jdProfile);
      if (presignedUrl && selectedFile) {
        const uploadResponse = await uploadJDtoS3(presignedUrl, selectedFile);
        if (uploadResponse.success) {
          setErrorMessage("");
          onJobDescriptionSelected({ value: jdProfile, label: jdProfile });
          setUpdatedJDData((prev) => !prev);
          onJDUpdated?.();
        } else {
          setErrorMessage(uploadResponse.message);
        }
      } else {
        setErrorMessage("Failed to get the presigned URL.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
      setDropdownOpen(false);
      setJobDescriptionOptions(originalJobDescriptionOptions);
      setUpdatingJD(null);
    }
  };

  const handleOtherJD = () => {
    setCustomJobDescription("");
    setJobDescriptionOptions([]);
    setSelectedFile(null);
    setIsOtherSelected(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setErrorMessage("");
    } else {
      setErrorMessage("Only PDF, DOC, and DOCX files are allowed.");
      e.target.value = "";
    }
  };

  const handleUpdate = (jdProfile) => {
    setUpdatingJD(jdProfile);
    setSelectedFile(null);
  };

  const handleUpload = (jdProfile) => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }
    handleUploadJD(selectedFile.name, jdProfile);
  };

  const handleSaveCustomJobDescription = () => {
    if (!customJobDescription.trim()) {
      setErrorMessage("Please enter a custom job description.");
      return;
    }
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }
    handleUploadJD(selectedFile.name, customJobDescription);
  };

  const handleFileClick = (fileName, fileUrl) => {
    setModalFileName(fileName);
    setModalFileUrl(fileUrl);
    setIsModalOpen(true);
  };

  return (
    <div className="relative">
      <button className="btn btn-primary" onClick={toggleDropdown}>
        {isUploading ? (
          <>
            Uploading JD
            <LoadingIcon icon="spinning-circles" color="white" className="w-4 h-4 ml-2" />
          </>
        ) : jobDescriptionSelected ? (
          jobDescriptionSelected.label
        ) : (
          <>
            <Lucide icon="FileText" className="w-4 h-4 mr-2" />
            Update Job Descriptions
          </>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute mt-2 w-[450px] md:w-[500px] lg:w-[550px] max-w-[90vw] right-0 bg-white shadow-lg rounded-md z-50 p-3">
          <JDContent
            loading={loading}
            errorMessage={errorMessage}
            jobDescriptionOptions={jobDescriptionOptions}
            profileData={profileData}
            updatingJD={updatingJD}
            selectedFile={selectedFile}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            handleUpdate={handleUpdate}
            handleOtherJD={handleOtherJD}
            handleFileClick={handleFileClick}
            isUploading={isUploading}
            customJobDescription={customJobDescription}
            setCustomJobDescription={setCustomJobDescription}
            handleSaveCustomJobDescription={handleSaveCustomJobDescription}
          />
        </div>
      )}
      {isModalOpen && (
        <JDFileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fileName={modalFileName}
          fileUrl={modalFileUrl}
        />
      )}
    </div>
  );
}

export default JD;
