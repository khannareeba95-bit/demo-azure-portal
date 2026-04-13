import React, { useState, useEffect, useCallback } from "react";
import { LoadingIcon } from "@/base-components";
import { toast } from "react-toastify";
import Lucide from "../../base-components/lucide";
import "../utils/scroller.css";
import { processResumeComparison } from "../utils/ApiCall";

const renderSkillList = (
  skills,
  shouldShowAll,
  toggleSkills,
  skillType,
  fileName
) => (
  <ul className="list-disc pl-6 overflow-y-auto custom-scroll-resume overflow-x-hidden">
    {skills.slice(0, shouldShowAll ? skills.length : 3).map((skill, index) => (
      <li key={index}>{skill}</li>
    ))}
    {skills.length > 3 && (
      <button
        onClick={() => toggleSkills(skillType, fileName)}
        className="text-green-700 text-sm mt-2 font-semibold w-auto whitespace-nowrap"
      >
        {shouldShowAll ? "Show less" : "Show more"}
      </button>
    )}
  </ul>
);

const CrediqProcessing = ({
  isProcessing,
  setIsProcessing,
  uploadedFileInfo,
  isUploadComplete,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [processData, setProcessData] = useState(null);
  const [isButtonHidden, setIsButtonHidden] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [fileQueries, setFileQueries] = useState({});

  const [toggleSkills, setToggleSkills] = useState({
    "Matched Skills": false,
    "Unmatched Skills": false,
    "Candidate Skills": false,
  });

  const fileNames = uploadedFileInfo.map((file) => file.name);
  if (fileNames.length === 0) {
    setErrorMessage("No valid file names available.");
    setIsProcessing(false);
    return;
  }

  // const createPayload = (fileNames) => ({ file_key: fileNames });
  const handleQueryChange = (e, file) => {
    const query = e.target.value;
    setFileQueries((prevQueries) => ({
      ...prevQueries,
      [file]: query,
    }));
  };

  const createPayload = (fileNames, queries = {}) => {
    const queriesObj = fileNames.reduce((acc, file) => {
      acc[file] = queries[file] || null;
      return acc;
    }, {});

    return {
      file_key: fileNames,
      queries: queriesObj,
      document_type: "Loan Application",
      User_instruction: "None",
    };
  };

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    const payload = createPayload(fileNames, fileQueries);

    const message = await processResumeComparison(
      payload,
      setErrorMessage,
      setProcessData,
      setIsProcessing,
      setIsButtonHidden
    );

    if (message !== "Processing successful") {
      toast.error(message);
    }
  };

  const toggleSkillList = useCallback((skillType, fileName) => {
    setToggleSkills((prevState) => {
      const updatedState = { ...prevState };

      if (!updatedState[fileName]) {
        updatedState[fileName] = {};
      }

      if (
        skillType === "Candidate Skills" ||
        skillType === "Matched Skills" ||
        skillType === "Unmatched Skills"
      ) {
        if (updatedState[fileName][skillType]) {
          updatedState[fileName][skillType] = false;
        } else {
          Object.keys(updatedState[fileName]).forEach((key) => {
            updatedState[fileName][key] = false;
          });
          updatedState[fileName][skillType] = true;
        }
      } else {
        updatedState[skillType] = !prevState[skillType];
      }

      return updatedState;
    });
  }, []);

  const renderErrorMessage = () => (
    <div className="bg-red-100 p-4 rounded-md">
      <h1 className="text-red-600 text-base text-center">{errorMessage}</h1>
    </div>
  );

  const renderTable = (data, fileName) => {
    const candidateData = data["Candidate Data"];
    const compareRes = data["Compare Res"];

    const candidateKeys = Object.keys(candidateData).filter(
      (key) => key !== "Candidate Summary" && key !== "CandidateID"
    );

    const compareResKeys = Object.keys(compareRes);
    const allColumns = [...candidateKeys, ...compareResKeys];

    return (
      <>
        <div
          className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md my-3"
          key={fileName}
        >
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              <h2 className="font-bold text-xl my-2">Summary</h2>
            </div>
            <p className="my-4">{candidateData["Candidate Summary"]}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-bordered">
              <thead>
                <tr>
                  {allColumns
                    .filter(
                      (column) =>
                        column !== "Matched Skills" &&
                        column !== "Unmatched Skills" &&
                        column !== "Candidate Skills"
                    )
                    .map((key) => {
                      const columnName = key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .replace("A I", "AI");
                      return (
                        <th
                          key={key}
                          className="border border-gray-300 px-4 py-2"
                        >
                          {columnName}
                        </th>
                      );
                    })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {allColumns
                    .filter(
                      (column) =>
                        column !== "Matched Skills" &&
                        column !== "Unmatched Skills" &&
                        column !== "Candidate Skills"
                    )
                    .map((key) => {
                      const value = candidateData[key] || compareRes[key];
                      return (
                        <td
                          key={key}
                          className="border border-gray-300 px-4 py-2"
                        >
                          {Array.isArray(value) ? value.join(", ") : value}
                        </td>
                      );
                    })}
                </tr>
                <tr key="Matched Skills">
                  <td
                    colSpan={allColumns.length}
                    className="border border-gray-300 px-4 py-2"
                  >
                    <h1 className="my-3 font-bold">Matched Skills : </h1>
                    {renderSkillList(
                      candidateData["Matched Skills"] ||
                        compareRes["Matched Skills"],
                      toggleSkills[fileName]?.["Matched Skills"],
                      toggleSkillList,
                      "Matched Skills",
                      fileName
                    )}
                  </td>
                </tr>

                <tr>
                  {compareRes["Unmatched Skills"] &&
                    compareRes["Unmatched Skills"].length > 0 && (
                      <td
                        colSpan={allColumns.length}
                        className="border border-gray-300 px-4 py-2"
                      >
                        <h1 className="my-3 font-bold">Unmatched Skills : </h1>
                        {renderSkillList(
                          compareRes["Unmatched Skills"],
                          toggleSkills[fileName]?.["Unmatched Skills"],
                          toggleSkillList,
                          "Unmatched Skills",
                          fileName
                        )}
                      </td>
                    )}
                </tr>

                <tr>
                  <td
                    colSpan={allColumns.length}
                    className="border border-gray-300 px-4 py-2"
                  >
                    <h1 className="my-3 font-bold">Candidate Skills : </h1>

                    {renderSkillList(
                      candidateData["Candidate Skills"] ||
                        compareRes["Candidate Skills"],
                      toggleSkills[fileName]?.["Candidate Skills"],
                      toggleSkillList,
                      "Candidate Skills",
                      fileName
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div>
      {uploadedFileInfo.length && isUploadComplete && (
        <>
          <div className="w-full my-5">
            {!isButtonHidden && (
              <>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <h1 className="font-sans text-xl font-semibold inline-flex items-center">
                    <Lucide
                      icon="Rocket"
                      className="w-6 h-6 mr-2 text-primary"
                    />
                    Processing the file
                  </h1>

                  <div className="flex gap-4">
                    <button
                      className="btn btn-outline-primary px-4 py-2 text-sm font-medium"
                      onClick={() => setShowAdvancedSearch((prev) => !prev)}
                    >
                      {showAdvancedSearch ? (
                        <>
                          <Lucide icon="X" className="w-4 h-4 mr-2" />
                          Advance Search
                        </>
                      ) : (
                        <>
                          <Lucide icon="Search" className="w-4 h-4 mr-2" />
                          Advance Search
                        </>
                      )}
                    </button>

                    <button
                      className="btn btn-outline-primary px-4 py-2 text-sm font-medium min-w-[10rem] flex items-center justify-center"
                      onClick={handleStartProcessing}
                      disabled={isProcessing}
                    >
                      {!isProcessing ? (
                        <>
                          <Lucide icon="Rocket" className="w-4 h-4 mr-2" />
                          Start Processing
                        </>
                      ) : (
                        <>
                          Processing
                          <LoadingIcon
                            icon="spinning-circles"
                            color="#1e3a8a"
                            className="w-4 h-4 ml-2"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {showAdvancedSearch && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {fileNames.map((file) => (
                      <div
                        key={file}
                        className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
                      >
                        <div className="font-medium text-sm mb-2 truncate">
                          File Name : {file}
                        </div>
                        <input
                          type="text"
                          value={fileQueries[file] || ""}
                          onChange={(e) => handleQueryChange(e, file)}
                          placeholder="Enter your query"
                          className="w-full border px-3 py-2 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {errorMessage && renderErrorMessage()}

          {processData &&
            Object.keys(processData).some((fileName) => {
              const compareRes = processData[fileName]["Compare Res"];
              return parseInt(compareRes["Matching Score"], 10) < 50;
            }) &&
            (() => {
              const unfitCandidates = Object.keys(processData)
                .filter(
                  (fileName) =>
                    parseInt(
                      processData[fileName]["Compare Res"]["Matching Score"],
                      10
                    ) < 50
                )
                .map(
                  (fileName) =>
                    processData[fileName]["Candidate Data"]["Candidate Name"]
                );

              return (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-md my-4 shadow-md">
                  <h1 className="text-md font-bold text-gray-500 text-center mb-2">
                    Candidate{unfitCandidates.length > 1 ? "s" : ""} Name :
                    <span className="text-gray-700">
                      {" "}
                      {unfitCandidates.join(", ")}
                    </span>
                  </h1>
                  <p className="text-red-600 text-sm flex items-center justify-center">
                    <Lucide
                      icon="AlertTriangle"
                      className="w-5 h-5 text-red-600 mr-2 flex-shrink-0"
                    />
                    {unfitCandidates.length > 1
                      ? "These candidates do"
                      : "This candidate does"}{" "}
                    not meet the job criteria as per the matching score.
                  </p>
                </div>
              );
            })()}

          {processData &&
            Object.keys(processData)
              .filter((fileName) => {
                const compareRes = processData[fileName]["Compare Res"];
                return parseInt(compareRes["Matching Score"], 10) >= 50;
              })
              .map((fileName) => renderTable(processData[fileName], fileName))}
        </>
      )}
    </div>
  );
};

export default CrediqProcessing;
