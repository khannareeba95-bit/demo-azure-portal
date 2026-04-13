import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";

const VideoThumbnail = ({
  video,
  handleVideoClick,
  selectedVideo,
  selectedChapter,
  setSelectedChapter,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <>
      {selectedChapter === null && (
        <div
          className={`min-h-[200px] relative rounded-lg cursor-pointer  ${
            selectedChapter?.id == video?.id
              ? "shadow-2xl border-2 bg-[#28334e] border-[#28334e]"
              : "border-6 border-transparent"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => handleVideoClick(video, "chapter")}
        >
          <div className="flex flex-col items-center p-2 justify-center text-center shadow-lg rounded-md bg-[#354e96]">
            <video
              // id={`video${video?.id}`}
              src="https://transcriptions-gen-ai-demos.s3.ap-south-1.amazonaws.com/video1/Fundamentals+of+Cloud+Computing+-+Chapter+01-(1080p).mp4"
              type="video/mp4"
            ></video>
            <div class="min-h-[50px] flex justify-center">
              <h2 className="text-sm  text-white font-medium mt-2">
                {video?.chapter_title?.replace("_", " ")}
              </h2>
            </div>
          </div>
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center">
              <FaPlay className="text-[#d0b92b] text-2xl" />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VideoThumbnail;
