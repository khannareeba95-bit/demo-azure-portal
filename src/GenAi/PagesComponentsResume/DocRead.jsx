import React, { useState } from "react";
import Modal from "react-modal";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import { PdfViewer } from "../../PdfViewer";
import { RxCross2 } from "react-icons/rx";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

Modal.setAppElement("#root"); // Specify the root element of your React app

const DocRead = ({ video, statusOfInstance }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePreviewClick = (video) => {
    const pdfUrl = video?.source;
    setPdfUrl(pdfUrl);
    setIsModalOpen(true);
    setLoading(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLoadSuccess = () => {
    setLoading(false);
  };

  const handleLoadError = (error) => {
    setLoading(false);
    setError(error);
  };

  return (
    <div className="lg:w-[60%] xl:w-full flex items-center flex-col gap-3 justify-center  w-full  bg-white  rounded-lg lg:h-[300px] h-[300px] lg:m-5 my-5 shadow-md">
      <img
        src={"/genai/assets/pdf.png"}
        alt="Video Thumbnail"
        className="cursor-pointer  h-48 w-48  "
      />
      <button
        className="btn btn-outline-primary w-36 inline-block mr-1 mb-2 disabled:cursor-not-allowed hover:scale-110 duration-300 hover:duration-300"
        onClick={() => handlePreviewClick(video)}
      >
        Click to Preview
      </button>
      <PreviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        pdfUrl={pdfUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        video={video}
      />
      {/* {loading && <div>Loading...</div>}
      {error && <div>Error loading PDF: {error.message}</div>} */}
    </div>
  );
};

export default DocRead;

export const PreviewModal = ({
  isOpen,
  onClose,
  pdfUrl,
  onLoadSuccess,
  onLoadError,
  video,
}) => {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      //   right: 'auto',
      //   bottom: 'auto',
      //   marginRight: '-50%',
      transform: "translate(-50%, -50%)",
      width: "60%",
      height: "500px",
      // margin: '20px',
      // paddingLeft: '90px',
      // display: 'flex',
      //   flexDirection: 'column',
      alignItems: "center",
      // backgroundColor: 'rgba(0,0,0,0.4)',
      //   justifyContent: 'center',
    },
  };
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale(scale + 0.1);
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.1)); // Ensure scale doesn't go below 0.1
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className=""
      style={customStyles}
    >
      <div className="sticky flex top-0 right-0 justify-end  w-full z-[999]   ">
        <div className="">
          <RxCross2
            onClick={onClose}
            className="cursor-pointer font-medium text-[20px] hover:scale-125 "
          />
        </div>
      </div>
      {/* <div>
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
      </div> */}

      <div className="flex items-center justify-center border border-gray-300 rounded-md">
        <PdfViewer pdfFile={video?.source} scale={1.2} />
      </div>
    </Modal>
  );
};
