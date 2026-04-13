import React from "react";
import Lucide from "../../base-components/lucide";
import { LoadingIcon } from "@/base-components";

const JDContent = ({
  loading,
  errorMessage,
  jobDescriptionOptions,
  profileData,
  updatingJD,
  selectedFile,
  handleFileChange,
  handleUpload,
  handleUpdate,
  handleOtherJD,
  handleFileClick,
  isUploading,
  customJobDescription,
  setCustomJobDescription,
  handleSaveCustomJobDescription,
}) => {
  return (
    <div className="max-h-[33rem] overflow-y-auto custom-scrollbar-assess">
      {errorMessage && (
        <div className="text-red-500 text-sm mb-2 text-center">
          {errorMessage}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <LoadingIcon
            icon="spinning-circles"
            color="black"
            className="w-8 h-8"
          />
        </div>
      ) : jobDescriptionOptions.length > 0 ? (
        jobDescriptionOptions.map((option) => {
          const fileData = profileData[option.value];
          const isOtherOption = option.label === "Other";

          return (
            <div
              key={option.value}
              className={`p-2 ${
                isOtherOption ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              onClick={isOtherOption ? handleOtherJD : undefined}
            >
              <div className="flex flex-col w-full">
                <span className="flex items-center text-base">
                  <Lucide icon="FileText" className="w-4 h-4 mr-2" />
                  {option.label}
                </span>
                {fileData && !isOtherOption && (
                  <div className="flex justify-between items-center my-1 pb-2 border-b border-gray-200 ">
                    <span
                      className="flex items-center text-gray-500 text-[13px] cursor-pointer"
                      onClick={() =>
                        handleFileClick(fileData?.file_name, fileData?.url)
                      }
                    >
                      <Lucide icon="File" className="w-4 h-4 mr-2" />
                      {fileData.file_name}
                    </span>
                    {updatingJD === option.label ? (
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center gap-2 w-full">
                          {selectedFile &&
                          selectedFile.name.length > 20 ? null : (
                            <label
                              htmlFor="file-upload"
                              className="btn btn-xs btn-primary flex items-center justify-center px-3"
                              style={{ width: "max-content" }}
                            >
                              <Lucide
                                icon="Paperclip"
                                className="w-4 h-4 mr-2"
                              />
                              {selectedFile ? selectedFile.name : "Browse File"}
                            </label>
                          )}

                          <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <button
                            className="btn btn-xs btn-primary flex items-center justify-center px-4 ml-auto"
                            onClick={() => handleUpload(option.label)}
                            disabled={!selectedFile || isUploading}
                          >
                            <Lucide
                              icon="CloudUpload"
                              className="w-4 h-4 mr-2"
                            />
                            Upload
                          </button>
                        </div>
                        {selectedFile && selectedFile.name.length > 20 && (
                          <div className="flex justify-end w-full">
                            <label
                              htmlFor="file-upload"
                              className="btn btn-xs btn-primary flex items-center justify-center px-3 mt-2"
                              style={{ width: "max-content" }}
                            >
                              <Lucide
                                icon="Paperclip"
                                className="w-4 h-4 mr-2"
                              />
                              {selectedFile.name}
                            </label>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        className="btn btn-xs btn-primary ml-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(option.label);
                        }}
                        disabled={isUploading}
                      >
                        <Lucide icon="FileEdit" className="w-4 h-4 mr-2" />
                        Update
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-2 flex flex-col items-center">
          <input
            type="text"
            placeholder="Enter Custom Job Description"
            value={customJobDescription}
            onChange={(e) => setCustomJobDescription(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full text-sm"
          />
          <div className="w-full my-3 flex items-center justify-between gap-2">
            <label
              htmlFor="file-upload"
              className={`btn btn-xs btn-primary text-center transition-all duration-300 ${
                selectedFile ? "w-full" : "w-1/2"
              }`}
            >
              <Lucide icon="Paperclip" className="w-4 h-4 mr-2" />
              {selectedFile ? selectedFile.name : "Browse File"}
            </label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              className={`btn btn-xs btn-primary transition-all duration-300 ${
                selectedFile ? "w-1/3" : "w-1/2"
              }`}
              onClick={handleSaveCustomJobDescription}
            >
              <Lucide icon="CloudUpload" className="w-4 h-4 mr-2" />
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JDContent;
