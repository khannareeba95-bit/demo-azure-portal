import React, { useContext, useEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { LoadingIcon } from "@/base-components";
import { TbMessageChatbot } from "react-icons/tb";
import "../../App.css";
import fetchData from "../../config/ApiCall";
import Avtar from "/genai/assets/q&a.png";
import UserContext from "../../Context/UserContext";

export const ChatBot = ({
  selectedVideo,
  statusOfInstance,
  selectedOption,
}) => {
  const { userDetails } = useContext(UserContext);
  const [inputMessage, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const chatAreaRef = useRef(null);
  const [likeDislikeStatus, setLikeDislikeStatus] = useState({});
  const [showThumbs, setShowThumbs] = useState({});

  const handleLikeDislikeClick = (id, type) => {
    setLikeDislikeStatus((prevState) => {
      const currentLikeDislike = prevState[id] || {};
      const newState = {
        ...prevState,
        [id]: {
          ...currentLikeDislike,
          like: type === "like" ? !currentLikeDislike.like : false,
          dislike: type === "dislike" ? !currentLikeDislike.dislike : false,
        },
      };

      return newState;
    });
  };

  const handleAddunch = async (event) => {
    event.preventDefault();
    if (!inputMessage) {
      setErrorMessage("Enter anything to ask");
      return;
    }

    setErrorMessage("");
    const newMessage = {
      id: messages.length + 1,
      message: inputMessage,
      isUser: true,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setShowThumbs((prevState) => ({ ...prevState, [newMessage.id]: false }));

    const payload = {
      transcript: selectedVideo?.transcript,
      user_prompt: inputMessage,
      flag: selectedOption?.value !== "en" ? selectedOption?.value : undefined,
    };

    const newBotResponse = {
      id: messages.length + 2,
      message: (
        <LoadingIcon icon="three-dots" className="w-8 h-8 inline-block" />
      ),
      isUser: false,
      backgroundClass: "transparent",
      loader: true,
    };
    setMessages((prevMessages) => [...prevMessages, newBotResponse]);

    try {
      const url =
        "https://e9mm7a5z2g.execute-api.ap-south-1.amazonaws.com/dev/QnA";
      const response = await fetchData(payload, url);

      newBotResponse.message =
        response?.statusCode === 200
          ? response?.Output
          : "Something went wrong..";
      newBotResponse.backgroundClass = "bg-gray-300";

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newBotResponse.id ? newBotResponse : msg
        )
      );
      setLikeDislikeStatus((prevState) => ({
        ...prevState,
        [newBotResponse.id]: { like: false, dislike: false },
      }));

      setShowThumbs((prevState) => ({
        ...prevState,
        [newBotResponse.id]: true,
      }));
    } catch (error) {
      console.log("error", error);
      setErrorMessage(
        "Oops! It seems our servers are busy at the moment. Please try again in a few moments."
      );
    }
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setErrorMessage("");
    setShowThumbs(false);
  }, [selectedVideo]);

  const renderErrorMessage = () =>
    errorMessage && (
      <div className="text-primary w-full flex flex-col justify-center items-center text-center">
        <p>{errorMessage}</p>
      </div>
    );

  const renderMessages = () =>
    messages.map((item) => {
      const isLiked = likeDislikeStatus[item.id]?.like;
      const isDisliked = likeDislikeStatus[item.id]?.dislike;

      return item.isUser ? (
        <p
          key={item.id}
          className="self-end bg-primary my-4 text-white px-2 text-sm lg:text-base rounded-lg max-w-[80%] py-1"
        >
          {item.message}
        </p>
      ) : (
        <div key={item.id}>
          <p
            className={`self-start ${item.backgroundClass} text-primary text-sm lg:text-base mb-2 px-2 rounded-lg max-w-[80%] py-1`}
          >
            {item.message}
          </p>
          <div className="flex items-center space-x-2 w-[80%] justify-end">
            {showThumbs[item.id] && (
              <div className="flex items-center space-x-2 w-[80%] justify-end">
                <ThumbsUp
                  className={`cursor-pointer h-4 w-4 ${
                    isLiked ? "text-green-500" : "text-gray-500"
                  }`}
                  onClick={() => handleLikeDislikeClick(item.id, "like")}
                />
                <ThumbsDown
                  className={`cursor-pointer h-4 w-4 ${
                    isDisliked ? "text-red-500" : "text-gray-500"
                  }`}
                  onClick={() => handleLikeDislikeClick(item.id, "dislike")}
                />
              </div>
            )}
          </div>
        </div>
      );
    });

  return (
    <>
      <div className="bg-white w-full lg:h-[600px] h-full lg:p-5 p-2 my-5 rounded-lg">
        <div className="p-2 border h-full border-primary border-opacity-20 lg:max-h-full rounded-lg w-full flex flex-col">
          <div className="flex h-[50px] items-center justify-start py-7 bg-primary text-white font-bold shadow-md">
            <img
              src={Avtar}
              className="h-[34px] w-[34px] mx-[10px]"
              alt="user-avatar"
            />
            <span>Q & A </span>
          </div>
          <div
            className="grow bg-white rounded-md p-2 my-2 lg:max-h-[400px] max-h-[250px] overflow-y-auto custom-scrollbar-assess"
            ref={chatAreaRef}
          >
            {!messages.length > 0 ? (
              <div className="flex flex-col items-center w-full h-full justify-center">
                <div className="text-primary flex">
                  <TbMessageChatbot className="h-[30px] w-12 animate-pulse" />
                  <span className="h-[30px] w-12 animate-pulse mr-2">...</span>
                </div>
                {statusOfInstance === "Creating" && (
                  <div className="text-primary w-full flex flex-col justify-center items-center text-center">
                    <p>Instance is being created...</p>
                    <p>Please wait, this may take some time.</p>
                  </div>
                )}
                {statusOfInstance === "No_Instance" && (
                  <div className="text-primary w-full flex flex-col justify-center items-center text-center">
                    <p>
                      Currently infrastructure is not up and running, please
                      contact cloudthat team to see the demo
                    </p>
                  </div>
                )}
                {statusOfInstance === "Deleting" && (
                  <div className="text-primary w-full flex flex-col justify-center items-center text-center">
                    <p>Instance is being deleted...</p>
                    <p>Please wait, this may take some time.</p>
                  </div>
                )}
                {!["Creating", "No_Instance", "Deleting"].includes(
                  statusOfInstance
                ) && (
                  <span className="text-primary text-sm">
                    Ask me anything about the video
                  </span>
                )}
              </div>
            ) : (
              <div className="chatarea-outer flex flex-col justify-end">
                {renderMessages()}
              </div>
            )}
            {renderErrorMessage()}
          </div>
          <form onSubmit={handleAddunch} className="flex gap-2">
            <input
              className="intro-x login__input form-control py-3 px-4 block"
              type="text"
              value={inputMessage}
              placeholder="Type your question here.."
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="disabled:cursor-not-allowed rounded-md p-2 hover:scale-110 flex items-center bg-primary shadow-md justify-center w-[20%] ring-0 focus:outline-0 border-none"
              id="send-btn"
              disabled={
                statusOfInstance === "Creating" ||
                statusOfInstance === "No_Instance" ||
                !userDetails
              }
            >
              <BiSend className="text-xl text-white" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
