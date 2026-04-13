import React, { createContext, useState, useContext } from 'react';
 
const SearchContext = createContext();
 
export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
 
  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};
 
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    return { searchTerm: '', setSearchTerm: () => {} };
  }
  return context;
};
 
export default SearchContext;