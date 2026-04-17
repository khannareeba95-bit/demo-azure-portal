import { ENDPOINTS } from "../config/endpoints";
const API_BASE_URL = ENDPOINTS.ADMIN_API;

export const fetchData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await response?.json();
    if (responseText?.status_code == 200 && responseText?.success === true && Array.isArray(responseText?.projects)) {
      return transformDynamoData(responseText?.projects);
    }
    return [];
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
};

const transformDynamoData = (dynamoProjects) => {
  if (!Array.isArray(dynamoProjects)) {
    return [];
  }

  return dynamoProjects?.map((item, index) => {
    let cardImage = "";

    const processedIndustries = [];

    const industryNames = [];

    // Process industries first to get GIFs

    if (Array.isArray(item?.industry)) {
      item?.industry?.forEach((ind, indIndex) => {
        if (ind && typeof ind === "object") {
          const industryName = String(ind?.industry_name || "");

          if (industryName) {
            industryNames.push(industryName);

            // Check localStorage for stored GIF first

            const normalizedTitle = item?.title?.replace(/[^a-zA-Z0-9]/g, "_");

            const normalizedIndustry = industryName?.replace(/[^a-zA-Z0-9]/g, "_");

            const storageKey = `gif_${normalizedTitle}_${normalizedIndustry}`;

            let gifUrl = ind?.demo_gif || ind?.gif || null;

            try {
              const storedGif = localStorage?.getItem(storageKey);

              if (storedGif) {
                gifUrl = `data:image/gif;base64,${storedGif}`;
              }
            } catch (error) {
              // Ignore localStorage errors
            }

            const industryData = {
              name: industryName,

              industry_name: industryName,

              problemStatement: String(ind?.problem_statement || ""),

              solution: String(ind?.solution || ""),

              marketingLine: String(ind?.marketing_headline || ""),

              description: String(ind?.description || ""),

              industryDescription: String(ind?.industry_description || ""),

              gif: gifUrl,

              demo_gif: gifUrl,
            };

            processedIndustries.push(industryData);

            // Use first available GIF as card image

            if (!cardImage && gifUrl && gifUrl?.trim() !== "" && gifUrl !== "null" && gifUrl !== "undefined") {
              cardImage = String(gifUrl);
            }
          }
        }
      });
    }

    // Fallback to thumbnail image if no GIF found

    if (!cardImage) {
      cardImage = Array.isArray(item?.images) && item?.images?.length > 0 ? String(item?.images?.[0]) : "";
    }

    const safeItem = {
      id: index + 1,

      title: String(item?.title || ""),

      img: cardImage,

      path: String(item?.path || ""),

      techstack: "",

      category: Array.isArray(item?.category) ? item?.category : [],

      description: String(item?.description || ""),

      deploy_infra: Boolean(item?.deploy_infrastructure?.deploy_infra),

      deployment_status: String(item?.deploy_infrastructure?.status || "not-deployed"),

      status: String(item?.status || "inprogress"),

      youtube_link: String(item?.youtube_link || ""),

      images: Array.isArray(item?.images) ? item?.images : [],

      lastEdited: new Date().toISOString(),

      industriesDisplay: industryNames?.join(", "),

      industries: processedIndustries,

      display_order: item?.display_order || 999, // Include display_order for sorting

      // Add project-level fields that might be missing

      marketing_line: String(item?.marketing_line || ""),

      problem_statement: String(item?.problem_statement || ""),

      Project_stakeholders: Array.isArray(item?.Project_stakeholders) ? item?.Project_stakeholders : [],

      solution: String(item?.solution || ""),

      gif: String(item?.gif || ""),

      Primary_industry: String(item?.Primary_industry || ""),

      search_keywords: Array.isArray(item?.search_keywords)
        ? item?.search_keywords
        : item?.keywords
        ? typeof item?.keywords === "string"
          ? item?.keywords
              ?.split(",")
              ?.map((k) => k?.trim())
              ?.filter((k) => k)
          : Array.isArray(item?.keywords)
          ? item?.keywords
          : []
        : [],
    };

    return safeItem;
  });
};

