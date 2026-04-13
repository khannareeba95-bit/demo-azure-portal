import React, { useState, useEffect } from "react";
import { LoadingIcon } from "@/base-components";
import { toast } from "react-toastify";
import Lucide from "../../base-components/lucide";
import "../utils/scroller.css";
import PdfDownload from "./PdfDownload";
import { PDFDownloadLink } from "@react-pdf/renderer";

const CrediqProcessing = ({
  isProcessing,
  setIsProcessing,
  uploadedFileInfo,
  isUploadComplete,
  selectedOption,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [processData, setProcessData] = useState(null);
  const [isButtonHidden, setIsButtonHidden] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [fileQueries, setFileQueries] = useState({});

  const fileNames = uploadedFileInfo.map((file) => file.name);

  useEffect(() => {
    if (fileNames.length === 0) {
      setErrorMessage("No valid file names available.");
      setIsProcessing(false);
    }
  }, [fileNames, setIsProcessing]);

  const handleQueryChange = (e, file) => {
    const query = e.target.value;
    setFileQueries((prev) => ({
      ...prev,
      [file]: query,
    }));
  };

  const createPayload = (fileNames, queries = {}, selectedOption) => ({
    file_key: fileNames[0],
    document_type: selectedOption,
    User_instruction: queries[fileNames[0]] || "None",
  });

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    setProcessData(null);

    const payload = createPayload(fileNames, fileQueries, selectedOption);

    const apiEndpoint =
      selectedOption === "invoice" || selectedOption === "ocr_all_documents"
        ? "https://bj3n1ia0m6.execute-api.ap-south-1.amazonaws.com/dev/invoice"
        : "https://bj3n1ia0m6.execute-api.ap-south-1.amazonaws.com/demo/dev_env";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          responseData?.body?.message ||
          responseData?.message ||
          `Server error (${response.status})`;
        throw new Error(errorMsg);
      }

      if (!responseData.body || Object.keys(responseData.body).length === 0) {
        throw new Error("Server returned empty response");
      }

      setProcessData({ responseType: selectedOption, response: responseData });
      setIsButtonHidden(true);
      setShowAdvancedSearch(false);
    } catch (error) {
      console.error("Processing error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      toast.error("Failed to process the request");
      setShowAdvancedSearch(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderErrorMessage = () => (
    <div className="bg-red-100 p-4 rounded-md">
      <h1 className="text-red-600 text-base text-center">{errorMessage}</h1>
    </div>
  );

  const formatKey = (key) => {
    if (!key) return "";
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderValue = (value) => {
    if (value === null || value === undefined || value === "") return "NA";

    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      return "None";
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return "None";
      return (
        <ul className="list-disc pl-5">
          {value.map((item, index) => (
            <li key={index}>{renderValue(item)}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      const filteredEntries = Object.entries(value).filter(
        ([_, val]) => val !== null && val !== undefined && val !== ""
      );

      if (filteredEntries.length === 0) return "None";

      return (
        <table className="min-w-full border-collapse">
          <tbody>
            {filteredEntries.map(([subKey, subValue]) => (
              <tr key={subKey}>
                <td className="border px-2 py-1 font-medium w-1/3">
                  {formatKey(subKey)}
                </td>
                <td className="border px-2 py-1">{renderValue(subValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // return value.toString();
    try {
      return <span>{value.toString()}</span>;
    } catch (err) {
      console.warn("Invalid value:", value);
      return "Unsupported Value";
    }
  };

  const renderTable = (items, title) => {
    if (!items) return null;

    const itemsArray = (Array.isArray(items) ? items : [items]).filter(
      (item) => item && typeof item === "object" && Object.keys(item).length > 0
    );

    if (itemsArray.length === 0) return null;

    const allKeys = [];
    itemsArray.forEach((item) => {
      if (item && typeof item === "object") {
        Object.keys(item).forEach((key) => {
          if (!allKeys.includes(key)) {
            allKeys.push(key);
          }
        });
      }
    });

    return (
      <div className="overflow-x-auto bg-white p-4 rounded-md shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">
          {formatKey(title)}{" "}
          {Array.isArray(items) ? `(${itemsArray.length})` : ""}
        </h2>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full border-collapse">
            {allKeys.length > 0 && (
              <>
                <thead>
                  <tr className="bg-gray-50">
                    {allKeys.map((key) => (
                      <th key={key} className="border px-4 py-2 text-left">
                        {formatKey(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {itemsArray.map((item, index) => (
                    <tr key={index}>
                      {allKeys.map((key) => (
                        <td
                          key={`${index}-${key}`}
                          className="border px-4 py-2"
                        >
                          {item && typeof item === "object"
                            ? renderValue(item[key])
                            : "NA"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    );
  };

  const renderDynamicData = (dynamicData) => {
    if (
      !dynamicData?.response?.body ||
      Object.keys(dynamicData.response.body).length === 0
    ) {
      return <p>Invalid Response Type</p>;
    }

    const data = dynamicData.response.body;
    const responseType = dynamicData.responseType;

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "object" && Object.keys(value).length === 0)
          return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      })
    );

    if (Object.keys(filteredData).length === 0) {
      return <p>No valid data to display</p>;
    }

    if (responseType === "Loan Application") {
      return (
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md my-5">
          {Object.entries(data).map(
            ([parentKey, parentChildren], parentIndex) => (
              <div key={parentIndex} className="overflow-x-auto">
                <h2 className="text-lg font-semibold mb-4">{parentKey}</h2>
                <table className="min-w-full border-collapse">
                  <tbody>
                    {Object.entries(parentChildren).map(
                      ([childKey, childValue], childIndex) => (
                        <tr key={childIndex}>
                          <td className="border px-4 py-2 font-medium bg-white flex-1">
                            {formatKey(childKey)}
                          </td>
                          <td className="border px-4 py-2 bg-white max-w-lg overflow-auto whitespace-pre-wrap text-sm flex-1">
                            {childValue || "N/A"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      );
    }

    if (responseType === "identity_card") {
      const flattenData = (obj, prefix = "") => {
        return Object.keys(obj).reduce((acc, key) => {
          const prefixedKey = prefix ? `${prefix}_${key}` : key;
          if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            Object.assign(acc, flattenData(obj[key], prefixedKey));
          } else {
            // acc[prefixedKey] = obj[key];
            acc[prefixedKey] =
              typeof obj[key] === "boolean" ? obj[key].toString() : obj[key];
          }
          return acc;
        }, {});
      };

      const flattenedData = flattenData(data);
      const tableData = Array.isArray(flattenedData)
        ? flattenedData
        : [flattenedData];
      const keys = Object.keys(tableData[0] || {});

      return (
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md my-5">
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">ID Details</h2>
            <table className="table table-bordered min-w-max">
              <tbody>
                {keys.map((key) => (
                  <tr key={key}>
                    <td className="border px-4 py-2 font-medium">
                      {formatKey(key)}
                    </td>
                    {tableData.map((row, idx) => (
                      <td
                        key={idx}
                        className={`border px-4 py-2 ${
                          key.toLowerCase().includes("address")
                            ? "max-w-[250px] overflow-y-auto whitespace-pre-wrap text-sm"
                            : ""
                        }`}
                        style={
                          key.toLowerCase().includes("address")
                            ? { maxHeight: "80px", overflowY: "auto" }
                            : {}
                        }
                      >
                        {Array.isArray(row[key])
                          ? row[key].join(", ")
                          : row[key] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (responseType === "bank_statement" || responseType === "cdsl_report") {
      return (
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md my-5">
          {Object.entries(data).map(([sectionKey, sectionValue]) => {
            if (sectionValue === null || sectionValue === undefined)
              return null;

            if (typeof sectionValue !== "object") {
              return (
                <div
                  key={sectionKey}
                  className="overflow-x-auto bg-white p-4 rounded-md shadow-sm mb-4"
                >
                  <h2 className="text-lg font-semibold mb-4">
                    {formatKey(sectionKey)}
                  </h2>
                  <div className="p-2">{renderValue(sectionValue)}</div>
                </div>
              );
            }
            return renderTable(sectionValue, sectionKey);
          })}
        </div>
      );
    }

    if (responseType === "invoice") {
      const result = data?.output?.results?.[0];

      if (result?.error) {
        return (
          <div className="bg-red-100 p-4 rounded-md my-5">
            <h2 className="text-red-600 text-lg  text-center">
              {result.error}
            </h2>
          </div>
        );
      }

      const extractedContent = result?.extracted_content || [];

      return (
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md my-5">
          <h1 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Invoice Details
          </h1>
          {extractedContent.map((item, index) => (
            <div
              key={index}
              className="overflow-x-auto bg-white p-4 rounded-md shadow-sm mb-4"
            >
              {item.ctype === "text" ? (
                <>
                  <h2 className="text-xl font-semibold text-primary mb-3">
                    Invoice Summary
                  </h2>
                  <pre className="whitespace-pre-wrap">{item.content}</pre>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-primary mb-3">
                    Invoice Breakdown
                  </h2>
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(item.content).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-6 py-2 font-medium text-gray-900">
                            <div className="max-h-96 overflow-y-auto">
                              {formatKey(key)}
                            </div>
                          </td>
                          <td className="px-6 py-2">
                            <div className="max-h-96 overflow-y-auto">
                              {renderValue(value)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ))}
        </div>
      );
    }

   if (responseType === "ocr_all_documents") {
  const documents = data?.output?.results || [];

  return (
    <div className="flex flex-col gap-8 bg-gray-100 p-4 rounded-md my-5">
      {documents.map((doc, docIndex) => {
        // Handle documents with content structure
        if (doc.document?.content && doc.document.content.length > 0) {
          return (
              <div
                key={docIndex}
                className="document-container bg-white p-6 rounded-lg shadow-sm"
              >
              {doc.document.title && (
                  <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">
                    {doc.document.title}
                  </h2>
              )}
              <div className="document-content">
                {doc.document.content.map((block, blockIndex) => {
                  switch (block.type) {
                    case "heading":
                      const headingLevel = Math.min(block.level || 1, 4);
                      const HeadingTag = `h${headingLevel}`;
                      return (
                        <HeadingTag
                          key={`${docIndex}-${blockIndex}`}
                          className="font-bold text-xl text-primary mt-4 mb-2"
                        >
                          {block.text}
                        </HeadingTag>
                      );

                    case "paragraph":
                    case "handwritten":
                      return (
                          <p
                            key={`${docIndex}-${blockIndex}`}
                            className="text-gray-800 leading-relaxed mb-3"
                          >
                          {block.text}
                        </p>
                      );

                    case "form_field":
                      return (
                          <div
                            key={`${docIndex}-${blockIndex}`}
                            className="flex flex-col mb-4"
                          >
                            <label className="text-sm font-semibold text-gray-700 py-3 w-full">
                              {block.label}
                            </label>
                          <p className="bg-white px-3 py-2 rounded-md border border-gray-300 text-gray-900 text-sm">
                            {block.value || "N/A"}
                          </p>
                        </div>
                      );

                    case "list":
                      return (
                        <ul
                          key={`${docIndex}-${blockIndex}`}
                          className="list-disc list-inside pl-4 text-gray-700 mb-4"
                        >
                          {block.items.map((item, idx) => (
                              <li key={idx}>
                                {item.replace(/^\*/, "").trim()}
                              </li>
                          ))}
                        </ul>
                      );

                    case "table":
                      return (
                          <div
                            key={`${docIndex}-${blockIndex}`}
                            className="overflow-x-auto mb-6"
                          >
                          <table className="min-w-full border border-gray-300 text-sm">
                            <thead className="bg-gray-200">
                              <tr>
                                {block.headers.map((header, i) => (
                                    <th
                                      key={i}
                                      className="border px-4 py-2 font-semibold"
                                    >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {block.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className="border px-4 py-2"
                                      >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          );
        }

        // Handle simple key-value pair documents
        return (
          <div key={docIndex} className="overflow-x-auto bg-white p-4 rounded-md shadow-sm mb-4">
            <h2 className="text-lg font-semibold mb-4">Document {docIndex + 1}</h2>
            <table className="min-w-full border-collapse">
              <tbody>
                {Object.entries(doc)?.map(([key, value]) => (
                  <tr key={key}>
                    <td className="border px-4 py-2 font-medium">{formatKey(key)}</td>
                    <td className="border px-4 py-2">{renderValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}


    return <p>Invalid Response Type</p>;
  };

  return (
    <div>
      {uploadedFileInfo.length > 0 && isUploadComplete && (
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
                      <Lucide
                        icon={showAdvancedSearch ? "X" : "Search"}
                        className="w-4 h-4 mr-2"
                      />
                      Advance Search
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 mb-6">
                    {fileNames.map((file) => (
                      <div
                        key={file}
                        className="p-4 rounded-lg shadow-sm bg-white"
                      >
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
          {processData?.response?.body && (
            <div className="flex justify-end mb-4">
              <PDFDownloadLink
                document={
                  <PdfDownload
                    data={processData}
                    responseType={processData.responseType}
                  />
                }
                fileName={
                  fileNames[0]?.toLowerCase().endsWith(".pdf")
                    ? fileNames[0]
                    : `${fileNames[0].replace(/\.[^/.]+$/, "")}.pdf`
                }
                className="btn btn-primary shadow-md"
              >
                {({ loading }) => (
                  <div className="flex items-center">
                    {loading ? (
                      <>
                        <LoadingIcon
                          icon="spinning-circles"
                          color="#ffffff"
                          className="w-4 h-4 mr-2"
                        />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Lucide icon="Download" className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </div>
                )}
              </PDFDownloadLink>
            </div>
          )}
          {processData?.response?.body && renderDynamicData(processData)}
        </>
      )}
    </div>
  );
};

export default CrediqProcessing;
