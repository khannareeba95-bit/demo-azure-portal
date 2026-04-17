// All API endpoints — set corresponding VITE_* vars in your .env file
export const ENDPOINTS = {
  // Admin / Dashboard
  ADMIN_API:          import.meta.env.VITE_ADMIN_API_URL          || "",

  // OCR / IntelliDoc
  OCR_API:            import.meta.env.VITE_OCR_API_URL            || "",
  OCR_INVOICE_API:    import.meta.env.VITE_OCR_INVOICE_API_URL    || "",

  // GenAI
  GENAI_STATUS:       import.meta.env.VITE_GENAI_STATUS_URL       || "",
  GENAI_START:        import.meta.env.VITE_GENAI_START_URL        || "",
  GENAI_STOP:         import.meta.env.VITE_GENAI_STOP_URL         || "",
  GENAI_STATUS_OCR:   import.meta.env.VITE_GENAI_STATUS_OCR_URL   || "",
  GENAI_MCQ:          import.meta.env.VITE_GENAI_MCQ_URL          || "",
  GENAI_QNA:          import.meta.env.VITE_GENAI_QNA_URL          || "",
  GENAI_SUMMARY:      import.meta.env.VITE_GENAI_SUMMARY_URL      || "",
  GENAI_MATH_MCQ:     import.meta.env.VITE_GENAI_MATH_MCQ_URL     || "",
  GENAI_MATH_SUMMARY: import.meta.env.VITE_GENAI_MATH_SUMMARY_URL || "",

  // GenAI Resumes
  RESUME_QNA:         import.meta.env.VITE_RESUME_QNA_URL         || "",
  RESUME_SUMMARY:     import.meta.env.VITE_RESUME_SUMMARY_URL     || "",
  RESUME_ASSESSMENT:  import.meta.env.VITE_RESUME_ASSESSMENT_URL  || "",

  // GenAI JAM
  JAM_ASSESSMENT:     import.meta.env.VITE_JAM_ASSESSMENT_URL     || "",
  JAM_QNA:            import.meta.env.VITE_JAM_QNA_URL            || "",
  JAM_SUMMARY:        import.meta.env.VITE_JAM_SUMMARY_URL        || "",

  // NTT
  NTT_SUMMARY:        import.meta.env.VITE_NTT_SUMMARY_URL        || "",
  NTT_MCQ:            import.meta.env.VITE_NTT_MCQ_URL            || "",
  NTT_QNA:            import.meta.env.VITE_NTT_QNA_URL            || "",
  NTT_BEDROCK_SUMMARY:import.meta.env.VITE_NTT_BEDROCK_SUMMARY_URL|| "",

  // EY
  EY_MCQ:             import.meta.env.VITE_EY_MCQ_URL             || "",
  EY_QNA:             import.meta.env.VITE_EY_QNA_URL             || "",
  EY_SUMMARY:         import.meta.env.VITE_EY_SUMMARY_URL         || "",

  // PharmaBot
  PHARMA_CHATBOT:     import.meta.env.VITE_PHARMA_CHATBOT_URL     || "",
  PHARMA_FAQ:         import.meta.env.VITE_PHARMA_FAQ_URL         || "",

  // RTCCA (VOCAL)
  RTCCA_API:          import.meta.env.VITE_RTCCA_API_URL          || "",

  // AI Content / Video Generator
  VIDEO_GEN_API:      import.meta.env.VITE_VIDEO_GEN_API_URL      || "",

  // Interview Track (HiRE)
  INTERVIEW_API:      import.meta.env.VITE_INTERVIEW_API_URL      || "",

  // Arogya Mitra
  AROGYA_API:         import.meta.env.VITE_AROGYA_API_URL         || "",

  // SEO Optimization
  SEO_API:            import.meta.env.VITE_SEO_API_URL            || "",

  // Fintech / QuickSight
  QUICKSIGHT_API:     import.meta.env.VITE_QUICKSIGHT_API_URL     || "",

  // Metropolis
  METROPOLIS_API:     import.meta.env.VITE_METROPOLIS_API_URL     || "",

  // Observability
  OBSERVABILITY_API:  import.meta.env.VITE_OBSERVABILITY_API_URL  || "",

  // Azure projects API
  AZURE_API:          import.meta.env.VITE_AZURE_API_URL          || "",
};
