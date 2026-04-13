import React, { useEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import { TbMessageChatbot } from "react-icons/tb";
import "../../App.css";
import fetchData from "../../config/ApiCall";
import Avtar from "/genai/assets/q&a.png";
import { LoadingIcon } from "@/base-components";

export const ChatBot = ({
  selectedVideo,
  statusOfInstance,
  selectedChapter,
}) => {
  const [inputMessage, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const chatAreaRef = useRef(null);
  const handleAddunch = async (event) => {
    event.preventDefault();
    let response;
    try {
      if (!inputMessage) {
        setErrorMessage("Enter anything to ask");
      } else {
        setErrorMessage("");
        const newMessage = {
          id: messages.length + 1,
          message: inputMessage,
          isUser: true,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput("");

        let payload = {
          transcript: selectedChapter?.chapter_transcript,
          user_prompt: inputMessage,
          model: "Anthropic",
          source: "ntt",
        };

        const newBotResponse = {
          id: messages.length + 2,
          message: <LoadingIcon icon="three-dots" className="w-8 h-8" />,
          isUser: false,
          backgroundClass: "transparent",
        };
        setMessages((prevMessages) => [...prevMessages, newBotResponse]);

        const url =
          "https://axkxmeog6d.execute-api.ap-south-1.amazonaws.com/dev/qna";
        // "https://ji5x16rpzj.execute-api.ap-south-1.amazonaws.com/dev/qna";
        response = await fetchData(payload, url);
        if (response && response?.statusCode === 200) {
          const formattedResponse = formatQuestionAnswer(response);
          newBotResponse.message = formattedResponse;
          newBotResponse.backgroundClass = "bg-slate-100";

          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === newBotResponse.id ? newBotResponse : msg
            )
          );
        } else if (response?.errorMessage) {
          setErrorMessage("Something went wrong..");
        }
      }
    } catch (error) {
      if (!response) {
        setErrorMessage(
          "Oops! It seems our servers are busy at the moment. Please try again in a few moments."
        );
      } else {
        setErrorMessage("Something went wrong..");
      }
    }
  };

  const formatQuestionAnswer = (response) => {
    if (isQuestionAnswerFormat(response)) {
      const outputLines = response?.Output?.split(/(?=\d\))/).filter(
        (line) => line?.trim() !== ""
      );
      const formattedResponse = outputLines
        ?.map((line) => line?.trim())
        .join("\n\n");

      return formattedResponse;
    }

    return response?.Output;
  };

  const isQuestionAnswerFormat = (response) => {
    return (
      response &&
      response?.Output &&
      response?.Output?.includes("MCQ Questions:") &&
      response?.Output?.includes("a)") &&
      response?.Output?.includes("b)") &&
      response?.Output?.includes("c)") &&
      response?.Output?.includes("d)")
    );
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
      <div className="p-2 border h-full border-primary border-opacity-20  lg:max-h-full rounded-lg w-full  flex flex-col">
        <div className=" flex h-[50px] items-center justify-start py-7 bg-primary text-white font-bold shadow-[0_2px_5px_rgba(0,0,0,0.25)]">
          <img
            src={Avtar}
            className="h-[34px] w-[34px] mx-[10px]"
            alt="user-avatar"
          />
          <span>Q & A </span>
        </div>
        <div
          className="grow bg-white rounded-md p-2 my-2 lg:max-h-[400px]  max-h-[250px] overflow-y-auto"
          ref={chatAreaRef}
        >
          <>
            {!messages.length > 0 ? (
              <div className="flex flex-col items-center w-full h-full justify-center">
                <div className="text-primary flex ">
                  <TbMessageChatbot className="h-[30px] w-12 animate-pulse " />
                  <span className="h-[30px] w-12 animate-pulse mr-2">
                    {"..."}
                  </span>
                </div>
                {statusOfInstance === "Creating" ? (
                  <div className="text-primary w-full flex flex-col justify-center items-center text-center ">
                    <p>Instance is being created...</p>
                    <p>Please wait, this may take some time.</p>
                  </div>
                ) : statusOfInstance === "No_Instance" ? (
                  <div className="text-primary w-full flex flex-col justify-center items-center  text-center ">
                    <p>
                      Currently infrastructure is not up and running, please
                      contact cloudthat team to see the demo{" "}
                    </p>
                  </div>
                ) : statusOfInstance === "Deleting" ? (
                  <div className="text-primary w-full flex flex-col justify-center items-center text-center ">
                    <p>Instance is being deleted...</p>
                    <p>Please wait, this may take some time.</p>
                  </div>
                ) : (
                  <span className="text-primary text-sm">
                    Ask me anything about the video
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="chatarea-outer flex flex-col justify-end">
                  {messages?.map((item, index) => {
                    if (item.isUser) {
                      return (
                        <p
                          key={item.id}
                          className="self-end bg-primary mb-2 text-white px-2 text-sm lg:text-base rounded-lg max-w-[80%] py-1"
                        >
                          {item?.message}
                        </p>
                      );
                    } else {
                      return (
                        <p
                          key={item.id}
                          className={`self-start ${
                            item?.backgroundClass && item.backgroundClass
                          } text-primary text-sm lg:text-base mb-2 px-2 rounded-lg max-w-[80%] py-1`}
                        >
                          {item?.message}
                        </p>
                      );
                    }
                  })}
                </div>
              </>
            )}
            {errorMessage && (
              <div className="text-primary w-full flex flex-col justify-center items-center text-center">
                <p>{errorMessage}</p>
              </div>
            )}
          </>
        </div>
        <form onSubmit={handleAddunch} className="flex gap-2">
          <input
            className="intro-x login__input form-control py-3 px-4 block"
            type="text"
            name="user-message"
            id="user-message"
            value={inputMessage}
            placeholder="Type your question here.."
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className=" disabled:cursor-not-allowed rounded-md p-2 hover:scale-110 flex items-center bg-primary shadow-2xl justify-center w-[20%] ring-0 focus:outline-0 border-none"
            id="send-btn"
            disabled={
              statusOfInstance === "Creating" ||
              statusOfInstance === "No_Instance"
            }
          >
            <BiSend className="text-xl text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
export const Loader = () => {
  return (
    <div className="wrapper">
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="shadow"></div>
      <div className="shadow"></div>
      <div className="shadow"></div>
    </div>
  );
};

export default Loader;
