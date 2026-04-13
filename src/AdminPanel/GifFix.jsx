// FORCE GIF FIX - Direct localStorage manipulation
export const forceStoreGif = (projectTitle, industryName, file) => {
  const key = `gif_${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${industryName.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result.split(',')[1];
    localStorage.setItem(key, base64);
    // Force refresh all components
    window.location.reload();
  };
  reader.readAsDataURL(file);
};

export const forceLoadGif = (projectTitle, industryName) => {
  const key = `gif_${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${industryName.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    return `data:image/gif;base64,${stored}`;
  }
  return null;
};