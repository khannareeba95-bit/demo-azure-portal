import { Auth } from "aws-amplify";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import UserContext from "../../Context/UserContext.js";
import { ChatBot } from "../PagesComponents/ChatBot.jsx";
import { Summary } from "../PagesComponents/Summary.jsx";
import VideoGallery from "../PagesComponents/VideoGallery.jsx";
import VideoPlayer from "../PagesComponents/VideoPlayer.jsx";
import { JSONdATA } from "../utils/Constant.js";
import Select from "react-select";
import Lucide from "../../base-components/lucide/index";

export const GenAIJAM = () => {
  const { userDetails, userState, setUserState } = useContext(UserContext);
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
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
      thumbnail: `/genai/assets/GenAIJAM.png`,
      source: sources[0],
      transcript: sources[1],
    };
  });

  useEffect(() => {
    document.title = "Generative AI";
    window.localStorage.setItem("currentPage", window.location.pathname);
    setSelectedVideo(videos[0]);
    const defaultLang = { value: "en", label: "English" };
    setSelectedOption(defaultLang);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <Lucide
          icon="ArrowLeftCircle"
          className="w-10 h-10 cursor-pointer my-5 mx-5"
          onClick={() => {
            navigate("/");
          }}
        />
        <Select
          options={basicOptions}
          placeholder="Select Language..."
          value={selectedOption}
          onChange={handleSelectChange}
          className="w-48 !ring-0 focus:outline-0 border border-black hover:border-black"
        />
      </div>

      <div className="flex flex-col sm:flex-row relative ">
        <div className={`w-full ${selectedVideo !== null && "sm:w-[30%]"} `}>
          <div className="md:py-10 lg:py-5 py-5 px-5 md:px-0 md:sticky md:top-2 md:left-0 ">
            <VideoGallery
              videos={videos}
              handleVideoClick={handleVideoClick}
              selectedVideo={selectedVideo}
            />
          </div>
        </div>

        {selectedVideo !== null && (
          <div className="flex flex-row w-full  md:mt-6 sm:ml-5 md:pt-10">
            <div className="flex flex-col  w-[60%] px-5  ">
              {selectedVideo && (
                <VideoPlayer
                  video={selectedVideo}
                  statusOfInstance={statusOfInstance}
                />
              )}
              <div className="flex  items-center text-center justify-center">
                <h3 className="text-primary">{selectedVideo?.title}</h3>
              </div>
              <Summary
                statusOfInstance={statusOfInstance}
                selectedVideo={selectedVideo}
                selectedOption={selectedOption}
              />
            </div>

            <div className="flex w-[40%] flex-col lg:flex-row px-5 grow ">
              <ChatBot
                selectedVideo={selectedVideo}
                statusOfInstance={statusOfInstance}
                selectedOption={selectedOption}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