// Helper functions for handleSave
const validateChanges = (editTitle, originalData) => {
  if (editTitle !== (originalData?.title || "")) {
    return {
      success: false,
      error:
        "Title cannot be changed as it is used as the primary key. Please create a new project with the desired title.",
      showModal: true,
    };
  }
  return { success: true };
};

const checkProjectFieldsChanged = (editData, originalData) => {
  const normalizedOriginal = {
    editTitle: originalData?.title || "",
    editPath: originalData?.path || "",
    editTechStack: originalData?.techstack || "",
    editProjectDescription: originalData?.description || "",
    editYouTubeVideoLink: originalData?.youtube_link || "",
    editProjectStatus: originalData?.status || "InProgress",
    editCategory: originalData?.category || [],
    editProjectStakeholders: originalData?.Project_stakeholders || [],
    editDeployInfra: originalData?.deploy_infra || false,
    editMarketingLine: originalData?.marketing_line || "",
    editProblemStatement: originalData?.problem_statement || "",
    editSolution: originalData?.solution || "",
    editGif: originalData?.gif || "",
    editPrimaryIndustry: originalData?.Primary_industry || "",
    editKeywords: originalData?.search_keywords || [],
  };

  return JSON.stringify(editData) !== JSON.stringify(normalizedOriginal);
};

const updateProjectFields = async (editData, originalData) => {
  const updateData = {
    path: editData?.editPath || "",
    tech_stack: editData?.editTechStack || "",
    description: editData?.editProjectDescription || "",
    youtube_link: editData?.editYouTubeVideoLink || "",
    status: editData?.editProjectStatus || "InProgress",
    category: editData?.editCategory || [],
    marketing_line: editData?.editMarketingLine || "",
    problem_statement: editData?.editProblemStatement || "",
    Project_stakeholders: editData?.editProjectStakeholders || [],
    deploy_infra: editData?.editDeployInfra || false,
    solution: editData?.editSolution || "",
    gif: editData?.editGif || "",
    Primary_industry: editData?.editPrimaryIndustry || "",
    search_keywords: Array.isArray(editData?.editKeywords) ? editData?.editKeywords : [],
  };

  const apiTitle = originalData?.title || editData?.editTitle;
  const patchResult = await updateDemo(apiTitle, updateData);

  if (!patchResult?.success) {
    //console.log("Project update failed:", patchResult?.error);
    return { success: false, error: "Project update failed" };
  }
  return { success: true };
};

const manageImages = async (selectedRowData, editTitle, currentImages, pendingImages) => {
  // Handle image deletions
  if (selectedRowData && Array.isArray(selectedRowData?.images)) {
    const originalImages = selectedRowData?.images;
    const imagesToDelete = originalImages?.filter((img) => !currentImages?.includes(img));

    if (imagesToDelete?.length > 0) {
      try {
        const deleteResult = await deleteImages(editTitle, imagesToDelete);
        if (!deleteResult?.success) {
          console.error("Failed to delete images:", deleteResult?.error);
        }
      } catch (error) {
        console.error("Error deleting images:", error);
      }
    }
  }

  // Handle image uploads
  if (pendingImages?.length > 0) {
    try {
      const uploadResult = await uploadImages(editTitle, pendingImages);
      if (!uploadResult?.success) {
        console.error("Failed to upload pending images:", uploadResult?.error);
      }
    } catch (error) {
      console.error("Error uploading pending images:", error);
    }
  }
};

