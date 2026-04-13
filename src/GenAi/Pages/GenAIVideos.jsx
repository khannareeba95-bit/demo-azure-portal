import { Auth } from "aws-amplify";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import UserContext from "../../Context/UserContext";
import { Assessment } from "../PagesComponents/Assessment";
import { ChatBot } from "../PagesComponents/ChatBot";
import { Summary } from "../PagesComponents/Summary";
import VideoGallery from "../PagesComponents/VideoGallery";
import VideoPlayer from "../PagesComponents/VideoPlayer";
import { JSONdATA } from "../utils/Constant";
import Lucide from "../../base-components/lucide/index";
import Select from "react-select";

export const GenAiVideos = () => {
  const { userDetails, userState, setUserState } = useContext(UserContext);
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loader, setLoader] = useState(false);
  const [statusOfInstance, setStatusOfInstance] = useState("InService");
  const [selectedOption, setSelectedOption] = useState(null);

  const basicOptions = [
    { value: "en", label: "English" },
    { value: "gu", label: "Gujarati" },
    { value: "bn", label: "Bengali" },
    { value: "kn", label: "Kannada" },
    { value: "ml", label: "Malayalam" },
    { value: "mr", label: "Marathi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "hi", label: "Hindi" },
    { value: "pa", label: "Punjabi" },
  ];
  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const formatTitle = (title) => {
    let formattedTitle = title.replaceAll("__", " - ").replaceAll("_", " ");
    return formattedTitle;
  };
  const videos = Object.entries(JSONdATA).map(([title, sources], index) => {
    const formattedTitle = formatTitle(title);
    return {
      id: index + 1,
      title: formattedTitle,
      thumbnail: `/genai/assets/videoCapture${index + 1}.png`,
      source: sources[0],
      transcription: sources[1],
      transcriptJson: sources[2],
      summary_uri: sources[3],
    };
  });

  useEffect(() => {
    document.title = "Generative AI";
    window.localStorage.setItem("currentPage", window.location.pathname);
    setSelectedVideo(videos[0]);
    const defaultLang = { value: "en", label: "English" };
    setSelectedOption(defaultLang);
  }, []);
  const data = [
    {
      title: "Documents",
    },
    {
      title: "Videos",
    },
  ];

  return (
    <>
      <div className="my-5 flex items-center ">
        <Lucide
          icon="ArrowLeftCircle"
          className="w-10 h-10 cursor-pointer my-5 mx-5"
          onClick={() => {
            navigate("/");
          }}
        />
        <h1 className=" text-2xl text-[#1a3b8b] font-bold ">
          QUESTA
        </h1>
      </div>
      <div className="flex items-center justify-end">
        {/* Language selector moved here */}
        <Select
          options={basicOptions}
          placeholder="Select Language..."
          value={selectedOption}
          onChange={handleSelectChange}
          className="w-48 !ring-0 !focus:outline-0 border-0  border-black hover:border hover:border-black"
        />
      </div>
      {loader && <Loading />}
      <div>
        <div className="flex flex-col sm:flex-row relative ">
          <div className={`w-full ${selectedVideo !== null && "sm:w-[30%]"} `}>
            <div className="pl-3 pr-5 md:px-0 md:sticky md:top-2 md:left-0 -mt-8">
              <VideoGallery
                videos={videos}
                handleVideoClick={handleVideoClick}
                selectedVideo={selectedVideo}
              />
            </div>
          </div>
          {selectedVideo !== null && (
            <div className="flex flex-col w-full  md:mt-6 sm:ml-5 md:pt-10">
              <div className="flex flex-col lg:flex-row xl:w-[100%] px-5 ">
                {selectedVideo && (
                  <VideoPlayer
                    video={selectedVideo}
                    statusOfInstance={statusOfInstance}
                  />
                )}
                <ChatBot
                  selectedVideo={selectedVideo}
                  statusOfInstance={statusOfInstance}
                  selectedOption={selectedOption}
                />
              </div>
              <div className="flex lg:w-[60%] items-center text-center justify-center">
                <h3 className="text-primary font-semibold">
                  {selectedVideo?.title}
                </h3>
              </div>

              <div className="flex w-[100%] flex-col lg:flex-row px-5 grow">
                <Summary
                  statusOfInstance={statusOfInstance}
                  selectedVideo={selectedVideo}
                  selectedOption={selectedOption}
                />
                <Assessment
                  selectedVideo={selectedVideo}
                  statusOfInstance={statusOfInstance}
                  selectedOption={selectedOption}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
