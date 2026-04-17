import React, { useContext, useState } from "react";
import fetchData from "../../config/ApiCall";
import UserContext from "../../Context/UserContext";
import { LoadingIcon } from "@/base-components";
import { ArrowDownCircle, ChevronRight, Loader2 } from "lucide-react";

export const FinalReport = ({ selectedAudio, audioTitle, audio, recommendedSolutions, finalReport, setFinalReport, selection, finalStudentReportCT, setFinalStudentReportCT }) => {
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const [errorStudentFetch, setErrorStudentFetch] = useState("");
  const [loaderStudent, setLoaderStudent] = useState(false);
  // const [finalReport, setFinalReport] = useState(null);
  const { userDetails } = useContext(UserContext);
  const handleGetReport = async () => {
    try {
      setError("");
      setLoader(true);
      // setFinalReport(null);
      const payload = {
        key: "get_report",
        object_key: audio?.source?.split("/").pop().split(".")[0],
      };
      const url =
        import.meta.env.VITE_RTCCA_API_URL + '/get-report';
      //cloudattack acc api url
      // const url =
      //   "https://a3vvzrxzl7.execute-api.ap-south-1.amazonaws.com/dev/get-report";
      const response = await fetchData(payload, url);
      if (response && response?.statusCode === 200) {
        setLoader(false);
        // setFinalReport(response?.body);
        setFinalReport(prev => ({ ...prev, [selectedAudio]: response?.body }))
      } else if (response?.errorMessage) {
        setLoader(false);
        setError("Something went wrong..");
      }
    } catch (error) {
      console.log("error");
      setLoader(false);
      setError("Something went wrong..");
    }
  };
  const handleGetReportStudent = async () => {
    try {
      setErrorStudentFetch("");
      setLoaderStudent(true);
      // setFinalStudentReportCT({});
      const payload = {
        "start": "00:00:00",
        "end": "00:05:00",
        object_key: audio?.source?.split("/").pop().split(".")[0],
        "method": "get_student_details"
      };
      const url =
        import.meta.env.VITE_RTCCA_API_URL + '/get-report';
      //cloudattack acc api url
      // const url =
      //   "https://a3vvzrxzl7.execute-api.ap-south-1.amazonaws.com/dev/get-report";
      const response = await fetchData(payload, url);
      if (response && response?.statusCode === 200) {
        setLoaderStudent(false);
        // setFinalReport(response?.body);
        setFinalStudentReportCT(prev => ({ ...prev, [selectedAudio]: response?.body }))
      } else if (response?.errorMessage) {
        setLoaderStudent(false);
        setErrorStudentFetch("Something went wrong..");
      }
    } catch (error) {
      console.log("error");
      setLoaderStudent(false);
      setErrorStudentFetch("Something went wrong..");
    }
  };

  const formatReport = (report) => {
    const sections = report?.split("\n\n");
    return sections?.map((section, index) => (
      <p key={index} className="text-primary">
        {section?.split("**").map((text, i) => {
          return i % 2 === 0 ? (
            <>
              <span key={i}>{text}</span>
              <br></br>
            </>
          ) : (
            <strong key={i} class="font-semibold text-lg">
              {text?.split("_").map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" ")}
            </strong>
          );
        })}
      </p>
    ));
  };

  const [toggle, setToggle] = useState(false)

  return (
    <>

      {selection !== "RTCCA Recordings" && <div className="">
        {/* accordian  */}
        <div onClick={() => setToggle(prev => !prev)} className="bg-white  cursor-pointer flex w-full justify-between  items-center  overflow-hidden">
          <div className="py-4  px-6 shrink-0 text-left font-medium text-gray-700 flex items-center gap-1">
            {audioTitle || "Untitled Audio"}
          </div>


          <div onClick={(e) => { e.stopPropagation(); handleGetReportStudent() }} className="py-4 shrink-0 px-6  text-blue-600 font-medium cursor-pointer  transition-colors duration-200 flex items-center gap-1">
            {loaderStudent ?
              <Loader2 size={16} className=" text-blue-600 animate-spin my-3" />
              : <ArrowDownCircle size={16} />}
            <span>{loaderStudent ? "Generating Report..." : "Generate Student Report"}</span>
          </div>
        </div>


        {<div className="flex items-center justify-center h-full px-4 py-3 bg-gray-50 rounded-lg">
          {!finalStudentReportCT?.[selectedAudio] && !loaderStudent ? (
            <div className="text-center  w-full overflow-y-auto p-4 bg-gray-100 rounded-lg shadow-inner">
              <p className="text-blue-600 text-md font-semibold">
                Click 'Generate Report' to receive your Student Feedback Report
              </p>
            </div>
          ) : loaderStudent ? (
            <div className="flex flex-col items-center justify-center w-full p-8">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin my-3" />
              <div className="mt-2 text-blue-600 font-medium">Generating your report...</div>
            </div>
          ) : errorStudentFetch ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg w-full">
              <p className="text-red-600 text-center">{errorStudentFetch}</p>
            </div>
          ) : (
            finalStudentReportCT && (
              <div className="max-h-64 w-full overflow-y-auto p-4 bg-gray-100 rounded-lg shadow-inner">
                <div className="space-y-2 px-2">
                  {formatReport(finalStudentReportCT?.[selectedAudio])}
                </div>
              </div>
            )
          )}
        </div>}
      </div>}

      <div className="">
        {/* accordian  */}
        <div onClick={() => setToggle(prev => !prev)} className="bg-white  cursor-pointer flex w-full justify-between  items-center  overflow-hidden">
          <div className="py-4  px-6 shrink-0 text-left font-medium text-gray-700 flex items-center gap-1">
            {/* <ChevronRight className={`${toggle && 'rotate-90'} transition-all ease-in-out 0.2s`} size={16} /> */}
            {audioTitle || "Untitled Audio"}
          </div>


          <div onClick={(e) => { e.stopPropagation(); handleGetReport() }} className="py-4 shrink-0 px-6  text-blue-600 font-medium cursor-pointer  transition-colors duration-200 flex items-center gap-1">
            {loader ?
              <Loader2 size={16} className=" text-blue-600 animate-spin my-3" />
              : <ArrowDownCircle size={16} />}
            <span>{loader ? "Generating Report..." : "Generate Report"}</span>
          </div>
        </div>


        {/* report */}
        {<div className="flex items-center justify-center h-full px-4 py-3 bg-gray-50 rounded-lg">
          {!finalReport?.[selectedAudio] && !loader ? (
            <div className="text-center  w-full overflow-y-auto p-4 bg-gray-100 rounded-lg shadow-inner">
              <p className="text-blue-600 text-md font-semibold">
                Click 'Generate Report' to receive your Final Feedback Report
              </p>
            </div>
          ) : loader ? (
            <div className="flex flex-col items-center justify-center w-full p-8">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin my-3" />
              <div className="mt-2 text-blue-600 font-medium">Generating your report...</div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg w-full">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          ) : (
            finalReport && (
              <div className="max-h-64 w-full overflow-y-auto p-4 bg-gray-100 rounded-lg shadow-inner">
                <div className="space-y-2 px-2">
                  {formatReport(finalReport?.[selectedAudio])}
                </div>
              </div>
            )
          )}
        </div>}
      </div>

    </>
  );
};