const manageIndustries = async (editTitle, editIndustries, originalIndustries, modifiedIndustries) => {
  const originalIndustryNames = originalIndustries?.map((ind) => ind?.name || ind?.industry_name);
  const currentIndustryNames = editIndustries?.map((ind) => ind?.name);
  const deletedIndustries = originalIndustryNames?.filter((name) => !currentIndustryNames?.includes(name));

  // Delete removed industries
  for (const industryName of deletedIndustries) {
    try {
      const deleteResult = await deleteIndustry(editTitle, null, industryName);
      if (!deleteResult?.success) {
        console.error(`Failed to delete industry ${industryName}:`, deleteResult?.error);
      }
    } catch (error) {
      console.error(`Error deleting industry ${industryName}:`, error);
    }
  }

  // Add new industries
  const newIndustries = editIndustries?.filter((ind) => !originalIndustryNames?.includes(ind?.name));
  if (newIndustries?.length > 0) {
    for (const industry of newIndustries) {
      const addResult = await addIndustry(editTitle, {
        name: industry?.name || "",
        description: industry?.description || "",
        industryDescription: industry?.industryDescription || "",
        marketingLine: industry?.marketingLine || "",
        problemStatement: industry?.problemStatement || "",
        solution: industry?.solution || "",
      });

      if (!addResult?.success) {
        console.error(`Failed to add industry ${industry?.name}:`, addResult?.error);
        return { success: false, error: `Failed to add industry` };
      }
    }
  }

  // Update modified industries by name instead of index
  if (modifiedIndustries && modifiedIndustries?.size > 0) {
    for (const industryIndex of modifiedIndustries) {
      if (industryIndex < editIndustries?.length) {
        const industry = editIndustries?.[industryIndex];
        if (industry && industry?.name) {
          const updateResult = await updateIndustry(editTitle, null, {
            name: industry?.name,
            description: industry?.description || "",
            industryDescription: industry?.industryDescription || "",
            marketingLine: industry?.marketingLine || "",
            problemStatement: industry?.problemStatement || "",
            solution: industry?.solution || "",
          });
        }
      }
    }
  }
  return { success: true };
};

const uploadPendingGifs = async (editTitle, editIndustries, pendingGifs) => {
  if (Object.keys(pendingGifs)?.length > 0) {
    for (const [industryIndex, gifFile] of Object.entries(pendingGifs)) {
      try {
        const industryName = editIndustries?.[parseInt(industryIndex)]?.name;
        if (industryName) {
          const uploadResult = await uploadGif(editTitle, industryName, gifFile);
        }
      } catch (error) {
        console.log(`Error uploading GIF for industry ${industryIndex}:`, error);
      }
    }
  }
};

export const handleSave = async (
  selectedRowData,
  formState,
  modifiedIndustries,
  currentImages = [],
  pendingImages = [],
  pendingGifs = {}
) => {
  try {
    const originalData = selectedRowData || {};

    // Validate changes
    const validation = validateChanges(formState?.title, originalData);
    if (!validation?.success) return validation;

    const originalIndustries = originalData?.industries || [];

    // Prepare edit data object from formState
    const editData = {
      editTitle: formState?.title,
      editMarketingLine: formState?.marketingLine,
      editProblemStatement: formState?.problemStatement,
      editSolution: formState?.solution,
      editPath: formState?.path,
      editTechStack: formState?.techStack,
      editProjectDescription: formState?.projectDescription,
      editYouTubeVideoLink: formState?.youTubeVideoLink,
      editProjectStatus: formState?.projectStatus,
      editCategory: formState?.category,
      editProjectStakeholders: formState?.projectStakeholders,
      editDeployInfra: formState?.deployInfra,
      editPrimaryIndustry: formState?.primaryIndustry,
      editKeywords: formState?.keywords,
    };

    // Check what changed
    const projectFieldsChanged = checkProjectFieldsChanged(editData, originalData);
    const industriesChanged =
      formState?.industries?.length !== originalIndustries?.length ||
      (modifiedIndustries && modifiedIndustries?.size > 0);

    // Update project fields if changed
    if (projectFieldsChanged) {
      const result = await updateProjectFields(editData, originalData);
      if (!result?.success) return result;
    }

    // Manage images
    await manageImages(selectedRowData, formState?.title, currentImages, pendingImages);

    // Handle industry changes
    if (industriesChanged) {
      const result = await manageIndustries(
        formState?.title,
        formState?.industries,
        originalIndustries,
        modifiedIndustries
      );
      if (!result?.success) return result;
    }

    // Upload pending GIFs
    await uploadPendingGifs(formState?.title, formState?.industries, pendingGifs);

    return { success: true };
  } catch (error) {
    console.log("Error in handleSave:", error);
    return { success: false, error: "Request failed" };
  }
};

