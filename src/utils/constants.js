export const PROJECT_PATHS = {
  'arogya-mitra': '/arogya-mitra',
  'Arogya Mitra': '/arogya-mitra',
  'intelligent-document-processing': '/idp',
  'IntelliDoc': '/idp',
  'ai-content-and-video-generator': '/ai-content-video',
  'Vistora': '/ai-content-video',
  'pharma-bot': '/pharmabot',
  'VendorIQ': '/pharmabot',
  'generative-ai-documents': '/genai/doc',
  'Generative AI Documents': '/genai/doc',
  'genai-docs': '/genai/doc',
  'genai-doc': '/genai/doc',
  'GenAI Docs': '/genai/doc',
  'generative-ai-videos': '/genai/videos',
  'QUESTA': '/genai/videos',
  'genai-videos': '/genai/videos',
  'GenAI Videos': '/genai/videos',
  'generative-ai-resumes': '/genai/resumes',
  'Generative AI Resumes': '/genai/resumes',
  'genai-resumes': '/genai/resumes',
  'GenAI Resumes': '/genai/resumes',
  'seo-optimization': '/seo-optimization',
  'ElevateSEO': '/seo-optimization',
  // 'sow-automation': '/blank',
  // 'SOW Automation': '/blank',
  'rfp/eoi-summarizer': '/blank',
  //'MINIQ': '/blank',
  'hire': '/hire',
  'HiRE': '/hire',
  'rtcca': '/rtcca',
  'VOCAL': '/rtcca'
};

export const getProjectPath = (projectName) => {
  return PROJECT_PATHS[projectName] || `/${projectName.toLowerCase().replace(/\s+/g, '-')}`;
};