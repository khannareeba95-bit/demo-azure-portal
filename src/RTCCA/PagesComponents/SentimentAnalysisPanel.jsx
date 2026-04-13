import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react"

export const SentimentAnalysisPanel = ({ sentimentAnalysisResponses, audioPlayers, audioId, responses, index }) => {

  const sentimentAnalysisPanelRef = useRef();

  const [toggle, setToggle] = useState(true);
  useEffect(() => {
    if (sentimentAnalysisPanelRef.current) {
      sentimentAnalysisPanelRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sentimentAnalysisResponses])

  return <div  key={`sentiment-${audioId}`} className=" p-4">
    {}
    {<div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {responses?.map((item, idx) => (
            <tr key={`sentiment-item-${idx}`} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="py-2 px-4 text-sm text-gray-900">{item.Start_Time}</td>
              <td className="py-2 px-4 text-sm text-gray-900">{item.End_Time}</td>
              <td className="py-2 px-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                ${item.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-800' :
                    item.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                  {item.sentiment}
                </span>
              </td>
            </tr>
          ))}
          {responses?.length === 0 && (
            <tr>
              <td colSpan="3" className="py-4 text-center text-sm text-gray-500">No sentiment data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>}
  </div>
}