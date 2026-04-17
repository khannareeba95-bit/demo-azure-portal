import { ENDPOINTS } from "../../config/endpoints";
const API_URL = ENDPOINTS.INTERVIEW_API;

const API_TOKEN = "cs7ohgS17H7WROp1tm1Gp8QeURQnQgLS2xVsGij5";

// Common headers with token
export const getHeaders = () => ({
  "Content-Type": "application/json",
  //"token": API_TOKEN
});


//JD.jsx

export const fetchJobDescriptions = async () => {
  try {
    const response = await fetch(`${API_URL}/get_jd_data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "get_jd_folder" }),
    });

    if (!response.ok) throw new Error("Failed to fetch job descriptions");

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Error fetching job descriptions: " + error.message);
  }
};

export const fetchJDPresignedUrl = async (fileKey, jdProfile) => {
  const url = `${API_URL}/jd_upload`;
  const body = JSON.stringify({
    method: "getPresignedUrl",
    file_key: fileKey,
    jd_profile: jdProfile.toLowerCase().replace(/\s+/g, "_"),
  });
  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch JD presigned URL");

    const data = await response.json();
    const parsedBody = JSON.parse(data.body);
    return parsedBody?.presigned_url || null;
  } catch (error) {
    console.error("Error fetching JD presigned URL:", error);
    throw new Error("Error fetching JD presigned URL: " + error.message);
  }
};

export const uploadJDtoS3 = async (presignedUrl, file) => {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) throw new Error("Failed to upload JD to S3");

    return { success: true, message: "File uploaded successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

//UploadFile.jsx

export const fetchFilePresignedUrl = async (fileName) => {
  const url = `${API_URL}/resume_comparision`;
  const body = JSON.stringify({
    method: "getPresignedUrl",
    file_key: fileName,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch presigned URL");
    const data = await response.json();
    return data?.statusCode === 200 && data?.PresignedUrl
      ? data.PresignedUrl
      : null;
  } catch (error) {
    throw new Error("Error fetching presigned URL: " + error.message);
  }
};

export const uploadFileToS3WithUrl = async (presignedUrl, file) => {
  try {
    const response = await fetch(presignedUrl, { method: "PUT", body: file });
    if (!response.ok) throw new Error("File upload failed");
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ResumeComparision.jsx

export const startAssessment = async (
  interviewPayload,
  setLoadingInterview,
  setInterviewResponse
) => {
  try {
    setLoadingInterview(true);
    const response = await fetch(`${API_URL}/get_interview_question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interviewPayload),
    });
    const responseData = await response.json();

    if (responseData?.statusCode === 200) {
      setInterviewResponse(responseData);
      return { success: true, message: "Assessment started. Good luck!" };
    } else {
      return { success: false, message: "Failed to start interview." };
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while starting the interview.",
    };
  } finally {
    setLoadingInterview(false);
  }
};

export const processResumeComparison = async (
  payload,
  setErrorMessage,
  setProcessData,
  setIsProcessing,
  setIsButtonHidden
) => {
  setIsProcessing(true);
  setErrorMessage("");

  try {
    const response = await fetch(`${API_URL}/resume_comparision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();

    if (responseData?.statusCode === 200) {
      if (!responseData.res || Object.keys(responseData.res).length === 0) {
        setErrorMessage("Something went wrong, please try again later.");
      } else {
        setProcessData(responseData.res);
        setIsButtonHidden(true);
      }
    } else {
      setErrorMessage(responseData?.body || "Error processing request.");
    }
  } catch (error) {
    setErrorMessage(error.message || "An error occurred. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};

//MCQ.jsx

export const submitMCQAnswers = async (payload) => {
  const response = await fetch(`${API_URL}/get_interview_question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

// Evaluation.jsx

export const fetchPresignedUrl = async (fileKey, candidateId) => {
  const response = await fetch(`${API_URL}/evaluation_report_generation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "getPresignedUrl",
      file_key: fileKey,
      candidateId,
    }),
  });
  const data = await response.json();
  return data.statusCode === 200 ? data : null;
};

export const uploadToS3 = async (url, pdfBlob) => {
  const response = await fetch(url, {
    method: "PUT",
    body: pdfBlob,
    headers: { "Content-Type": "application/pdf" },
  });
  return response.ok;
};

export const fetchEvaluationReport = async (candidateId) => {
  const response = await fetch(`${API_URL}/evaluation_report_generation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId }),
  });
  return await response.json();
};


// Add this function to your ApiCall.js file
export const fetchBulkFilePresignedUrl = async (fileName, folderID, jdNamesList,userID) => {
  const payload = {
    type: "bulk_upload",
    user_id: userID,
    method: "getPresignedUrl",
    file_key: fileName,
    folderID: folderID,
    jd_names_list: jdNamesList
  };

  try {
    const response = await fetch('https://cnp4204jii.execute-api.ap-south-1.amazonaws.com/dev/bulk-resume-upload', {
      method: 'POST',
     headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (data?.statusCode === 200 && data?.body) {
     return data?.body?.PresignedUrl || null;
   }
   
  
  } catch (error) {
    throw new Error(`Failed to get presigned URL: ${error.message}`);
  }
};