export const createProject = async (projectData) => {
  try {
    // Process industries with GIF uploads

    const processedIndustries = [];

    if (projectData?.industry && Array.isArray(projectData?.industry)) {
      for (const industry of projectData?.industry) {
        let processedIndustry = { ...industry };

        // If industry has a GIF file, upload it first

        if (industry?.gifFile) {
          const gifUploadResult = await uploadGif(projectData?.title, industry?.industry_name, industry?.gifFile);

          if (gifUploadResult?.success) {
            processedIndustry.demo_gif = gifUploadResult?.data?.url;
          } else {
            return {
              success: false,
              error: `GIF upload failed for ${industry?.industry_name}: ${gifUploadResult?.error}`,
            };
          }

          // Remove the file object from the industry data

          delete processedIndustry.gifFile;
        }

        processedIndustries.push(processedIndustry);
      }
    }

    const payload = {
      action: "create-project",

      title: projectData?.title,

      description: projectData?.description || "",

      category: projectData?.category || [],

      path: projectData?.path || "",

      tech_stack: projectData?.tech_stack || "",

      deploy_infra: projectData?.deploy_infra || false,

      status: projectData?.status || "inprogress",

      Project_stakeholders: projectData?.Project_stakeholders || [],

      industry: processedIndustries,

      images: projectData?.images || [],

      youtube_link: projectData?.youtube_link || "",

      Primary_industry: projectData?.Primary_industry || "",

      search_keywords: Array.isArray(projectData?.search_keywords) ? projectData?.search_keywords : [],
    };

    const response = await fetch(`${API_BASE_URL}/admin/projects/`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(payload),
    });

    const responseText = await response?.json();

    // Check for success - be more lenient
    if (
      response?.status === 200 ||
      response?.status === 201 ||
      responseText?.status_code === 200 ||
      responseText?.success === true ||
      !responseText?.error
    ) {
      return { success: true, data: responseText };
    } else {
      return { success: false, error: "Request failed" };
    }
  } catch (error) {
    return { success: false, error: "Something went wrong!" };
  }
};

export const updateDemo = async (title, updateData) => {
  try {
    const requestPayload = {
      action: "update-fields",

      ...updateData,
    };

    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "PATCH",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(requestPayload),
    });

    const responseText = await response?.json();
    if (responseText?.status_code == 200 && responseText?.success === true) {
      return { success: true, project: responseText?.project };
    } else {
      return { success: false, error: "Request failed" };
    }
  } catch (error) {
    console.error("API Request failed:", error);

    return { success: false, error: "Request failed" };
  }
};

export const deleteProject = async (title) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "DELETE",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        action: "delete-project",
      }),
    });

    const responseText = await response?.json();
    if (responseText?.status_code == 200 && responseText?.success === true) {
      return { success: true };
    }
    return { success: false, error: "Request failed" };
  } catch (error) {
    return { success: false, error: "Request failed" };
  }
};

// Image upload workflow using pre-signed URLs with 5 image limit

export const uploadImages = async (title, files) => {
  try {
    const uploadedUrls = [];

    // Validate file count limit

    if (files?.length > 5) {
      return { success: false, error: "Maximum 5 images can be uploaded at once" };
    }

    for (const file of Array.from(files)) {
      // Validate file type on frontend

      const fileType = file?.name?.split(".")?.pop()?.toLowerCase();

      if (!["jpg", "jpeg", "png", "gif", "webp"]?.includes(fileType)) {
        return { success: false, error: "Only .jpg, .jpeg, .png, .gif, .webp files are allowed" };
      }

      // Step 1: Get pre-signed URL (backend will check 5 image limit)

      const urlResponse = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          action: "get-upload-url",

          filename: file?.name,
        }),
      });

      const urlResult = await urlResponse?.json();
      if (!(urlResult?.status_code == 200 && urlResult?.success === true)) {
        return { success: false, error: "Failed to get upload URL" };
      }

      // Step 2: Upload directly to S3

      const uploadResponse = await fetch(urlResult?.upload_url, {
        method: "PUT",

        body: file,

        headers: {
          "Content-Type": urlResult?.content_type,
        },
      });

      if (uploadResponse?.status !== 200 && !uploadResponse?.ok) {
        return { success: false, error: "S3 upload failed" };
      }

      // Step 3: Update database

      const updateResponse = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          action: "update-media-url",

          s3_key: urlResult?.s3_key,
        }),
      });

      const updateResult = await updateResponse?.json();
      if (updateResult?.status_code === 200 && updateResult?.success === true) {
        uploadedUrls.push(updateResult?.media_url);
      } else {
        return { success: false, error: "Failed to update media URL" };
      }
    }

    return { success: true, data: { urls: uploadedUrls } };
  } catch (error) {
    return { success: false, error: "Failed to update media URL" };
  }
};

