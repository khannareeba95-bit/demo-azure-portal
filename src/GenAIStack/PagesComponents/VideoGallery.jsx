import React from "react";
import VideoThumbnail from "./VideoThumbnail";

const VideoGallery = ({ videos, handleVideoClick, selectedVideo }) => {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex flex-row justify-between items-center text-center mb-1">
          <h3 className="text-primary text-xl font-bold">Videos</h3>
        </div>
        <div className="flex flex-row justify-between items-center text-center">
          <p className="text-primary text-sm font-semibold">
            Click to see the Generative AI in Action
          </p>
        </div>
      </div>
      <div
        className={`w-full flex lg:flex-col lg:p-5  flex-row md:overflow-x-hidden md:overflow-y-auto`}
      >
        <div
          className={`${
            selectedVideo === null
              ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
              : "flex  flex-row md:flex-col"
          }  pb-5 px-2  max-h-[80vh] ${
            selectedVideo !== null &&
            "border-[#e2e8f0] lg:border-r border-opacity-20"
          }  gap-4    lg:pr-4 overflow-auto`}
        >
          {videos.map((video) => (
            <VideoThumbnail
              key={video.id}
              video={video}
              handleVideoClick={handleVideoClick}
              selectedVideo={selectedVideo}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default VideoGallery;
