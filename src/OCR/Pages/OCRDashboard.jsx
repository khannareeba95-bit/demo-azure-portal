import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "../../App.css";
import fetchData from "../../config/ApiCall";
import UserContext from "../../Context/UserContext";
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import Overlay from "../../GenAi/PagesComponents/Overlay";
import Toast from "../../assets/Shared/Toast";
import { instanceEndpoints } from "../../config/instanceEndpoints";
import Lucide from "../../base-components/lucide";
import LANGUAGES from "../utils/languages.json";

function OCR() {
  const { userDetails, setUserState, userState } = useContext(UserContext);
  const { ocrgetStatusURL, ocrStartURL, ocrStopURL } = instanceEndpoints;
  const navigate = useNavigate();

  const [imageData, setImageData] = useState({ images: [], imageURLS: [] });
  const [flags, setFlags] = useState({
    enabled: true,
    show: false,
    showResponse: false,
  });
  const [visualState, setVisualState] = useState({
    errorMessage: "",
    loader: false,
    error: "",
  });
  const [responseData, setResponseData] = useState({
    text: "",
    processedImage: null,
    BBoxText: null,
    pdfURL: "",
    englishTranslated: "",
    avgConf: 0,
  });
  const twentyMinutes = 7 * 60 * 1000;
  const [instanceInfo, setInstanceInfo] = useState({
    statusOfInstance: "",
    showToast: false,
    startTime: null,
    remainingTime: twentyMinutes,
  });
  const [disableButton, setDisableButton] = useState(false);
  const [processedImageData, setProcessedImageData] = useState();
  const [processState, setProcessState] = useState({
    uploading: false,
    processing: false,
  });
  const [divDimensions, setDivDimensions] = useState({ width: 0, height: 0 });
  const [toggleIndex, setToggleIndex] = useState();
  const [language, setLanguage] = useState("");

  const processedDivRef = useRef(null);
  const processedImageRef = useRef(null);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (processedDivRef.current) {
        const { clientWidth, clientHeight } = processedDivRef.current;
        setDivDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleImageLoad = () => {
    const height = processedImageRef.current.clientHeight;
    const width = processedImageRef.current.clientWidth;
    setDivDimensions({ width: width, height: height });
  };

  function onImageChange(e) {
    setFlags({ ...flags, show: false, enabled: true });
    setResponseData({
      processedImage: null,
      text: "",
      englishTranslated: "",
      avgConf: 0,
      pdfURL: "",
      BBoxText: null,
    });
    setProcessedImageData();
    setProcessState({ uploading: false, processing: false });
    setDivDimensions({ width: 0, height: 0 });
    setLanguage("");
    setDisableButton(false);
    setImageData({ imageURLS: [], images: [...e.target.files] });
  }

  useEffect(() => {
    document.title = "Intelligent Documents Processing";
    if (imageData?.images?.length < 1) return;
    const newImageUrls = [];
    imageData?.images?.forEach((image) =>
      newImageUrls.push(URL.createObjectURL(image))
    );
    setImageData({ ...imageData, imageURLS: newImageUrls });
  }, [imageData?.images]);

  useEffect(() => {
    handleGetStatusInstance();
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, []);

  const handleAdd = async () => {
    setProcessState({ ...processState, uploading: true });
    let payload = {
      key: "input-for-ocr/" + imageData?.images[0]?.name,
      method: "put_object_presigned_url",
    };
    // const url = "https://1d7vkwqmoi.execute-api.ap-south-1.amazonaws.com/dev";
    const url = "https://v1lt5g08mb.execute-api.ap-south-1.amazonaws.com/dev";
    // cloudattack acc api url
    const response = await fetchData(payload, url);

    if (!response.errorMessage) {
      await fetch(response, { method: "PUT", body: imageData?.images[0] }).then(
        (responseData) => {
          if (responseData?.status === 200) {
            setProcessState({ ...processState, uploading: false });
            setFlags({ ...flags, enabled: false, showResponse: false });
          }
        }
      );
    }
  };

  const handleUpload = async () => {
    if (!language) {
      setVisualState({
        ...visualState,
        errorMessage: "Please select language before proceeding..",
      });
    } else {
      setFlags({ ...flags, show: true });
      setVisualState({ ...visualState, loader: true });
      setProcessState({ ...processState, processing: true });
      let payload = {
        s3_uri: "input-for-ocr/" + imageData?.images[0].name,
        lang: language,
      };
      try {
        const response = await fetch(
          "https://67h9czr42i.execute-api.ap-south-1.amazonaws.com/ocr_aws_dev/",
          // "https://dy1gpwshph.execute-api.ap-south-1.amazonaws.com/ocr_aws_dev/",
          // cloudattack acc api url
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        ).then((responseData) => responseData.json());
        if (response) {
          let updatedResponseData = { ...responseData };
          let textFile = response?.body?.OCR_Text;
          setFlags({ ...flags, show: true, showResponse: true });
          setVisualState({ ...visualState, loader: false });
          const promises = [];
          let payload = {
            key: textFile,
            method: "get_object_presigned_url",
          };
          const url =
            "https://v1lt5g08mb.execute-api.ap-south-1.amazonaws.com/dev/";
          // "https://1d7vkwqmoi.execute-api.ap-south-1.amazonaws.com/dev";
          // cloudattack acc api url
          const getPreurl = await fetchData(payload, url);
          if (getPreurl) {
            const promise = fetch(getPreurl)
              .then((res) => res?.text())
              .then((textData) => {
                updatedResponseData = {
                  ...updatedResponseData,
                  text: textData,
                };
              });
            promises.push(promise);
          }

          payload = {
            key: response?.body?.translated_Text,
            method: "get_object_presigned_url",
          };

          const getTranslate = await fetchData(payload, url);

          if (getTranslate) {
            const promise = fetch(getTranslate)
              .then((res) => res?.text())
              .then((text) => {
                updatedResponseData = {
                  ...updatedResponseData,
                  englishTranslated: text,
                };
              });
            promises.push(promise);
          }

          payload = {
            key: response?.body?.BBox_Image,
            method: "get_object_presigned_url",
          };
          const getBBoxImage = await fetchData(payload, url);

          if (getBBoxImage) {
            const promise = fetch(getBBoxImage)
              .then((res) => {
                res.blob().then((blob) => {
                  var img = new Image();
                  img.src = URL.createObjectURL(blob);
                  img.onload = function () {
                    setProcessedImageData({
                      ...res,
                      width: img.width,
                      height: img.height,
                    });
                  };
                });
                updatedResponseData = {
                  ...updatedResponseData,
                  processedImage: res?.url,
                };
              })
              .catch((err) => {
                console.log("err", err);
              });
            promises.push(promise);
          }

          payload = {
            key: response?.body?.BBox_text,
            method: "get_object_presigned_url",
          };
          const getBBoxText = await fetchData(payload, url);
          if (getBBoxText) {
            const promise = fetch(getBBoxText)
              .then((res) => res.text())
              .then((text) => {
                text = JSON.parse(text);
                var averageConf = 0;
                var textWithConf = [];
                text?.map((line) => {
                  if (parseInt(line?.conf) > 50) {
                    averageConf += parseInt(line?.conf);
                    textWithConf.push(line);
                  }
                });
                updatedResponseData = {
                  ...updatedResponseData,
                  avgConf: averageConf / text?.length,
                  BBoxText: textWithConf,
                };
              });
            promises.push(promise);
          }

          payload = {
            key: response?.body?.BBox_PDF,
            method: "get_object_presigned_url",
          };

          const getBBoxPdf = await fetchData(payload, url);
          if (getBBoxPdf) {
            const promise = fetch(getBBoxPdf)
              .then((res) => {
                updatedResponseData = {
                  ...updatedResponseData,
                  pdfURL: res?.url,
                };
              })
              .catch((err) => {
                console.log("err", err);
              });
            promises.push(promise);
          }

          await Promise.all(promises);
          setResponseData(updatedResponseData);
        }
      } catch (error) {
        console.log("err", error);
      }
    }
  };

  const download = (data, type) => {
    const element = document.createElement("a");
    if (type === "text") {
      element.href =
        "data:text/plain;charset=utf-8," + encodeURIComponent(data);
      element.download = "text.txt";
    }

    if (type === "image") {
      element.href = data;
      element.download = "image.png";
    }
    if (type === "pdf") {
      element.href = data;
      element.download = "file.pdf";
      element.target = "_blank";
      element.dispatchEvent(new MouseEvent("click"));
    }
    document.body.appendChild(element);
    element.click();
  };
  const handleLanguage = (e) => {
    setVisualState({ ...visualState, errorMessage: "" });
    setLanguage(e.target.value);
  };

  const handleGetStatusInstance = async () => {
    try {
      setVisualState({ ...visualState, loader: true, error: "" });
      let payload = { key: "get_status" };
      const response = await fetchData(payload, ocrgetStatusURL);
      if (response && response?.statusCode === 200) {
        setInstanceInfo({ ...instanceInfo, statusOfInstance: response?.body });
        if (
          response?.body === "No_Instance" ||
          response?.body === "InService" ||
          response?.body === "Failed"
        ) {
          window.localStorage.removeItem("startTimeOCR");
        }
        if (response?.body === "Failed") {
          handleStateOfInstance(response?.body);
        }
      }
    } catch (error) {
      console.log("error", error);
      setVisualState({ ...visualState, error: "Something went wrong" });
    } finally {
      setVisualState({ ...visualState, loader: false });
    }
  };
  const handleStateOfInstance = async (statusOfInstance) => {
    try {
      let url;
      setInstanceInfo({ ...instanceInfo, showToast: true });
      setDisableButton(true);
      setVisualState({ ...visualState, error: "" });
      if (statusOfInstance === "No_Instance") {
        url = ocrStartURL;
      } else if (
        statusOfInstance === "InService" ||
        statusOfInstance === "Failed"
      ) {
        url = ocrStopURL;
      }
      let payload = { key: "get_status" };
      const response = await fetchData(payload, url);
      if (response && response?.statusCode === 200) {
        setInstanceInfo({ ...instanceInfo, statusOfInstance: response?.body });
        setDisableButton(false);
        if (response?.body === "Deleting") {
          const inputElement = document.getElementById("fileInput");
          if (inputElement) {
            inputElement.value = null;
          }
          setTimeout(() => {
            handleGetStatusInstance();
          }, 10000);
        }
      }
    } catch (error) {
      console.log("error", error);
      setVisualState({ ...visualState, error: "Something went wrong" });
    }
  };

  useEffect(() => {
    const startTimeFromLocalStorage =
      window.localStorage.getItem("startTimeOCR");
    if (
      startTimeFromLocalStorage &&
      instanceInfo?.statusOfInstance === "Creating"
    ) {
      const elapsedTime = Date.now() - parseInt(startTimeFromLocalStorage, 10);
      if (elapsedTime < twentyMinutes) {
        const timeRemaining = Math.max(twentyMinutes - elapsedTime, 0);
        setInstanceInfo({
          ...instanceInfo,
          startTime: Date.now() - elapsedTime,
          remainingTime: timeRemaining,
        });
      } else {
        handleGetStatusInstance();
      }
    } else if (instanceInfo?.statusOfInstance === "Creating") {
      setInstanceInfo({ ...instanceInfo, startTime: Date.now() });
      window.localStorage.setItem("startTimeOCR", Date.now());
    }
    const interval = setInterval(() => {
      if (
        instanceInfo?.statusOfInstance === "Creating" &&
        instanceInfo?.startTime
      ) {
        const elapsedTime = Date.now() - instanceInfo?.startTime;
        if (elapsedTime >= twentyMinutes) {
          handleGetStatusInstance();
          setInstanceInfo({ ...instanceInfo, startTime: null });
          clearInterval(interval);
        } else {
          const timeRemaining = Math.max(twentyMinutes - elapsedTime, 0);
          setInstanceInfo({ ...instanceInfo, remainingTime: timeRemaining });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [instanceInfo?.statusOfInstance, instanceInfo?.startTime]);

  return (
    <>
      <div className="my-5 flex items-center justify-end">
        <div className="flex gap-4 md:mr-5 lg:mr-0">
          {userDetails &&
            (userDetails?.attributes?.email === "prarthit@cloudthat.com" ||
              userDetails?.attributes?.email === "arihant@cloudthat.com" ||
              userDetails?.attributes?.email === "shantanu@cloudthat.com" ||
              userDetails?.attributes?.email === "sneha.n@cloudthat.com" ||
              userDetails?.attributes?.email === "aditya.k@cloudthat.com" ||
              userDetails?.attributes?.email === "huda.k@cloudthat.com" ||
              userDetails?.attributes?.email === "sureshr@cloudthat.com" ||
              userDetails?.attributes?.email === "abhishek.m@cloudthat.com") &&
            (instanceInfo?.statusOfInstance === "No_Instance" ||
              instanceInfo?.statusOfInstance === "Creating" ||
              instanceInfo?.statusOfInstance === "InService") && (
              <button
                className="box   bg-primary hover:scale-110 disabled:cursor-not-allowed  md:h-auto p-2"
                onClick={() => {
                  handleStateOfInstance(
                    instanceInfo?.statusOfInstance === "Creating"
                      ? "Creating"
                      : instanceInfo?.statusOfInstance === "No_Instance"
                      ? "No_Instance"
                      : instanceInfo?.statusOfInstance === "InService" &&
                        "InService"
                  );
                }}
                disabled={
                  instanceInfo?.statusOfInstance == "Creating" || disableButton
                }
              >
                <p className="text-button text-white p-2">
                  {instanceInfo?.statusOfInstance === "Creating"
                    ? "Deploying"
                    : instanceInfo?.statusOfInstance === "No_Instance"
                    ? "Deploy Infrastructure"
                    : instanceInfo?.statusOfInstance == "InService" &&
                      "Release Infrastructure"}
                </p>
              </button>
            )}
        </div>
      </div>
      {/* <div className="bg-gradient-to-b from-sky-200 to-sky-600 min-h-screen mx-2 rounded-md"> */}
      <div className="">
        {instanceInfo?.statusOfInstance === "Creating" && (
          <Overlay
            timer={instanceInfo?.remainingTime}
            className="w-8 h-8 cursor-pointer"
            startTime={instanceInfo?.startTime}
          />
        )}

        {instanceInfo?.showToast && (
          <Toast
            message={
              instanceInfo?.statusOfInstance === "No_Instance"
                ? "Instance creation in progress, please wait"
                : instanceInfo?.statusOfInstance === "InService" &&
                  "Instance deletion in progress, please wait"
            }
            onClose={() =>
              setInstanceInfo({ ...instanceInfo, showToast: false })
            }
          />
        )}

        <div className="w-full p-[20px] rounded-lg mx-auto">
          <div className="w-full p-[20px] rounded-lg mx-auto">
            <div className="w-full  mx-auto  flex justify-center flex-col items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-4 text-center">
                  Select your image for IDP
                </h2>
                <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <div className="col-span-6 sm:col-span-3 lg:col-span-2 xl:col-span-1">
                    <Lucide
                      icon="Download"
                      className="block mx-auto h-8 w-full text-primary font-bold"
                    />
                    <div className="mt-2 text-sm text-center text-md font-bold mb-4">
                      Select a file for IDP
                    </div>
                  </div>

                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    lassName="mt-4 text-black bg-[#f1f5f9]"
                    onChange={onImageChange}
                    placeholder="Upload image for IDP"
                    disabled={
                      instanceInfo?.statusOfInstance !== "InService" ||
                      !userDetails ||
                      (userDetails?.attributes?.email !==
                        "prarthit@cloudthat.com" &&
                        userDetails?.attributes?.email !==
                          "arihant@cloudthat.com" &&
                        userDetails?.attributes?.email !==
                          "ganeshv@cloudthat.com" &&
                        userDetails?.attributes?.email ===
                          "aditya.k@cloudthat.com" &&
                        userDetails?.attributes?.email ===
                          "sureshr@cloudthat.com" &&
                        userDetails?.attributes?.email !==
                          "sneha.n@cloudthat.com" &&
                        userDetails?.attributes?.email !==
                          "huda.k@cloudthat.com")
                    }
                  />
                </div>
              </div>
              {imageData?.images?.length > 0 &&
                instanceInfo?.statusOfInstance === "InService" && (
                  <button
                    className="buttonUpload w-40 rounded-full p-2 text-white  mt-5 shadow-lg "
                    onClick={() => {
                      window.location.reload();
                    }}
                    style={{
                      backgroundImage: `linear-gradient(to left, blue, purple)`,
                    }}
                  >
                    Reset
                  </button>
                )}
            </div>
          </div>
          {imageData?.images?.length > 0 &&
            instanceInfo?.statusOfInstance === "InService" && (
              <div
                className={`flex flex-col mx-auto bg-[#f1f5f9] shadow-xl w-full md:p-8 rounded-lg  mt-10 md:max-w-6xl ${
                  flags?.show && "transition-width duration-500"
                }`}
              >
                <div className="flex md:flex-row flex-col w-full  gap-5 ">
                  <div
                    className={` ${
                      flags?.show ? "md:w-1/2" : "w-full"
                    } bg-[#f7f9fa] min-h-[250px] rounded-md shadow-lg flex items-center justify-center`}
                  >
                    {imageData?.imageURLS?.length > 0
                      ? imageData?.imageURLS?.map((imageSrc, index) => (
                          <img
                            key={index}
                            src={imageSrc}
                            className="w-full h-full "
                          />
                        ))
                      : "Uploaded Image Preview"}
                  </div>
                  <div className={`flex flex-col justify-center`}>
                    {flags?.enabled && (
                      <>
                        <button
                          className={`buttonUpload w-40 rounded-full p-2 mb-4 text-white self-center   mt-5 shadow-lg}`}
                          onClick={handleAdd}
                          style={{
                            backgroundImage: `${
                              !processState?.uploading
                                ? "linear-gradient(to left, blue, purple)"
                                : "linear-gradient(to left, gray, black)"
                            }`,
                            animation: `${
                              processState?.uploading
                                ? "colorChange 10s infinite"
                                : "none"
                            }`,
                          }}
                          disabled={processState?.uploading}
                        >
                          {processState?.uploading ? "Uploading..." : "Upload"}
                        </button>
                      </>
                    )}
                    {!flags?.enabled && !flags?.showResponse && (
                      <>
                        <select
                          placeholder="Choose Language"
                          className="p-2 rounded-md shadow-lg border-none outline-none text-black bg-white"
                          value={language}
                          onChange={(e) => handleLanguage(e)}
                        >
                          <option value="" disabled>
                            Select language
                          </option>
                          <option value="hin">Hindi</option>
                          <option value="eng">English</option>
                          <option value="tam">Tamil</option>
                          <option value="kan">Kannada</option>
                          <option value="tel">Telugu</option>
                          <option value="guj">Gujarati</option>
                        </select>

                        {visualState?.errorMessage && (
                          <span className="text-red-600 text-center mt-2">
                            {visualState?.errorMessage}
                          </span>
                        )}

                        <button
                          className={` buttonUpload w-40 p-2 mb-4  rounded-full text-white bg-blue-600 mt-5 self-center shadow-lg ${
                            flags?.enabled
                              ? "opacity-50 border-gray-400 cursor-not-allowed "
                              : ""
                          }`}
                          style={{
                            backgroundImage: `linear-gradient(to left, blue, purple)`,
                            animation: `${
                              flags?.enabled
                                ? "colorChange 10s infinite"
                                : "none"
                            }`,
                          }}
                          // disabled={!language}
                          onClick={handleUpload}
                        >
                          {processState?.processing
                            ? "Processing..."
                            : "Process"}
                        </button>
                      </>
                    )}
                  </div>
                  {flags?.show && (
                    <>
                      <div className="w-full md:w-1/2 shadow-lg flex bg-[#f7f9fa] items-center justify-center rounded-md ">
                        {visualState?.loader ? (
                          <div className="flex flex-col justify-center items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="animate-spin w-6 h-6 mr-3 "
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6a2 2 0 0 0 2 2h0" />
                            </svg>
                            <h3 className="">Loading...</h3>
                          </div>
                        ) : (
                          <div
                            className="relative w-full h-full"
                            id="processedDiv"
                            ref={processedDivRef}
                          >
                            <img
                              // src={processedImage && imageURLS[0]}
                              src={responseData?.processedImage}
                              ref={processedImageRef}
                              className={`"absolute w-full h-full "`}
                              id="processedImage"
                              onLoad={handleImageLoad}
                            />

                            {/* Draw bounding box */}
                            <div className="absolute top-0 ">
                              {responseData?.BBoxText?.length > 0 &&
                                responseData?.BBoxText?.map((item, index) => {
                                  return (
                                    <>
                                      {item?.conf > 35 && (
                                        <>
                                          <div
                                            key={index}
                                            // className="absolute top-0  cursor-pointer group"
                                            className="absolute inline-block rounded  px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out cursor-pointer"
                                            data-te-toggle="tooltip"
                                            data-te-placement="top"
                                            data-te-ripple-init
                                            data-te-ripple-color="light"
                                            title={
                                              "Text: " +
                                              item?.text +
                                              " Confidence: " +
                                              item?.conf +
                                              "%"
                                            }
                                            style={{
                                              top: `${
                                                (divDimensions?.height *
                                                  item?.top) /
                                                processedImageData?.height
                                              }px`,
                                              left: `${
                                                (divDimensions?.width *
                                                  item?.left) /
                                                processedImageData?.width
                                              }px`,
                                              width: `${
                                                (divDimensions?.width *
                                                  item?.width) /
                                                  processedImageData?.width -
                                                2
                                              }px`,
                                              height: `${
                                                (divDimensions?.height *
                                                  item?.height) /
                                                processedImageData?.height
                                              }px`,
                                            }}
                                            onClick={() => {
                                              setToggleIndex(index);
                                            }}
                                          >
                                            <div
                                              className={`translate-y-[-37px] px-2 py-1 translate-x-[-60px] bg-gray-500 rounded-full text-white min-w-[200px] ${
                                                toggleIndex === index
                                                  ? "block"
                                                  : "hidden"
                                              }`}
                                            >
                                              {"Text: " +
                                                item?.text +
                                                " Confidence: " +
                                                item?.conf +
                                                "%"}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {flags?.show && flags?.showResponse && (
                  <>
                    <div className="flex justify-center items-center font-bold my-5">
                      Average Confidence :{" "}
                      {parseFloat(responseData?.avgConf).toFixed(2) + " %"}
                    </div>
                    <div className="flex gap-2 md:flex-row  flex-col justify-center  items-center w-full text-right ">
                      <button
                        className="  px-4 py-1 w-auto  text-sm flex items-center justify-center   text-white  rounded-full  cursor-pointer hover:scale-105"
                        style={{
                          backgroundImage: `linear-gradient(to left, blue, purple)`,
                        }}
                        onClick={() => {
                          download(responseData?.processedImage, "image");
                        }}
                      >
                        Image
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 ml-2 "
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </button>
                      <button
                        className="  px-4 py-1 w-auto flex items-center text-sm justify-center  text-white  rounded-full cursor-pointer hover:scale-105"
                        style={{
                          backgroundImage: `linear-gradient(to left, blue, purple)`,
                        }}
                        onClick={() => {
                          download(responseData?.text, "text");
                        }}
                      >
                        Original Text
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 ml-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </button>

                      <a
                        className="  px-4 py-1  flex items-center justify-center  text-sm text-white  rounded-full cursor-pointer hover:scale-105"
                        style={{
                          backgroundImage: `linear-gradient(to left, blue, purple)`,
                        }}
                        onClick={() => {
                          download(
                            JSON.stringify(responseData?.BBoxText),
                            "text"
                          );
                        }}
                      >
                        Attributes
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 ml-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </a>
                      <a
                        className=" px-4 py-1 flex items-center justify-center  text-white text-sm  rounded-full cursor-pointer hover:scale-105"
                        style={{
                          backgroundImage: `linear-gradient(to left, blue, purple)`,
                        }}
                        onClick={() => {
                          download(responseData?.englishTranslated, "text");
                        }}
                      >
                        Translated Text
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 ml-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </a>
                      <a
                        className="   px-4 py-1 flex items-center justify-center  text-white text-sm  rounded-full cursor-pointer hover:scale-105"
                        style={{
                          backgroundImage: `linear-gradient(to left, blue, purple)`,
                        }}
                        onClick={() => {
                          download(responseData?.pdfURL, "pdf");
                        }}
                      >
                        PDF
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 ml-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </a>
                    </div>

                    <div className="flex flex-col md:flex-row w-full p-4 gap-2  bg-[#f1f5f9] mt-4 rounded-md shadow-xl justify-between  items-center">
                      {/* Disaplay Text as it is with new line */}
                      <div className="md:w-1/2 w-full ">
                        <p className="font-bold xl:text-xl text-[#0887C9] my-2 md:text-md text-sm">
                          Original Extracted Text:
                        </p>
                        <div className="w-full p-4 border-2 border-gray-600 max-h-[400px] overflow-y-scroll custom-scrollbar">
                          {responseData?.text
                            ?.split("\n")
                            .map((item, index) => {
                              return (
                                <span key={index}>
                                  {item}
                                  <br />
                                </span>
                              );
                            })}
                        </div>
                      </div>
                      <div className="md:w-1/2 w-full ">
                        <p className="font-bold xl:text-xl text-[#0887C9] my-2 md:text-md text-sm">
                          English Translator of Extracted Text:
                        </p>
                        <div className="w-full p-4 border-2 border-gray-600 max-h-[400px] overflow-y-scroll custom-scrollbar">
                          {responseData?.englishTranslated
                            ?.split("\n")
                            .map((item, index) => {
                              return (
                                <span key={index}>
                                  {item}
                                  <br />
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
        </div>
      </div>
    </>
  );
}

export default OCR;
