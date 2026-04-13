import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";

const VideoThumbnail = ({ video, handleVideoClick, selectedVideo, type }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`video-thumbnail relative rounded-lg cursor-pointer transition-all duration-200 ${
        selectedVideo?.id === video?.id
          ? "shadow-lg border-2 bg-white border-primary ring-2 ring-blue-500"
          : "border border-[#d0b92b] hover:shadow-md"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleVideoClick(video)}
    >
      <div className="flex flex-col items-center p-2 justify-center text-center">
        {type === "doc" ? (
          <div className="w-28 aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
            <img
              src={"/genai/assets/pdf.png"}
              alt="Document Thumbnail"
              className="h-20 w-16 object-contain"
            />
          </div>
        ) : (
          <div className="w-28 aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={video?.thumbnail}
              alt="Video Thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h2 className="text-xs text-primary font-medium mt-2 line-clamp-2">
          {video?.title}
        </h2>
      </div>
      {type !== "doc" && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
          <FaPlay className="text-[#d0b92b] text-xl" />
        </div>
      )}
    </div>
  );
};

export default VideoThumbnail;
