// Levenshtein distance for typo detection
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str1.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[str1.length][str2.length];
};

// Find typo suggestions
export const findTypoSuggestions = (input, availableKeywords) => {
  if (!input || input.length < 3) return [];
  
  const inputLower = input.toLowerCase();
  const suggestions = [];
  
  availableKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    if (keywordLower === inputLower) return;
    
    const distance = levenshteinDistance(inputLower, keywordLower);
    const similarity = 1 - (distance / Math.max(inputLower.length, keywordLower.length));
    
    // Check for common typos: missing letters, swapped letters
    const isMissingLetter = Math.abs(inputLower.length - keywordLower.length) === 1;
    const isSwappedLetter = inputLower.length === keywordLower.length && distance <= 2;
    
    if (similarity >= 0.6 || isMissingLetter || isSwappedLetter) {
      suggestions.push({ keyword, similarity });
    }
  });
  
  return suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(s => s.keyword);
};

// Get filtered suggestions
export const getKeywordSuggestions = (input, availableKeywords, currentKeywords = []) => {
  if (!input || input.length < 2) return [];
  
  const inputLower = input.toLowerCase();
  const currentLower = currentKeywords.map(k => k.toLowerCase());
  
  return availableKeywords
    .filter(keyword => {
      const keywordLower = keyword.toLowerCase();
      return keywordLower.includes(inputLower) && !currentLower.includes(keywordLower);
    })
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(inputLower);
      const bStarts = b.toLowerCase().startsWith(inputLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.length - b.length;
    })
    .slice(0, 5);
};