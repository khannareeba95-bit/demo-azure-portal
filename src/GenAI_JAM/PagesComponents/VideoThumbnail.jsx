import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";
//import { pdfImg } from '../../../public/genai/assets/pdf.png';

const VideoThumbnail = ({ video, handleVideoClick, selectedVideo }) => {
  // const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`video-thumbnail relative rounded-lg cursor-pointer  ${
        selectedVideo?.id == video?.id
          ? "shadow-md border bg-white border-primary"
          : "border border-[#d0b92b]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleVideoClick(video)}
    >
      <div className="flex flex-col items-center p-2 justify-center text-center">
        {/* <div className="w-full h-full cursor-pointer rounded-lg bg-white"></div> */}
        <img
          src={video?.thumbnail}
          alt="Video Thumbnail"
          className="cursor-pointer rounded-lg bg-white"
        />

        <h2 className="text-sm  text-primary font-medium mt-2">
          {video?.title}
        </h2>
      </div>
      {/* {isHovered && ( */}
      <div className="absolute inset-0 flex items-center justify-center">
        <FaPlay className="text-[#d0b92b] text-2xl" />
      </div>
      {/* )} */}
    </div>
  );
};

export default VideoThumbnail;