// Upload GIF/MP4 media using pre-signed URLs

export const uploadGif = async (title, industryName, file) => {
  try {
    // Validate file type on frontend

    const fileType = file?.name?.split(".")?.pop()?.toLowerCase();

    if (!["gif", "mp4"]?.includes(fileType)) {
      return { success: false, error: "Only .gif and .mp4 files are allowed" };
    }

    // Step 1: Get pre-signed URL

    const urlResponse = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        action: "get-upload-url",

        industry_name: industryName,

        filename: file?.name,
      }),
    });

    const urlResult = await urlResponse?.json();
    if (!(urlResult?.status_code == 200 && urlResult?.success === true)) {
      return { success: false, error: "Failed to get upload URL" };
    }

    // Step 2: Upload directly to S3

    const uploadResponse = await fetch(urlResult?.upload_url, {
      method: "PUT",

      body: file,

      headers: {
        "Content-Type": urlResult?.content_type,
      },
    });

    if (uploadResponse?.status !== 200) {
      return { success: false, error: "S3 upload failed" };
    }

    // Step 3: Update database

    const updateResponse = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        action: "update-media-url",

        s3_key: urlResult?.s3_key,

        industry_name: industryName,
      }),
    });

    const updateResult = await updateResponse?.json();
    if (updateResult?.status_code === 200 && updateResult?.success === true) {
      return { success: true, data: { url: updateResult?.media_url } };
    }
    return { success: false, error: "Failed to update media URL" };
  } catch (error) {
    return { success: false, error: "Failed to update media URL" };
  }
};

export const deleteImages = async (title, imageUrls) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "DELETE",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        action: "delete-images",

        image_urls: imageUrls,
      }),
    });

    const result = await response?.json();
    if (result?.status_code == 200 && result?.success === true) {
      return { success: true, data: result };
    } else {
      // console.log("Failed to delete images:", result?.error);
      return { success: false, error: "Failed to delete images" };
    }
  } catch (error) {
    console.error("Delete images error:", error);

    return { success: false, error: "Failed to delete images" };
  }
};

export const deleteGif = async (title, industryIndex, industryName) => {
  try {
    const requestBody = {
      action: "delete-gif",
    };

    if (industryIndex !== null && industryIndex !== undefined) {
      requestBody.industry_index = industryIndex;
    } else if (industryName) {
      requestBody.industry_name = industryName;
    }

    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "DELETE",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(requestBody),
    });

    const result = await response?.json();
    if (result?.status_code == 200 && result?.success === true) {
      return { success: true };
    } else {
      // console.error("Failed to delete GIF:", result?.error);
      return { success: false, error: "Failed to delete GIF" };
    }
  } catch (error) {
    console.error("Delete GIF error:", error);

    return { success: false, error: "Failed to delete GIF" };
  }
};

export const addIndustry = async (title, industryData, gifFile = null) => {
  try {
    let gifUrl = "";

    // If GIF file is provided, upload it first

    if (gifFile) {
      const gifUploadResult = await uploadGif(title, industryData?.name, gifFile);

      if (gifUploadResult?.success) {
        gifUrl = gifUploadResult?.data?.url;
      } else {
        //   console.error("API: GIF upload failed:", gifUploadResult?.error);

        return { success: false, error: `GIF upload failed` };
      }
    }

    const requestBody = {
      action: "add-industry",

      industry: {
        industry_name: industryData?.name || "",

        description: industryData?.description || "",

        industry_description: industryData?.industryDescription || "",

        marketing_headline: industryData?.marketingLine || "",

        problem_statement: industryData?.problemStatement || "",

        solution: industryData?.solution || "",

        demo_gif: gifUrl,
      },
    };

    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(requestBody),
    });

    const result = await response?.json();
    if (result?.status_code == 200 && result?.success === true) {
      return { success: true, project: result?.project };
    }
    return { success: false, error: "Failed to add industry" };
  } catch (error) {
    // console.error("API: Error adding industry:", error);

    return { success: false, error: "Failed to add industry" };
  }
};

