import { Lucide, Modal, ModalBody } from "@/base-components";
import { Sparkles, SquareX } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../Context/UserContext";
import fetchData from "../config/ApiCall";
import { TabSwitchWarning } from "./TabSwitchAlert";
import { VideoGeneratorUI } from "./VideoGeneratorUI";
import { VideoGroupDisplay } from "./VideoGroupDisplay";

export const ContentGenerate = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("generate");
  const [videoGroups, setVideoGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chunks, setChunks] = useState(1);
  const [seed, setSeed] = useState(0);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validUser, setValidUser] = useState(true); // Changed to true to bypass secret code
  const [secretCode, setSecretCode] = useState("");
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState(false);
  const [maxHeight, setMaxHeight] = useState("600px");
  const { userDetails } = useContext(UserContext);

  const fetchVideoGroups = async () => {
    try {
      setError(null);
      setLoading(true);
      const url = import.meta.env.VITE_VIDEO_GEN_API_URL;
      const payload = {
        user_email: userDetails?.attributes?.email,
        action: "get_user_data",
      };

      const response = await fetchData(payload, url);

      if (response?.statusCode !== 200) {
        throw new Error("Failed to fetch video history.");
      }

      const formattedHistory = Array.isArray(response?.status?.video_description)
        ? response?.status?.video_description.map((descriptions, index) => {
            const timestamps = response?.status?.video_timestamp || [];
            const taglines = response?.status?.tag_line || [];
            const mergedVideoLocations = response?.status?.merged_video_location || [];
            const objectLocations = response?.status?.object_location || [];

            return {
              id: Date.now() + index,
              prompt: "Historical Data",
              timestamp: timestamps[index] || null, // Default to null if out of bounds
              userEmail: response?.status?.id || "",
              tagline: taglines[index] || "",
              mergedVideoLink: mergedVideoLocations[index] || "",
              videos: Array.isArray(descriptions)
                ? descriptions.map((description, videoIndex) => ({
                    id: Date.now() + videoIndex,
                    videoUrl: objectLocations[index]?.[videoIndex] || "",
                    description,
                    prompt: "Historical Data",
                    date: timestamps[index] || "",
                    status: "completed",
                  }))
                : [],
            };
          })
        : []; // Default to an empty array if video_description is not iterable

      const sortedHistory = Array.isArray(formattedHistory)
        ? formattedHistory.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA; // Sort in descending order
          })
        : [];

      setVideoGroups((prev) => [...sortedHistory]);
    } catch (error) {
      console.error("Error fetching video history:", error);
      setError("Failed to fetch video history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkVideoAccessibility = async (url) => {
    try {
      const videoResponse = await fetch(url, { method: "GET" });
      return videoResponse.ok;
    } catch (err) {
      return false;
    }
  };
  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    try {
      setError(null);
      setVideoGroups([]);
      setLoading(true);
      let payload = {
        prompt_instruction: prompt?.trim(),
        number_of_chunks: chunks,
        action: "video_generation",
        seed_value: seed,
        user_email: userDetails?.attributes?.email,
      };
      const url = import.meta.env.VITE_VIDEO_GEN_API_URL;
      const response = await fetchData(payload, url);
      if (response?.statusCode !== 200) {
        const errorMessage = response?.error?.content ?? "Failed to generate video";
        throw new Error(errorMessage);
      }

      const allVideosAccessible = async (urls, maxRetries = 30, delay = 30000) => {
        let retries = 0;

        while (retries < maxRetries) {
          const accessibilityChecks = await Promise.all(urls.map((url) => checkVideoAccessibility(url)));

          if (accessibilityChecks.every((isAccessible) => isAccessible)) {
            return true;
          }

          await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
          retries++;
        }

        return false;
      };
      const videoUrls = response?.destination_folders;
      const isAccessible = await allVideosAccessible(videoUrls);
      if (!isAccessible) {
        throw new Error("Videos are taking too long to generate. Please try again later.");
      }
      const newVideoGroup = {
        id: Date.now(),
        prompt,
        timestamp: new Date().toISOString(),
        userEmail: response?.user_email,
        tagline: response?.tagline,
        videos: response?.video_description?.map((description, index) => ({
          id: Date.now() + index,
          videoUrl: response?.destination_folders[index],
          description,
          prompt,
          date: new Date().toISOString(),
          status: "completed",
        })),
      };

      setVideoGroups((prev) => [newVideoGroup, ...prev]);
      setPrompt("");
      if (isAccessible) {
        mergeVideos(videoUrls, newVideoGroup?.id);
      }
    } catch (err) {
      console.error("err", err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (video, merge = false) => {
    if (merge) {
      setSelectedVideo({
        videoUrl: video,
        description: "",
      });
    } else {
      setSelectedVideo(video);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setIsModalOpen(false);
  };

  const mergeVideos = async (videoUrls, videoGroupId) => {
    if (!videoUrls) {
      setError("Failed to generate videos. Please try again.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const url = import.meta.env.VITE_VIDEO_GEN_API_URL + '/merge_video';
      const payload = {
        user_email: userDetails?.attributes?.email,
        action: "merge_video",
        object_location: videoUrls,
      };

      const response = await fetchData(payload, url);
      if (response.statusCode !== 200) {
        throw new Error("Failed to generate video");
      }

      const videoUrl = response?.object_URL;

      const isAccessible = await checkVideoAccessibility(videoUrl);

      if (!isAccessible) {
        throw new Error("Videos are taking too long to generate. Please try again later.");
      }

      setVideoGroups((prevVideoGroups) =>
        prevVideoGroups?.map((group) =>
          group.id === videoGroupId
            ? {
                ...group,
                mergedVideoLink: videoUrl,
              }
            : group
        )
      );
    } catch (error) {
      console.error(err);
      setError("Failed to generate videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleTabChange = (newTab) => {
    if (loading) {
      setShowTabWarning(true);
      setPendingTabChange(newTab);
    } else {
      setActiveTab(newTab);
      if (newTab === "all-videos") {
        setVideoGroups([]);
        if (userDetails) {
          fetchVideoGroups();
        }
      }
    }
  };

  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
    const updateMaxHeight = () => {
      const contentElement = document.querySelector(".content");
      if (contentElement && validUser) {
        // Store the original min-height value to restore it when component unmounts
        const originalMinHeight = contentElement.style.minHeight;
        //contentElement.style.minHeight = 'auto';
      }
      // Get viewport height
      const viewportHeight = window.innerHeight;

      // Calculate approximate heights of other elements
      const headerHeight = 70; // Height of the top navigation
      const tabsHeight = 110; // Height of the tab buttons
      const inputAreaHeight = activeTab === "generate" ? 300 : 0; // Approximate height of input area
      const padding = 48; // Additional padding/margins

      // Calculate available space
      const availableHeight = viewportHeight - (headerHeight + tabsHeight + inputAreaHeight + padding);

      // Set a minimum height to prevent the area from becoming too small
      const finalHeight = Math.max(400, availableHeight);

      setMaxHeight(`${finalHeight - 50}px`);
    };
    // Initial calculation

    updateMaxHeight();

    // Update on window resize
    window.addEventListener("resize", updateMaxHeight);
    return () => {
      window.removeEventListener("resize", updateMaxHeight);
      // Restore the original min-height when component unmounts
      const contentElement = document.querySelector(".content");
      if (contentElement && !validUser) {
        contentElement.style.minHeight = "100vh"; // or restore to original value if needed
      }
    };
  }, [activeTab]);

  return (
    <>
      {/* {validUser ? ( */}
      {true && (
        <>
          <div className="my-5 flex items-center ">
            <Lucide
              icon="ArrowLeftCircle"
              className="w-10 h-10 cursor-pointer my-5 mx-5"
              onClick={() => navigate("/")}
            />
            <h1 className=" text-2xl text-[#1a3b8b] font-bold ">Vistora</h1>
          </div>

          <div className="intro-y box">
            <div className="border-b border-slate-200">
              <div className="flex max-w-4xl pt-2  ">
                <button
                  // onClick={() => {
                  //   setActiveTab('all-videos');
                  //   setVideoGroups([]);
                  //   if (userDetails) {
                  //     fetchVideoGroups();
                  //   }
                  // }}
                  onClick={() => {
                    handleTabChange("all-videos");
                  }}
                  className={`
                    px-6 py-3 text-sm font-medium transition-colors
                    ${
                      activeTab === "all-videos"
                        ? "border-b-2 border-[#1e3b8b] text-[#1e3b8b]"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                    }
                  `}
                >
                  Content Library
                </button>
                <button
                  onClick={() => {
                    setActiveTab("generate");
                    setVideoGroups([]);
                  }}
                  className={`
                    px-6 py-3 text-sm font-medium transition-colors
                    ${
                      activeTab === "generate"
                        ? "border-b-2 border-[#1e3b8b] text-[#1e3b8b]"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                    }
                  `}
                >
                  Create Content
                </button>
              </div>
            </div>

            <div className="p-2">
              {activeTab === "all-videos" ? (
                <div className="space-y-8  overflow-y-scroll  min-h-[400px] custom-scrollbar" style={{ maxHeight }}>
                  {error && <div className="alert alert-danger mb-4">{error}</div>}
                  {!videoGroups?.length > 0 && !loading && !error && (
                    <div className="flex flex-col items-center justify-center mx-auto w-full text-center p-10 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Content Yet</h3>
                      <p className="text-gray-500 max-w-md mb-6">
                        Your generated content will appear here. Start creating new content using the "Create Content"
                        tab above.
                      </p>
                      <button
                        className="px-4 py-2 bg-[#1e3b8b] text-white rounded-md hover:bg-[#1e3b8b] transition-colors"
                        onClick={() => setActiveTab("generate")}
                      >
                        Create Your First Content
                      </button>
                    </div>
                  )}
                  {loading && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm text-slate-600 mb-3">Loading...</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-2">
                        <div className="relative aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                          <Lucide icon="Loader" className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      </div>
                    </div>
                  )}
                  {videoGroups?.map((group, index) => (
                    <VideoGroupDisplay
                      tab={activeTab}
                      key={group?.id}
                      group={group}
                      openModal={openModal}
                      error={error}
                      loading={loading}
                      videoGroups={videoGroups}
                      videoIndex={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="intro-y box ">
                  <div className="space-y-8  overflow-y-scroll custom-scrollbar min-h-[300px]" style={{ maxHeight }}>
                    {error && <div className="alert alert-danger mb-4">{error}</div>}
                    {!videoGroups?.length > 0 && !loading && !error && (
                      <div className=" flex w-full mx-auto flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-lg">
                        <div className="mb-6 flex gap-4">
                          <Sparkles className="w-12 h-12 text-[#1e3b8b]" />
                        </div>

                        <h3 className="text-xl font-semibold text-slate-800 mb-3">Ready to Create Amazing Content</h3>

                        <p className="text-slate-600 mb-6 max-w-md">
                          Generate engaging videos and marketing content using AI. Start by entering a prompt like 'How
                          to make pizza' or 'Salad with vegetables'.
                        </p>

                        <div className="flex flex-col gap-2 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              1
                            </span>
                            <span>Enter a descriptive prompt</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              2
                            </span>
                            <span>Click 'Create Content' to generate your video</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {loading && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-slate-600 mb-3">Loading...</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-2">
                          <div className="relative aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                            <Lucide icon="Loader" className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        </div>
                      </div>
                    )}

                    {videoGroups?.map((group, index) => (
                      <VideoGroupDisplay
                        tab={activeTab}
                        key={group?.id}
                        group={group}
                        openModal={openModal}
                        error={error}
                        loading={loading}
                        videoGroups={videoGroups}
                        videoIndex={index + 1}
                      />
                    ))}
                  </div>

                  <VideoGeneratorUI
                    prompt={prompt}
                    setPrompt={setPrompt}
                    chunks={chunks}
                    setChunks={setChunks}
                    seed={seed}
                    setSeed={setSeed}
                    generateVideo={generateVideo}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* End of commented validUser check */}

      {/* Commented out secret code functionality
      {!validUser && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
          <div className="bg-white p-5 flex flex-col w-1/3 h-auto box">
            <h1 className="text-center text-2xl font-semibold text-primary my-4">Please Enter Secret Code</h1>
            <div className="flex flex-col justify-center items-center mt-5">
              <input
                type="password"
                className="intro-x login__input form-control py-3 px-4 block my-2 xl:w-[22rem]"
                placeholder="Enter Secret Code"
                onChange={(e) => {
                  setError('');
                  setSecretCode(e.target.value);
                }}
              />
              <button
                className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top my-5"
                onClick={() => {
                  if (secretCode === 'AIContent#2o25@') {
                    setValidUser(true);
                  } else {
                    setError('Please enter valid secret code');
                  }
                }}
              >
                Validate
              </button>
            </div>
            {error !== '' && <p className="text-red-500 text-center">{error}</p>}
          </div>
        </div>
      )}
      */}

      <Modal
        show={isModalOpen}
        size="modal-xl"
        onHidden={() => {
          setSelectedVideo(null);
          setIsModalOpen(false);
        }}
        className=""
      >
        <ModalBody className="p-6 bg-white rounded-md">
          <div className="bg-white flex items-center flex-col">
            <button
              className="absolute top-0 right-0 pt-2 pr-4 text-2xl text-gray-600 hover:text-gray-800 hover:scale-110"
              onClick={closeModal}
            >
              <SquareX />
            </button>
            <video
              src={selectedVideo?.videoUrl}
              controls
              autoPlay
              className="w-[80%]  h-auto rounded-lg"
              type="video/mp4"
              loop
            />
            <div className="text-center text-black mt-2">{selectedVideo?.description}</div>
          </div>
        </ModalBody>
      </Modal>
      <TabSwitchWarning
        isOpen={showTabWarning}
        onClose={() => {
          setShowTabWarning(false);
          setPendingTabChange(false);
        }}
        onConfirm={() => {
          setShowTabWarning(false);
          setActiveTab(pendingTabChange);
          if (pendingTabChange === "all-videos") {
            setVideoGroups([]);
            if (userDetails) {
              fetchVideoGroups();
            }
          }
        }}
      />
    </>
  );
};

export const CustomSlider = ({ seed, setSeed }) => {
  const min = 0;

  const max = 2147483646;

  return (
    <div className="relative w-full ">
      <div
        className={`
          absolute -top-1 transform -translate-y-full
          bg-white border-2 border-[#1e3b8b] rounded-lg px-3 py-1
          text-[#1e3b8b] font-semibold text-sm
          transition-opacity duration-200
        
          ${seed > 0 ? "opacity-100" : "opacity-0 hover:opacity-100"}
        `}
        style={{
          left: `${((seed - min) / (max - min)) * 100}%`,
          transform: "translateX(-50%) translateY(-100%)",
        }}
      >
        {seed}

        <div
          className="absolute -bottom-1 left-1/2 w-2 h-2 
                     bg-white border-r-2 border-b-2 border-[#1e3b8b]
                     transform rotate-45 -translate-x-1/2"
        />
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={2147483646}
          value={seed}
          onChange={(e) => setSeed(Number(e.target.value))}
          className="
            w-full h-2 rounded-full appearance-none cursor-pointer
            
            bg-[#1e3b8b]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#1e3b8b]
            [&::-webkit-slider-thumb]:border-4
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#1e3b8b]
            [&::-moz-range-thumb]:border-4
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:shadow-lg
            [&::-ms-thumb]:appearance-none
            [&::-ms-thumb]:w-6
            [&::-ms-thumb]:h-6
            [&::-ms-thumb]:rounded-full
            [&::-ms-thumb]:bg-[#1e3b8b]
            [&::-ms-thumb]:border-4
            [&::-ms-thumb]:border-white
            [&::-ms-thumb]:shadow-lg
          "
        />
      </div>
    </div>
  );
};
