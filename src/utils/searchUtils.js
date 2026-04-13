/**
 * Frontend-only search utility for filtering projects
 * Handles case-insensitive search across multiple fields
 */

export const searchProjects = (projects, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return projects;
  }

  // Normalize search term: lowercase, trim, and remove special characters
  const searchNormalized = searchTerm.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const results = projects.filter((project, index) => {
    // Helper function to normalize and check match
    const normalizeAndCheck = (text) => {
      if (!text) return false;
      const normalized = text.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      return normalized.includes(searchNormalized);
    };

    // Search in search_keywords (array)
    const searchKeywords = project?.search_keywords || project?.keywords || [];
    const searchKeywordsMatch = Array.isArray(searchKeywords) && 
      searchKeywords.some(keyword => normalizeAndCheck(keyword));
    
    // Search in title
    const titleMatch = normalizeAndCheck(project?.title);
    
    // Search in Primary_industry
    const primaryIndustryMatch = normalizeAndCheck(project?.Primary_industry);
    
    // Search in category array
    const category = project?.category || [];
    const categoryMatch = Array.isArray(category) && 
      category.some(cat => normalizeAndCheck(cat));
    
    // Search in industry names only
    const industryMatch = project?.industry && Array.isArray(project?.industry) &&
      project?.industry.some(ind => normalizeAndCheck(ind?.industry_name));
    
    const isMatch = searchKeywordsMatch || titleMatch || primaryIndustryMatch || categoryMatch || industryMatch;
    
    return isMatch;
  });
  
  return results;
};