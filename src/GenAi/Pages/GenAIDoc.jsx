import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Lucide from "../../base-components/lucide/index";
import UserContext from "../../Context/UserContext";
import { Assessment } from "../PagesComponents/Assessment";
import DocRead from "../PagesComponents/DocRead";
import { Summary } from "../PagesComponents/Summary";
import VideoGallery from "../PagesComponents/VideoGallery";
import { JSONdATA } from "../utils/GenAIDoc.js";

export const GenAIDoc = () => {
  const { userDetails, userState, setUserState } = useContext(UserContext);
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loader, setLoader] = useState(false);
  const [statusOfInstance, setStatusOfInstance] = useState("InService");
  const [selectedOption, setSelectedOption] = useState({
    value: "hs",
    label: "History",
  });
  const [filteredData, setFilteredData] = useState([]);

  const basicOptions = [
    { value: "hs", label: "History" },
    { value: "math", label: "Mathematics" },
  ];

  const handleSelectChange = (option) => {
    setSelectedOption(option);
    const selectedKey = option.value === "math" ? "math" : "history";
    const selectedData = JSONdATA[selectedKey];
    const formattedData = Object.entries(selectedData).map(([title, sources], index) => ({
      id: index + 1,
      title: formatTitle(title),
      source: sources[0],
      transcription: sources[1],
    }));
    setFilteredData(formattedData);
    setSelectedVideo(formattedData[0] || null);
  };

  const formatTitle = (title) => title.replaceAll("__", " - ").replaceAll("_", " ");

  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
    const defaultData = Object.entries(JSONdATA.history).map(([title, sources], index) => ({
      id: index + 1,
      title: formatTitle(title),
      source: sources[0],
      transcription: sources[1],
    }));
    setFilteredData(defaultData);
    setSelectedVideo(defaultData[0]);
  }, []);

  return (
    <>
      <div className="my-5 flex items-center ">
        <Lucide icon="ArrowLeftCircle" className="w-10 h-10 cursor-pointer my-5 mx-5" onClick={() => navigate("/")} />
        <h1 className=" text-2xl text-[#1a3b8b] font-bold ">GenAI Docs</h1>
      </div>
      {loader && <Loading />}
      <div>
        <div className="flex flex-col sm:flex-row relative ">
          <div className={`w-full ${selectedVideo !== null && "sm:w-[30%]"}`}>
            <div className="md:py-10 lg:py-5 py-5 px-5 md:px-0 md:sticky md:top-2 md:left-0 ">
              <VideoGallery
                videos={filteredData}
                handleVideoClick={setSelectedVideo}
                selectedVideo={selectedVideo}
                type="doc"
                basicOptions={basicOptions}
                selectedOption={selectedOption}
                handleSelectChange={handleSelectChange}
              />
            </div>
          </div>
          {selectedVideo !== null && (
            <div className="flex flex-col w-full  md:mt-6 sm:ml-5 md:pt-10">
              <div className="flex flex-col lg:flex-row xl:w-[100%] px-5 ">
                {selectedVideo && (
                  <DocRead video={selectedVideo} statusOfInstance={statusOfInstance} selectedOption={selectedOption} />
                )}
                <Assessment
                  selectedVideo={selectedVideo}
                  statusOfInstance={statusOfInstance}
                  type="doc"
                  selectedOption={selectedOption}
                />
              </div>
              <div className="flex lg:w-[60%] items-center text-center justify-center">
                <h3 className="text-primary">{selectedVideo?.title}</h3>
              </div>

              <div className="flex w-[100%]  flex-col lg:flex-row px-5 grow">
                <Summary
                  statusOfInstance={statusOfInstance}
                  selectedVideo={selectedVideo}
                  type="doc"
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
