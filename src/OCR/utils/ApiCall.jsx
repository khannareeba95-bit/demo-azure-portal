import { ENDPOINTS } from "../../config/endpoints";
const API_URL = ENDPOINTS.OCR_API;
const INVOICE_API_URL = ENDPOINTS.OCR_INVOICE_API;

export const fetchFilePresignedUrl = async (fileName) => {
  const url = `${API_URL}/bedrock_ocr`;
  const body = JSON.stringify({
    method: "presignedurl",
    DocumentID: fileName,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch presigned URL");
    const data = await response.json();
    const presignedUrl = data?.body?.presignedUrl;
    return presignedUrl ? presignedUrl : null;
  } catch (error) {
    throw new Error("Error fetching presigned URL: " + error.message);
  }
};

export const fetchInvoicePresignedUrl = async (fileName) => {
  const url = `${INVOICE_API_URL}`;
  const body = JSON.stringify({
    method: "presignedurl",
    DocumentID: fileName,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch presigned URL");
    const data = await response.json();
    const presignedUrl = data?.body?.presignedUrl;
    return presignedUrl ? presignedUrl : null;
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

// CrediqProcessing.jsx

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
    const response = await fetch(`${API_URL}/bedrock_ocr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        responseData?.body?.message ||
        responseData?.message ||
        `Server error (${response.status})`;
      throw new Error(errorMessage);
    }

    if (!responseData.body || Object.keys(responseData.body).length === 0) {
      throw new Error("Server returned empty response");
    }

    setProcessData(responseData);
    setIsButtonHidden(true);
    return { success: true, data: responseData };
  } catch (error) {
    console.error("API Error:", error);
    const userMessage =
      error.message === "Server returned empty response"
        ? "The server returned no data. Please try again."
        : error.message || "An unexpected error occurred. Please try again.";

    setErrorMessage(userMessage);
    return { success: false, error: userMessage };
  } finally {
    setIsProcessing(false);
  }
};
