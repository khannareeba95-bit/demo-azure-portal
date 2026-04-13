import React, { useState, useContext, useCallback, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadFile from "../CrediqComponent/UploadFile";
import CrediqProcessing from "../CrediqComponent/CrediqProcessing";

function CREDIQ() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [key, setKey] = useState(0);
  const [selectedOption, setSelectedOption] = useState("identity_card");
  const basicOptions = [
    { value: "identity_card", label: "Identity Card" },
    { value: "Loan Application", label: "Loan Application" },
    { value: "cdsl_report", label: "CDSL / NDLS Report" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "invoice", label: "Invoice" },
    { value: "ocr_all_documents", label: "OCR (All Documents)" },
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length > 10) {
      toast.error("Only 10 files are allowed at a time.");
      return;
    }

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg",
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
      toast.error("Only PDF files are allowed!");
      return;
    }

    if (selectedFiles.length + newFiles.length > 10) {
      toast.error("You can only upload up to 10 files in total.");
      return;
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadedFileInfo([]);
    setKey((prevKey) => prevKey + 1);
  };

  function handleChangeOption(e) {
    // const {name,va} = e.target;
    setSelectedOption(e.target.value);
  }

  return (
    <>
      <div className="py-5 border-[1px] border-gray-200  rounded-lg">
        <div className="flex flex-col justify-between items-center ">
          <div className="self-end px-4">
            <p className="text-primary text-sm">
              Click to see the Generative AI in Action
            </p>
            <div className="w-full my-3">
              <select
                onChange={handleChangeOption}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue=""
              >
                {basicOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="w-full  rounded-lg mx-auto">
          <div className="w-full mx-auto flex justify-center flex-col items-center">
            <div className="p-3  w-full max-w-8xl mx-auto">
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
                  documentType={selectedOption}
                />
                {uploadedFileInfo.length > 0 && (
                  <CrediqProcessing
                    uploadedFileInfo={uploadedFileInfo}
                    setUploadedFileInfo={setUploadedFileInfo}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    setSelectedFiles={setSelectedFiles}
                    isUploadComplete={isUploadComplete}
                    selectedOption={selectedOption}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default CREDIQ;