export const deleteIndustry = async (title, industryIndex, industryName) => {
  try {
    const requestBody = {
      action: "delete-industry",
    };

    if (industryIndex !== null && industryIndex !== undefined) {
      requestBody.industry_index = industryIndex;
    } else if (industryName) {
      requestBody.industry_name = industryName;
    }

    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "DELETE",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(requestBody),
    });

    const result = await response?.json();
    if (result?.status_code == 200 && result?.success === true) {
      return { success: true };
    }
    return { success: false, error: "Request failed" };
  } catch (error) {
    return { success: false, error: "Request failed" };
  }
};

export const fetchGlobalIndustries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/industries`, {
      method: "GET",

      headers: { "Content-Type": "application/json" },
    });

    const result = await response?.json();
    if (result?.status_code == 200 && result?.success === true) {
      return { success: true, industries: result?.industries };
    }
    return { success: false, error: "Failed to fetch industries" };
  } catch (error) {
    return { success: false, error: "Failed to fetch industries" };
  }
};

export const fetchAllIndustries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/industries`, {
      method: "GET",

      headers: { "Content-Type": "application/json" },
    });

    const result = await response?.json();
    if (result?.status_code == 200 && result?.success === true) {
      return result?.industries || [];
    }
    // console.error("Failed to fetch industries:", result?.error);
    return [];
  } catch (error) {
    console.log("error", error);
    return [];
  }
};

export const refreshIndustries = async () => {
  try {
    const industries = await fetchAllIndustries();

    return industries;
  } catch (error) {
    console.error("API: Error refreshing industries:", error);
    return [];
  }
};

export const addGlobalIndustry = async (industryName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/industries`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        action: "add-global-industry",

        industry_name: industryName,
      }),
    });

    const result = await response?.json();
    const apiResult =
      result?.status_code == 200 && result?.success === true
        ? { success: true }
        : { success: false, error: "Request failed" };

    // Don't clear cache automatically

    return apiResult;
  } catch (error) {
    return { success: false, error: "Request failed" };
  }
};

export const deleteGlobalIndustry = async (industryName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/industries/${encodeURIComponent(industryName)}`, {
      method: "DELETE",

      headers: { "Content-Type": "application/json" },
    });

    const result = await response?.json();
    const apiResult =
      result?.status_code == 200 && result?.success === true
        ? { success: true }
        : { success: false, error: "Request failed" };

    // Don't clear cache automatically

    return apiResult;
  } catch (error) {
    return { success: false, error: "Request failed" };
  }
};

export const updateIndustriesBatch = async (title, industries) => {
  try {
    const requestBody = {
      action: "update-industries-batch",

      industries: industries?.map((industry) => ({
        industry_name: industry?.name || "",

        description: industry?.description || "",

        marketing_headline: industry?.marketingLine || "",

        problem_statement: industry?.problemStatement || "",

        solution: industry?.solution || "",
      })),
    };

    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(requestBody),
    });

    const responseText = await response?.json();
    if (responseText?.status_code == 200 && responseText?.success === true && responseText?.project) {
      return { success: true, project: responseText?.project };
    }

    return { success: false, error: "Request failed" };
  } catch (error) {
    console.error("API: Batch update industries error:", error);

    return { success: false, error: "Request failed" };
  }
};

