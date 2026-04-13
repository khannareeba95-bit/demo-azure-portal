import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', action = null, projectName = null) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, action, projectName };
    
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast?.id !== id));
  };

  const showProjectToast = (action, projectName) => {
    showToast('', 'success', action, projectName);
  };

  return { toasts, showToast, removeToast, showProjectToast };
};