import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Lucide from "../../base-components/lucide";
import { LoadingIcon } from "@/base-components";
import { pdf } from "@react-pdf/renderer";
import EvaluationPDF from "./EvaluationPDF";
import "../utils/scroller.css";
import {
  fetchPresignedUrl,
  fetchEvaluationReport,
  uploadToS3,
} from "../utils/ApiCall";

function Evaluation({ candidateId, file_key }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const generatePDF = async (contentUpload) => {
    return await pdf(<EvaluationPDF data={contentUpload} />).toBlob();
  };

  const storeToS3 = async (fileKey, candidateId, contentUpload) => {
    try {
      const { PresignedUrl } = await fetchPresignedUrl(fileKey, candidateId);
      if (PresignedUrl) {
        const pdfBlob = await generatePDF(contentUpload);
        const uploadSuccess = await uploadToS3(PresignedUrl, pdfBlob);
        if (uploadSuccess) {
          setDownloadUrl(URL.createObjectURL(pdfBlob));
        }
      } else {
        console.error("Error fetching presigned URL");
      }
    } catch (error) {
      console.error("Error storing to S3:", error);
    }
  };

  const generateEvaluationReport = async () => {
    setLoading(true);
    setError(null);
    setEvaluationReport(null);

    try {
      const data = await fetchEvaluationReport(candidateId);
      if (data.statusCode === 200) {
        setEvaluationReport(data.body);
        toast.success("Evaluation report generated successfully!");
        await storeToS3(file_key, candidateId, data.body);
      } else {
        setError(
          data.statusCode === 500
            ? "Something went wrong."
            : "Error generating evaluation report"
        );
      }
    } catch (error) {
      console.error("Error generating evaluation report:", error);
      setError("Network Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      generateEvaluationReport();
    }
  }, [candidateId]);

  const handleShowDashboard = () => {
    window.location.href = "/hire";
  };

  const tableHeadings = evaluationReport?.detailed_report
    ? Object.keys(
        evaluationReport.detailed_report[
          Object.keys(evaluationReport.detailed_report)[0]
        ]
      )
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingIcon
          icon="spinning-circles"
          color="#1e3a8a"
          className="w-8 h-8 ml-2 inline-block"
        />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Evaluating Response
          </h2>
          <p className="text-sm text-gray-500">
            We're reviewing your assessment to provide an accurate evaluation.
            Please hold on while we process the details.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!evaluationReport) {
    return null;
  }

  return (
    <div className="evaluation">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl mx-auto mt-4">
        {/* Candidate Information */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-start my-4 tracking-wide">
          <h3 className="text-xl font-semibold">Candidate Information</h3>
          <div className="my-3">
            {["Name", "Email", "Applied Position", "Experience", "Phone"].map(
              (field) => (
                <p key={field} className="my-2">
                  <strong>{field} : </strong> {evaluationReport[field]}
                </p>
              )
            )}
          </div>
        </div>

        {/* Evaluation Summary */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-start">
          <div className="grid grid-cols-12 gap-6 p-4">
            <div className="col-span-12">
              <div className="mb-4 intro-y">
                <h2 className="font-bold text-xl my-2">Summary</h2>
                <p>{evaluationReport.Summary}</p>
              </div>
              <div className="grid grid-cols-12 gap-6">
                {/* Report boxes for Completeness and Correctness */}
                {["Completeness", "Correctness"].map((item) => (
                  <div
                    key={item}
                    className="col-span-12 sm:col-span-6 xl:col-span-6 intro-y"
                  >
                    <div className="report-box zoom-in">
                      <div className="box p-5">
                        <div className="flex">
                          <Lucide
                            icon="CircleCheckBig"
                            className="report-box__icon text-primary"
                          />
                        </div>
                        <div className="text-base font-medium leading-8 mt-6">
                          <h1>{`Overall ${item} Score`}</h1>
                          <p>
                            {evaluationReport.summary[`Over_all_${item}_Score`]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 mt-6 intro-y">
              <div className="overflow-y-auto custom-scroll">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="whitespace-normal">Question</th>
                      {tableHeadings.map((heading, index) => (
                        <th key={index} className="whitespace-normal">
                          {heading.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evaluationReport.detailed_report ? (
                      Object.keys(evaluationReport.detailed_report).map(
                        (key, index) => {
                          const report = evaluationReport.detailed_report[key];
                          return (
                            <tr key={index}>
                              <td className="whitespace-normal">{key}</td>
                              {tableHeadings.map((heading, idx) => (
                                <td key={idx} className="whitespace-normal">
                                  {report[heading]}
                                </td>
                              ))}
                            </tr>
                          );
                        }
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={tableHeadings.length + 1}
                          className="text-center"
                        >
                          No detailed report available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center mt-5">
          <button
            onClick={handleShowDashboard}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Dashboard
          </button>
          {downloadUrl && (
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = downloadUrl;
                // Remove the file extension from file_key and append "_Evaluation.pdf"
                const fileNameWithoutExtension = file_key.split(".")[0];
                link.download = `${fileNameWithoutExtension}_Evaluation.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-primary text-white rounded ml-2"
            >
              Download Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Evaluation;
