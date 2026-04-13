import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { FormatSolution } from '../utils/FormatSolution';

export const RecommendationPanel = ({ recommendationResponses = [], audioId }) => {
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

  if (!recommendationResponses || recommendationResponses?.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Lightbulb className="text-gray-600" size={24} />
        </div>
        <p className="text-gray-600 font-semibold text-md mt-2">Recommendation content will appear here</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {/* {recommendationResponses?.map((item, index) => ( */}
      {/* <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          //onClick={() => toggleExpanded(index)}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              {expandedItems.has(index) ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="text-sm font-medium text-gray-900">Recommendation {index + 1}</div>
          </div>
        </div> */}

      {/* {expandedItems?.has(index) && ( */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="text-sm text-gray-700 leading-relaxed">
          {recommendationResponses?.[recommendationResponses?.length - 1] ? (
            <FormatSolution solution={recommendationResponses?.[recommendationResponses?.length - 1]?.solution} />
          ) : (
            'No recommendation content available'
          )}
        </div>
      </div>
      {/* )} */}
      {/* </div> */}
      {/* ))} */}
    </div>
  );
};
