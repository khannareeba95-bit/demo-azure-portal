import React, { useEffect } from 'react';

export const TabSwitchWarning = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Generation in Progress</h2>

        <p className="text-gray-600 mb-6">
          A video is currently being generated. If you switch tabs now, you won't see the generation progress in the
          Create Content tab, but the video will appear in Content Library once complete.
        </p>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Stay Here
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#1e3b8b] text-white rounded-lg hover:bg-[#152a63] transition-colors"
          >
            Switch Tab
          </button>
        </div>
      </div>
    </div>
  );
};
