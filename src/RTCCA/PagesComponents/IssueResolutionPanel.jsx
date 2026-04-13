import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { FormatSolution } from '../utils/FormatSolution';

export const IssueResolutionPanel = ({ audioPlayers, audioId, solutions }) => {
  return (
    <div key={`solution-${audioId}`} className="p-4">
      {
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recommended Solution
                </th>
              </tr>
            </thead>
            <tbody>
              {solutions &&
                solutions.map((solution, idx) => (
                  <tr key={`solution-item-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-4 flex items-start text-sm text-gray-900 whitespace-nowrap">
                      {solution.time}
                    </td>
                    <td className=" px-4 text-sm text-gray-900">
                      <FormatSolution solution={solution?.solution} />
                      {/* {formatSolution(solution.solution)} */}
                    </td>
                  </tr>
                ))}
              {(!solutions || solutions.length === 0) && (
                <tr>
                  <td colSpan="2" className="py-4 text-center text-sm text-gray-500">
                    No recommendations available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};
