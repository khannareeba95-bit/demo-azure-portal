import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookCopy } from 'lucide-react';

export const KeynotePanel = ({ keynoteResponses = [], audioId }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const formatTime = (timeString) => {
    return timeString || '00:00:00';
  };

  if (!keynoteResponses || keynoteResponses?.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <BookCopy className="text-gray-600" size={24} />
        </div>
        <p className="text-gray-600 font-semibold text-md mt-2">Keynote content will appear here</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {keynoteResponses?.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleExpanded(index)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {expandedItems?.has(index) ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="text-sm font-medium text-gray-900">Keynote {index + 1}</div>
              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                {formatTime(item?.startTime)} - {formatTime(item?.endTime)}
              </div>
            </div>
          </div>

          {expandedItems?.has(index) && (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="text-sm text-gray-700 leading-relaxed">
                {item.keynote || 'No keynote content available'}
              </div>
              {/* {item.timestamp && (
                <div className="mt-3 text-xs text-gray-400">Generated: {new Date(item.timestamp).toLocaleString()}</div>
              )} */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
