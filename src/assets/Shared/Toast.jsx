import React, { useEffect, useState } from 'react';
import { Lucide } from '@/base-components';

const Toast = ({ message, type = 'success', onClose, action, projectName }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  const handleAnimationEnd = () => {
    if (!visible) {
      onClose();
    }
  };

  const getToastConfig = () => {
    if (action && projectName) {
      const configs = {
        added: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', message: `${projectName} added successfully!` },
        updated: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', message: `${projectName} updated successfully!` },
        deleted: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', message: `${projectName} deleted successfully!` },
        reordered: { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', message: `${projectName} reordered successfully!` },
        stopped: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', message: `${projectName} infrastructure stopped successfully!` },
        failed: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', message: `${projectName} deployment failed!` }
      };
      return configs[action] || configs.updated;
    }
    
    const typeConfigs = {
      success: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
      error: { color: 'text-red-700', bg: 'bg-white', border: 'border-gray-200' },
      info: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' }
    };
    return typeConfigs[type] || typeConfigs.success;
  };

  const config = getToastConfig();
  const displayMessage = config.message || (type === 'error' ? `${message}` : message);

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={`${config.bg} ${config.border} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-center justify-between">
          <div className="ml-4 mr-4">
            {type !== 'error' ? (
              <>
                <Lucide icon="CheckCircle" className="text-success" />
                <div className="font-medium">Success!</div>
                <div className="text-slate-500 mt-1">{displayMessage}</div>
              </>
            ) : (
              <>
                <div className="text-red-500 mt-1">{displayMessage}</div>
              </>
            )}
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 ml-4 text-lg"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
