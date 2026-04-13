import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

export const PdfViewer = ({ pdfFile, scale }) => {
  const [numPages, setNumPages] = useState(null);
  const onDocumentSuccess = (numPages) => {
    setNumPages(numPages?._pdfInfo?.numPages);
  };
  const styles = {
    page: {
      flexDirection: "row",
      backgroundColor: "#E4E4E4",
      border: "2px solid black",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
  };

  return (
    <div className="flex justify-center">
      <div className="w-[700px] ">
        <Document file={pdfFile} onLoadSuccess={onDocumentSuccess}>
          {Array(numPages)
            .fill()
            .map((_, i) => (
              <Page
                pageNumber={i + 1}
                style={styles?.page}
                scale={scale}
              ></Page>
            ))}
        </Document>
      </div>
    </div>
  );
};
