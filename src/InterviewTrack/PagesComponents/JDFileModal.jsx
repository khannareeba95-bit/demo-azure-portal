import React, { useState, useEffect } from "react";
import { pdfjs } from "react-pdf";
import { Document, Page } from "react-pdf";
import Lucide from "../../base-components/lucide";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const JDFileModal = ({ isOpen, onClose, fileUrl }) => {
  const [fileType, setFileType] = useState("");

  useEffect(() => {
    if (fileUrl) {
      const lowerUrl = fileUrl.split("?")[0].toLowerCase();
      if (lowerUrl.endsWith(".pdf")) {
        setFileType("pdf");
      } else if (lowerUrl.endsWith(".doc") || lowerUrl.endsWith(".docx")) {
        setFileType("doc");
      } else {
        setFileType("unsupported");
      }
    }
  }, [fileUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-[60%] h-[500px] overflow-hidden p-4">
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Lucide icon="X" className="w-6 h-6" />
          </button>
        </div>

        <div className="h-full w-full flex justify-center items-center overflow-auto">
          {fileType === "pdf" ? (
            <Document file={fileUrl} className="w-full h-full">
              <Page pageNumber={1} width={900} />
            </Document>
          ) : fileType === "doc" ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                fileUrl
              )}`}
              width="100%"
              height="100%"
              frameBorder="0"
              title="DOC Preview"
            />
          ) : (
            <div className="text-gray-500 text-center">
              Unsupported file type. Please upload a PDF.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JDFileModal;