export const updateIndustry = async (title, industryIndex, industryData) => {
  try {
    const requestBody = {
      action: "update-industry",

      industry_index: industryIndex,

      industry: {
        industry_name: industryData?.name || "",

        description: industryData?.description || "",

        industry_description: industryData?.industryDescription || "",

        marketing_headline: industryData?.marketingLine || "",

        problem_statement: industryData?.problemStatement || "",

        solution: industryData?.solution || "",
      },
    };

    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(title)}`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(requestBody),
    });

    const responseText = await response?.json();
    if (responseText?.status_code == 200 && responseText?.success === true && responseText?.project) {
      return { success: true, project: responseText?.project };
    }

    return { success: false, error: "Request failed" };
  } catch (error) {
    return { success: false, error: "Request failed" };
  }
};

// Update projects order based on drag-and-drop reordering

export const updateProjectsOrder = async (projectIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        action: "update-order",

        project_ids: projectIds,
      }),
    });

    const responseText = await response?.json();
    if (responseText?.status_code == 200 && responseText?.success === true) {
      return { success: true, data: responseText };
    }
    return { success: false, error: "Request failed" };
  } catch (error) {
    console.error("Error updating projects order:", error);

    return { success: false, error: "Request failed" };
  }
};

export const bookDemo = async (projectTitle, bookingData) => {
  try {
    const payload = {
      action: "book-demo",

      ...bookingData,
    };

    const response = await fetch(`${API_BASE_URL}/user/projects/${encodeURIComponent(projectTitle)}`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(payload),
    });

    const responseText = await response?.json();
    if (responseText?.status_code == 200 && responseText?.success === true) {
      return { success: true, data: responseText };
    }
    return { success: false, error: "Request failed" };
  } catch (error) {
    return { success: false, error: "Request failed" };
  }
};

export const fetchSingleProject = async (projectTitle) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/projects/${encodeURIComponent(projectTitle)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response?.json();

    if (result?.status_code == 200 && result?.success === true) {
      return { success: true, project: result?.project };
    }
    return { success: false, error: "Request failed" };
  } catch (error) {
    return { success: false, error: "Request failed" };
  }
};
// ============================================================================
// RDS DEPLOYMENT FUNCTIONS

// ============================================================================

// REAL API CALLS - ACTIVE
export const deployInfrastructure = async (projectTitle) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(projectTitle)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deploy-infrastructure",
      }),
    });
    const result = await response?.json();

    if (result?.status_code === 200 && result?.deployment_status && result?.rds_status) {
      return {
        success: true,
        data: {
          deployment_status: result?.deployment_status,
          rds_status: result?.rds_status,
        },
      };
    } else {
      return {
        success: false,
        error: typeof result?.error === "object" ? JSON.stringify(result.error) : result?.error || "Deployment failed",
        statusCode: result?.status_code,
      };
    }
  } catch (error) {
    return { success: false, error: "Deployment failed" };
  }
};

export const stopInfrastructure = async (projectTitle) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(projectTitle)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "stop-infrastructure",
      }),
    });
    const result = await response?.json();
    if (result?.status_code === 200 && result?.deployment_status && result?.rds_status) {
      return {
        success: true,
        data: {
          deployment_status: result?.deployment_status,
          rds_status: result?.rds_status,
        },
      };
    } else {
      return {
        success: false,
        error:
          typeof result?.error === "object"
            ? JSON.stringify(result.error)
            : result?.error || "Stop infrastructure failed",
        statusCode: result?.status_code,
      };
    }
  } catch (error) {
    return { success: false, error: "Stop infrastructure failed" };
  }
};

export const getDeploymentStatus = async (projectTitle) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${encodeURIComponent(projectTitle)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get-deployment-status",
      }),
    });
    const result = await response?.json();
    if (result?.status_code === 200 && result?.deployment_status && result?.rds_status) {
      return {
        success: true,
        data: {
          deployment_status: result?.deployment_status,
          rds_status: result?.rds_status,
          success: result?.success,
        },
      };
    } else {
      return {
        success: false,
        error: typeof result?.error === "object" ? JSON.stringify(result.error) : result?.error || "Operation failed",
        statusCode: result?.status_code,
      };
    }
  } catch (error) {
    return { success: false, error: "Operation failed" };
  }
};

export const fetchAllKeywords = async () => {
  try {
    const projects = await fetchData();
    const allKeywords = new Set();

    projects?.forEach((project) => {
      // Check both search_keywords and keywords fields
      const keywords = project?.search_keywords || project?.keywords || [];
      if (Array.isArray(keywords)) {
        keywords?.forEach((keyword) => {
          if (keyword && typeof keyword === "string" && keyword?.trim()) {
            allKeywords.add(keyword?.trim()?.toLowerCase());
          }
        });
      }
    });

    return Array.from(allKeywords).sort();
  } catch (error) {
    console.error("Error fetching keywords:", error?.message);
    return [];
  }
};
