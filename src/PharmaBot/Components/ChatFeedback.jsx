import { ArrowLeft, ChevronDown, ChevronLeft, Filter, TriangleAlert } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { baseURL } from '../helpers'
import ResponseType from './ResponseType'

const Feedback = ({ setMenuSelection }) => {
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState([])
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const userSelectionRef = useRef();
  const [names, setNames] = useState([]);

  const [loading, setLoading] = useState(false)

  const handleNameSelect = (name) => {
    setSelectedName(name);
    setShowNameDropdown(false);
  };


  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        let response = await fetch(baseURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "getFeedback": true
          })
        }).then(res => res.json())
        setFeedbacks(response?.Items?.sort((a, b) => new Date(b.questiontimestamp.S) - new Date(a.questiontimestamp.S)))
        setNames([...new Set(response?.Items?.map(response => response?.user?.S))])
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })()
  }, [])

  let filteredFeedbacks = useMemo(() => {
    if (selectedName && selectedDate) {
      return feedbacks.filter(feedback => feedback.user.S === selectedName && new Date(feedback.questiontimestamp.S).toLocaleDateString() === new Date(selectedDate).toLocaleDateString());
    } else if (selectedName) {
      return feedbacks.filter(feedback => feedback.user.S === selectedName);
    } else if (selectedDate) {
      return feedbacks.filter(feedback => new Date(feedback.questiontimestamp.S).toLocaleDateString() === new Date(selectedDate).toLocaleDateString());
    } else {
      return feedbacks;
    }
  }, [selectedDate, selectedName, feedbacks])

  if (feedbacks?.length === 0 && !loading) {
    return (
      <>
        <div onClick={() => setMenuSelection(false)} className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-20 z-[990]  overflow-hidden" />
        <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[991] bg-white p-4 max-h-[90%] overflow-y-auto rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <TriangleAlert size={60} className='text-red-500' />
            <h1 className='text-lg font-normal'>No feedbacks present.</h1>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return <>
      <div onClick={() => setMenuSelection(false)} className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-20 z-[990]  overflow-hidden" />
      <div className="fixed top-[50%] left-[50%] translate-x-[-50%] p-4 translate-y-[-50%] z-[991] bg-white max-h-[90%] overflow-y-auto rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className=" text-gray-800 ">
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          <div className="text-gray-700 mt-4">Loading Feedback...</div>
        </div>
      </div>
    </>
  }


  return (
    <>
      <div onClick={() => setMenuSelection(false)} className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-20 z-[990]  overflow-hidden" />
      <div className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[991] bg-white w-[90%] max-h-[90%] overflow-y-auto rounded-xl  '>
        <div className="sticky top-0 py-6 bg-white z-50 border-b border-gray-100 shadow-sm">
          <div className="px-6 md:px-8">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Bot Feedback</h1>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-end items-center gap-4 mt-6">
              {/* Name Dropdown */}
              <div ref={userSelectionRef} className="relative">
                <button
                  onClick={() => setShowNameDropdown(!showNameDropdown)}
                  className="w-44 px-4 py-2 text-left bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
                >
                  <span className="truncate text-gray-700">{selectedName || "Select name"}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {showNameDropdown && (
                  <div className="absolute overflow-y-auto max-h-72 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {names.map((name) => (
                      <div
                        key={name}
                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-gray-700 transition-colors duration-150"
                        onClick={() => handleNameSelect(name)}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Picker */}
              <div className="relative">
                <input
                  type="date"
                  className="w-44 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Clear Filters Button - Only shows when filters are active */}
              {(selectedName || selectedDate) && (
                <button
                  onClick={() => {
                    setSelectedDate("");
                    setSelectedName("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
                >
                  <Filter size={16} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mx-auto p-6 overflow-y-auto h-full">
          {filteredFeedbacks.length > 0 ? filteredFeedbacks?.map(feedback => <Review feedback={feedback} />) : <h1 className='text-center font-semibold text-2xl text-[#ccc]'>No feedbacks found!</h1>}
        </div>
      </div>
    </>
  )
}

const Review = ({ feedback }) => {
  const [showSqlQuery, setShowSqlQuery] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  let feedbackBody = {
    type: feedback?.response_type?.S,
    // text: feedback?.qresponse?.S,
    text: feedback?.response_type?.S === 'table' ? JSON.parse(
      feedback?.qresponse?.S.replace(/NaN/ig, 'null').replace(/None/ig, 'null')
    ) : feedback?.qresponse?.S,
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-6 hover:shadow-xl transition-all duration-300 border border-gray-100 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shadow-sm">
            <span className="text-indigo-600 text-lg font-semibold">
              {feedback?.user?.S?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {feedback?.user?.S}
            </h3>
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              {formatDate(feedback?.questiontimestamp?.S)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
          <div
            className={`h-2.5 w-2.5 rounded-full ${feedback?.feedback?.S === 'dislike' ? "bg-red-600" : "bg-green-600"}  animate-pulse`}
          />
          <span className={` font-medium text-sm ${feedback?.feedback?.S === 'dislike' ? "text-red-600" : "text-green-600"}`}>
            {feedback?.feedback?.S?.toUpperCase() === "DISLIKE" ? "DISLIKED" : "LIKED"}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h1 className='text-xl font-semibold text-gray-800 mb-2 leading-relaxed'>
          {feedback?.question?.S}
        </h1>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowSqlQuery(prev => !prev)}
          className='text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium text-sm flex items-center gap-1.5 bg-indigo-50 px-4 py-2 rounded-lg transition-colors duration-200'
        >
          <span>SQL Query</span>
          <ChevronDown
            size={18}
            className={`transform transition-transform duration-200 ${showSqlQuery ? 'rotate-180' : ''}`}
          />
        </button>

        {showSqlQuery && (
          <div className="mt-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
              {feedback?.sql_query?.S}
            </pre>
          </div>
        )}
      </div>

      <div style={{
        maxWidth: 'fit-content'
      }} className='mb-6'>
        <ResponseType chat={feedbackBody} setMessages={() => { }} type='feedback' />
      </div>
      {/* {renderQueryResponse(feedback?.qresponse.S, feedback?.response_type?.S)} */}

      {feedback?.feedbacktext && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-indigo-500" />
            <span className="font-semibold text-gray-700">Review</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {feedback?.feedbacktext?.S?.split(':')[1]}
          </p>
        </div>
      )}
    </div>
  );
};
export default Feedback