import React, { useContext, useEffect, useRef, useState } from 'react';
import { BiSend, BiError } from 'react-icons/bi';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { LoadingIcon } from '@/base-components';
import { TbMessageChatbot } from 'react-icons/tb';
import '../../App.css';
import fetchData from '../../config/ApiCall';
import Avtar from '/genai/assets/q&a.png';
import UserContext from '../../Context/UserContext';

export const ChatBot = ({ selectedVideo, statusOfInstance }) => {
  const { userDetails } = useContext(UserContext);
  const [inputMessage, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const chatAreaRef = useRef(null);

  const [likeDislikeStatus, setLikeDislikeStatus] = useState({});

  const handleLikeClick = (id) => {
    setLikeDislikeStatus((prevState) => ({
      ...prevState,
      [id]: {
        like: !prevState[id]?.like,
        dislike: prevState[id]?.dislike ? false : prevState[id]?.dislike,
      },
    }));
  };

  const handleDislikeClick = (id) => {
    setLikeDislikeStatus((prevState) => ({
      ...prevState,
      [id]: {
        like: prevState[id]?.like ? false : prevState[id]?.like,
        dislike: !prevState[id]?.dislike,
      },
    }));
  };

  const handleAddunch = async (event) => {
    event.preventDefault();
    let response;
    try {
      if (!inputMessage) {
        setErrorMessage('Enter anything to ask');
      } else {
        setErrorMessage('');
        const newMessage = {
          id: messages.length + 1,
          message: inputMessage,
          isUser: true,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput('');

        let payload = {
          transcript: selectedVideo?.transcription,
          user_prompt: inputMessage,
          source: 'documents_resume',
        };

        const newBotResponse = {
          id: messages.length + 2,
          message: <LoadingIcon icon="three-dots" className="w-8 h-8" />,
          isUser: false,
          backgroundClass: 'transparent',
          loader: true,
        };
        setMessages((prevMessages) => [...prevMessages, newBotResponse]);

        const url = 'https://tyfqdb1le2.execute-api.ap-south-1.amazonaws.com/dev/qna';
        //cloudattack acc api
        // "https://v0jjxw3ivi.execute-api.ap-south-1.amazonaws.com/dev/qna";
        response = await fetchData(payload, url);

        if (response && response.statusCode === 200 && response.Output) {
          newBotResponse.message = response.Output;
          newBotResponse.backgroundClass = 'bg-gray-300';

          setMessages((prevMessages) =>
            prevMessages.map((msg) => (msg.id === newBotResponse.id ? newBotResponse : msg))
          );
        } else {
          newBotResponse.message = response?.errorMessage || 'Something went wrong. Please try again.';
          newBotResponse.backgroundClass = 'bg-slate-100';
          setMessages((prevMessages) =>
            prevMessages.map((msg) => (msg.id === newBotResponse.id ? newBotResponse : msg))
          );
        }
      }
    } catch (error) {
      console.log('error', error);
      if (!response) {
        setErrorMessage('Oops! It seems our servers are busy at the moment. Please try again in a few moments.');
      } else {
        setErrorMessage('Something went wrong..');
      }
    }
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setErrorMessage('');
  }, [selectedVideo]);

  return (
    <div className="bg-white w-full lg:h-[600px] h-full lg:p-5 p-2 lg:m-5 my-5 rounded-lg">
      <div className="p-2 border h-full border-primary border-opacity-20 lg:max-h-full rounded-lg w-full flex flex-col">
        <div className="flex h-[50px] items-center justify-start py-7 bg-primary text-white font-bold shadow-md">
          <img src={Avtar} className="h-[34px] w-[34px] mx-[10px]" alt="user-avatar" />
          <span>Q & A </span>
        </div>
        <div
          className="grow bg-white rounded-md p-2 my-2 lg:max-h-[800px] max-h-[250px] overflow-y-auto"
          ref={chatAreaRef}
        >
          <>
            {!messages.length > 0 ? (
              <div className="flex flex-col items-center w-full h-full justify-center">
                <div className="text-primary flex">
                  <TbMessageChatbot className="h-[30px] w-12 animate-pulse " />
                  <span className="h-[30px] w-12 animate-pulse mr-2">{'...'}</span>
                </div>
                {statusOfInstance === 'Creating' ? (
                  <div className="text-primary w-full flex flex-col justify-center items-center text-center ">
                    <p>Instance is being created...</p>
                    <p>Please wait, this may take some time.</p>
                  </div>
                ) : statusOfInstance === 'No_Instance' ? (
                  <div className="text-primary w-full flex flex-col justify-center items-center text-center ">
                    <p>
                      Currently infrastructure is not up and running, please contact the CloudThat team to see the demo.
                    </p>
                  </div>
                ) : statusOfInstance === 'Deleting' ? (
                  <div className="text-primary w-full flex flex-col justify-center items-center text-center ">
                    <p>Instance is being deleted...</p>
                    <p>Please wait, this may take some time.</p>
                  </div>
                ) : (
                  <span className="text-primary text-sm">Ask me anything about the video</span>
                )}
              </div>
            ) : (
              <div className="chatarea-outer flex flex-col justify-end">
                {messages.map((item) => {
                  const isLiked = likeDislikeStatus[item.id]?.like;
                  const isDisliked = likeDislikeStatus[item.id]?.dislike;

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
                    // Only show thumbs up/down if the response is not null
                    const showFeedback = item.message && item.message !== 'Something went wrong. Please try again.';

                    return (
                      <>
                        <p
                          key={item.id}
                          className={`self-start ${
                            item?.backgroundClass && item.backgroundClass
                          } text-primary text-sm lg:text-base mb-2 px-2 rounded-lg max-w-[80%] py-1`}
                        >
                          {item?.message}
                        </p>
                        {showFeedback && (
                          <div className="flex items-center space-x-2 w-[80%] justify-end ">
                            <ThumbsUp
                              className={`cursor-pointer h-4 w-4 ${isLiked ? 'text-green-500' : 'text-gray-500'}`}
                              onClick={() => handleLikeClick(item?.id)}
                            />
                            <ThumbsDown
                              className={`cursor-pointer h-4 w-4 ${isDisliked ? 'text-red-500' : 'text-gray-500'}`}
                              onClick={() => handleDislikeClick(item?.id)}
                            />
                          </div>
                        )}
                        {showFeedback && (
                          <div className="text-primary text-sm flex w-full items-start mr-1 ">
                            <BiError className="h-4 w-4 text-primary" />
                            &nbsp;
                            <p className="text-[12px]">This content is generated by AI based on the resume provided.</p>
                          </div>
                        )}
                      </>
                    );
                  }
                })}
              </div>
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
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2">
            <BiSend className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
