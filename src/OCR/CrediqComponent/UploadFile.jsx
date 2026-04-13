import React, { useState, useRef } from "react";
import { LoadingIcon } from "@/base-components";
import Lucide from "../../base-components/lucide";
import { toast } from "react-toastify";
import {
  fetchFilePresignedUrl,
  uploadFileToS3WithUrl,
  fetchInvoicePresignedUrl,
} from "../utils/ApiCall";

const UploadFile = ({
  isUploading,
  setIsUploading,
  uploadedFileInfo,
  setUploadedFileInfo,
  handleFileChange,
  selectedFiles,
  setSelectedFiles,
  key,
  isUploadComplete,
  setIsUploadComplete,
  documentType,
}) => {
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setIsUploadComplete(false);
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const presignedUrl =
          documentType === "invoice" || documentType === "ocr_all_documents"
            ? await fetchInvoicePresignedUrl(file.name)
            : await fetchFilePresignedUrl(file.name);

        if (!presignedUrl) {
          console.error("No presigned URL received for:", file.name);
          toast.error("No presigned url generated");
        }
        if (presignedUrl) {
          await uploadFileToS3WithUrl(presignedUrl, file);
          const fileLocation = presignedUrl.split("?")[0];
          return { name: file.name, url: fileLocation };
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      setUploadedFileInfo((prevState) => [
        ...prevState,
        ...uploadedFiles.filter(Boolean),
      ]);

      toast.success("Files uploaded successfully!");
      setIsUploadComplete(true);
    } catch (error) {
      toast.error(error.message || "Error uploading files.");
    } finally {
      setIsUploading(false);
      setSelectedFiles([]);
    }
  };

  const renderFileList = () => (
    <div className="space-y-2 mt-2">
      {selectedFiles.map((file) => (
        <div key={file.name} className="flex items-center justify-between">
          <div className="flex items-center">
            <Lucide icon="FileCheck" className="w-6 h-6 mr-2 text-amber-600" />
            <span>{file.name}</span>
          </div>
          <button
            className="btn btn-danger px-4 py-2 text-sm"
            onClick={() => handleRemoveFile(file.name)}
          >
            <Lucide icon="CircleX" className="w-4 h-4 mr-2" />
            Remove
          </button>
        </div>
      ))}
    </div>
  );

  const renderUploadedFiles = () => (
    <div className="space-y-2 my-2">
      {uploadedFileInfo.map((file) => (
        <div key={file.name} className="flex items-center">
          <Lucide icon="FileCheck" className="w-6 h-6 mr-2 text-green-700" />
          <span className="text-sm font-sans">{file.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="my-5">
      <h1 className="font-sans font-semibold text-xl inline-flex items-center w-full mb-4">
        <Lucide icon="CloudUpload" className="w-6 h-6 mr-2 text-primary" />
        Upload File
      </h1>

      <div className="flex flex-col gap-4 bg-gray-100 p-3 rounded-md">
        {!selectedFiles?.length && (
          <div className="flex items-center justify-between w-full">
            <h1 className="font-sans text-base inline-flex items-center mr-2 font-medium">
              <Lucide icon="FilePlus" className="w-6 h-6 mr-2" />
              Choose Files
            </h1>
            <label
              className="btn btn-outline-primary px-4 py-2 text-sm font-medium whitespace-nowrap"
              htmlFor="fileInput"
            >
              <Lucide icon="Paperclip" className="w-4 h-4 mr-2" />
              Browse Files
            </label>
            <input
              key={key}
              type="file"
              id="fileInput"
              accept=".docx,.pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
              // multiple
            />
          </div>
        )}

        {selectedFiles && selectedFiles.length > 0 && (
          <>
            <h2 className="font-semibold text-lg flex items-center font-sans text-amber-600">
              <Lucide
                icon="FileCheck"
                className="w-6 h-6 mr-2 text-amber-600"
              />
              Selected Files
            </h2>
            {renderFileList()}
            <div className="flex flex-col items-center gap-4 mt-5">
              <div className="flex items-center space-x-4">
                {/* <label
                  htmlFor="fileInput"
                  className="btn btn-outline-primary px-4 py-2 text-sm flex items-center whitespace-nowrap"
                >
                  <Lucide icon="PlusCircle" className="w-4 h-4 mr-2" />
                  Add More Files
                </label> */}

                <input
                  key={key}
                  type="file"
                  id="fileInput"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <button
                  className="btn btn-primary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center"
                  onClick={handleUploadAll}
                  disabled={isUploading || selectedFiles.length === 0}
                >
                  {isUploading ? (
                    <>
                      Uploading
                      <LoadingIcon
                        icon="spinning-circles"
                        color="white"
                        className="w-4 h-4 ml-2"
                      />
                    </>
                  ) : (
                    <>
                      <Lucide icon="CloudUpload" className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isUploadComplete && uploadedFileInfo.length > 0 && (
        <>
          <div className="flex items-center justify-between w-full my-4">
            <h1 className="font-sans font-semibold text-lg inline-flex items-center w-full text-green-700">
              <Lucide
                icon="CloudUpload"
                className="w-6 h-6 mr-2 text-green-700"
              />
              Uploaded File
            </h1>
          </div>
          {renderUploadedFiles()}
        </>
      )}
    </div>
  );
};

export default UploadFile;
