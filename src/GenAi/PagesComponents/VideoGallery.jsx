import React, { useState } from "react";
import VideoThumbnail from "./VideoThumbnail";
import Select from "react-select";

const VideoGallery = ({
  videos,
  handleVideoClick,
  selectedVideo,
  type,
  basicOptions,
  selectedOption,
  handleSelectChange,
}) => {

  return (
    <>
      <div className="w-full">
        <h3 className="text-primary text-xl text-center mb-1">
          {type === "doc" ? "Documents" : "Videos"}
        </h3>
        <div className="flex flex-col justify-between items-center ">
          <p className="text-primary text-sm">
            Click to see the Generative AI in Action
          </p>
          <div className="w-full my-3">
            {type === "doc" && (
              <Select
                options={basicOptions}
                className="w-full"
                placeholder="Select Chapter"
                value={selectedOption}
                onChange={handleSelectChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="w-full flex lg:flex-col lg:p-5 flex-row md:overflow-x-hidden md:overflow-y-auto">
        {selectedVideo === null ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 pb-5 px-2 max-h-[80vh] gap-4 lg:pr-4 overflow-auto">
            {videos.map((video) => (
              <VideoThumbnail
                key={video.id}
                video={video}
                handleVideoClick={handleVideoClick}
                selectedVideo={selectedVideo}
                type={type}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-5 px-2 max-h-[80vh] border-primary lg:border-r border-opacity-20 lg:pr-4 overflow-y-auto">
            {videos.map((video) => (
              <VideoThumbnail
                key={video.id}
                video={video}
                handleVideoClick={handleVideoClick}
                selectedVideo={selectedVideo}
                type={type}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default VideoGallery;
