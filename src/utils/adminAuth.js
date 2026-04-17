// Admin email addresses that have access to admin panel
const ADMIN_EMAILS = [
  
   "areeba@cloudthat.com",

];

export const isAdmin = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const checkAdminAccess = (userDetails) => {
  if (!userDetails || !userDetails?.attributes) return false;
  const email = userDetails?.attributes?.email;
  const result = isAdmin(email);

  return result;
};

import { ENDPOINTS } from "../config/endpoints";

export const isAdminAccess = async (email, setIsAdmin) => {
  try {
    const apiEndpoint = `${ENDPOINTS.INTERVIEW_API}/get_jd_data`;
    const payload = {
      method: "check_admin_status",
      email: email,
    };
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const res = await response?.json();
    if (res?.statusCode === 200 && res?.["Admin Status"]) {
      setIsAdmin(res?.["Admin Status"]);
    } else {
      setIsAdmin(false);
    }
  } catch (error) {
    console.log("error", error);
  }
};
