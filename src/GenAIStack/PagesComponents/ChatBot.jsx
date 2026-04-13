import React, { useContext, useEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import { TbMessageChatbot } from "react-icons/tb";
import "../../App.css";
import fetchData from "../../config/ApiCall";
import Avtar from "/genai/assets/q&a.png";
import UserContext from "../../Context/UserContext";
import { LoadingIcon } from "@/base-components";

export const ChatBot = ({ selectedVideo, statusOfInstance }) => {
  const { userDetails } = useContext(UserContext);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const chatAreaRef = useRef(null);

  const handleAddMessage = async (event) => {
    event.preventDefault();
    if (!inputMessage.trim()) {
      setErrorMessage("Enter anything to ask");
      return;
    }

    setErrorMessage("");
    const userMessage = { id: Date.now(), message: inputMessage, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    const botResponse = {
      id: Date.now() + 1,
      message: <LoadingIcon icon="three-dots" className="w-8 h-8" />,
      isUser: false,
      backgroundClass: "transparent",
    };
    setMessages((prev) => [...prev, botResponse]);

    try {
      const payload = {
        transcript: selectedVideo?.transcriptJson,
        user_prompt: inputMessage,
        source: "hpe",
      };
      const url =
        "https://nfbzmob411.execute-api.ap-south-1.amazonaws.com/v1/QnA";
      const response = await fetchData(payload, url);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botResponse.id
            ? {
                ...botResponse,
                message:
                  response?.statusCode === 200
                    ? response.Output
                    : "Something went wrong..",
                backgroundClass:
                  response?.statusCode === 200 ? "bg-slate-100" : "",
              }
            : msg
        )
      );
    } catch (error) {
      console.error("API Error:", error);
      setErrorMessage("Oops! Our servers are busy. Please try again later.");
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
  }, [selectedVideo]);

  return (
    <div className="bg-white lg:w-[40%] w-full lg:h-[400px] h-full lg:p-5 p-2 lg:m-5 my-5 rounded-lg">
      <div className="p-2 border h-full border-primary border-opacity-20 rounded-lg flex flex-col">
        {/* Header */}
        <div className="flex h-[50px] items-center py-7 bg-primary text-white font-bold shadow-md">
          <img
            src={Avtar}
            className="h-[34px] w-[34px] mx-[10px]"
            alt="Q&A Avatar"
          />
          <span>Q & A</span>
        </div>

        {/* Chat Area */}
        <div
          className="grow bg-white rounded-md p-2 my-2 lg:max-h-[400px] max-h-[250px] overflow-y-auto custom-scrollbar-assess"
          ref={chatAreaRef}
        >
          {!messages.length ? (
            <EmptyState statusOfInstance={statusOfInstance} />
          ) : (
            <div className="chatarea-outer flex flex-col justify-end">
              {messages.map(({ id, message, isUser, backgroundClass }) => (
                <p
                  key={id}
                  className={`mb-2 px-2 py-1 rounded-lg max-w-[80%] ${
                    isUser
                      ? "self-end bg-primary text-white"
                      : `self-start text-primary ${backgroundClass}`
                  } text-sm lg:text-base`}
                >
                  {message}
                </p>
              ))}
            </div>
          )}
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>

        {/* Input Area */}
        <form onSubmit={handleAddMessage} className="flex gap-2">
          <input
            className="intro-x login__input form-control py-3 px-4 block"
            type="text"
            name="user-message"
            id="user-message"
            value={inputMessage}
            placeholder="Type your question here.."
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button
            type="submit"
            className="disabled:cursor-not-allowed btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
            id="send-btn"
            disabled={["Creating", "No_Instance"].includes(statusOfInstance)}
          >
            <BiSend className="text-xl text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

/** Components */
const EmptyState = ({ statusOfInstance }) => {
  const statusMessages = {
    Creating:
      "Instance is being created... Please wait, this may take some time.",
    No_Instance:
      "Infrastructure is not up and running. Contact CloudThat team for a demo.",
    Deleting:
      "Instance is being deleted... Please wait, this may take some time.",
  };

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <div className="text-primary flex">
        <TbMessageChatbot className="h-[30px] w-12 animate-pulse" />
        <span className="h-[30px] w-12 animate-pulse mr-2">{"..."}</span>
      </div>
      <div className="text-primary w-full flex flex-col justify-center items-center text-center">
        <p>
          {statusMessages[statusOfInstance] ||
            "Ask me anything about the video"}
        </p>
      </div>
    </div>
  );
};

const ErrorMessage = ({ message }) => (
  <div className="text-primary w-full flex flex-col justify-center items-center text-center">
    <p>{message}</p>
  </div>
);
