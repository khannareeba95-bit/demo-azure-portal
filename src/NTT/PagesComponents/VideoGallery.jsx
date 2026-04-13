import React, { useEffect, useState } from "react";
import VideoThumbnail from "./VideoThumbnail";
import Select, { components } from "react-select";
import { FaPlay } from "react-icons/fa";

const VideoGallery = ({
  videos,
  handleVideoClick,
  selectedVideo,
  setSelectedVideo,
  selectedChapter,
  setSelectedChapter,
}) => {
  const basicOptions = videos?.map((chapter) => ({
    value: chapter?.chapter_title,
    label: chapter?.chapter_title?.replace("_", " "),
  }));
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };
  useEffect(() => {
    if (selectedOption) {
      const selectedChapterObject = videos?.find(
        (chapter) => chapter?.chapter_title === selectedOption?.value
      );
      handleVideoClick(selectedChapterObject, "chapter");
    }
  }, [selectedOption]);
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex flex-row justify-between items-center text-center mb-1">
          <h3 className="text-primary text-xl font-bold">Videos</h3>
        </div>
        <div className="flex flex-col justify-between items-center ">
          <p className="text-primary text-sm text-center font-semibold">
            Click to see the Generative AI in Action
          </p>
          <div class=" w-full my-3 ">
            {selectedChapter !== null && (
              <Select
                options={basicOptions}
                class="w-full "
                placeholder="Select Chapter"
                value={selectedOption}
                onChange={handleSelectChange}
              />
            )}
          </div>
        </div>
      </div>

      <div
        className={`w-full flex lg:flex-col lg:p-5  flex-row md:overflow-x-hidden md:overflow-y-auto`}
      >
        <div
          className={`${
            selectedChapter === null
              ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
              : "flex  flex-row md:flex-col"
          }  pb-5 px-2  max-h-[80vh] ${
            selectedChapter !== null &&
            "border-[#e2e8f0] lg:border-r border-opacity-20"
          }  gap-4    lg:pr-4 overflow-auto`}
        >
          {videos?.map((video) => (
            <VideoThumbnail
              key={video.id}
              video={video}
              handleVideoClick={handleVideoClick}
              selectedVideo={selectedVideo}
              selectedChapter={selectedChapter}
              setSelectedChapter={setSelectedChapter}
            />
          ))}

          <>
            {selectedChapter !== null && (
              <>
                {selectedChapter?.videos?.map((item, index) => (
                  <Thumbnail
                    key={index}
                    item={item}
                    selectedVideo={selectedVideo}
                    handleVideoClick={handleVideoClick}
                  />
                ))}
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default VideoGallery;

const Thumbnail = ({ item, selectedVideo, handleVideoClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`h-full relative rounded-lg cursor-pointer ${
        selectedVideo?.id === item?.id
          ? "shadow-xl border-1 bg-white border-primary box"
          : "border-6 border-transparent"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleVideoClick(item, "video")}
    >
      <div className="flex flex-col items-center p-2 justify-center text-center">
        <video
          id={`video${item?.id}`}
          src={item?.source}
          type="video/mp4"
          className="bg-primary box"
        ></video>
        <h2 className="text-sm text-primary font-medium mt-2">{item?.title}</h2>
      </div>
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FaPlay className="text-[#d0b92b] text-2xl" />
        </div>
      )}
    </div>
  );
};
