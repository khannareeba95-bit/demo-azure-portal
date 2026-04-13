import { ThumbsDown, ThumbsUp, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { submitFeedbackToAPI } from '../helpers'


const FEEDBACK_TYPES = {
    LIKE: 'like',
    DISLIKE: 'dislike'
}

const TOAST_DURATION = 2000
const TOAST_MESSAGES = {
    SUCCESS: 'Feedback submitted.',
    ERROR: 'Something went wrong.'
}

const Feedback = ({ message, feedbackId, setMessages }) => {

    const [feedbackState, setFeedbackState] = useState({
        showInput: false,
        text: '',
        showToast: false,
        toastMessage: ''
    })


    useEffect(() => {
        let toastTimer
        if (feedbackState.showToast) {
            toastTimer = setTimeout(() => {
                setFeedbackState(prev => ({
                    ...prev,
                    showToast: false
                }))
            }, TOAST_DURATION)
        }
        return () => clearTimeout(toastTimer)
    }, [feedbackState.showToast])

    const handleFeedbackClick = async (type) => {
        const isDislike = type === FEEDBACK_TYPES.DISLIKE
        const feedbackData = {
            feedback: type,
            feedbackText: isDislike ? feedbackState.text : '',
            feedbackId
        }

        if (type === FEEDBACK_TYPES.LIKE) {
            // dispatch({
            //     type: ACTIONS.HANDLE_LIKE,
            //     payload: message?.id
            // })
            setMessages(prev => prev.map((msg, ind) => {
                if (message.id === msg.id) {
                    return { ...msg, feedback: "like" }
                }
                return msg;
            }))
            try {
                await submitFeedbackToAPI(feedbackData)
                setFeedbackState(prev => ({
                    ...prev,
                    showToast: true,
                    toastMessage: TOAST_MESSAGES.SUCCESS,
                    showInput: isDislike,
                    text: isDislike ? prev.text : ''
                }))
            } catch (error) {
                setFeedbackState(prev => ({
                    ...prev,
                    showToast: true,
                    toastMessage: TOAST_MESSAGES.ERROR
                }))
            }
        } else {
            setFeedbackState(prev => ({
                ...prev,
                showToast: false,
                toastMessage: "",
                showInput: true,
                text: ''
            }))
        }
    }

    const handleTextSubmit = async () => {
        if (!feedbackState.text.trim()) return

        const feedbackData = {
            feedback: FEEDBACK_TYPES.DISLIKE,
            feedbackText: feedbackState.text,
            feedbackId
        }

        // dispatch({
        //     type: ACTIONS.HANDLE_DISLIKE,
        //     payload: message?.id
        // })
        setMessages(prev => prev.map((msg, ind) => {
            if (message.id === msg.id) {
                return { ...msg, feedback: "dislike" }
            }
            return msg;
        }))
        try {
            await submitFeedbackToAPI(feedbackData)
            setFeedbackState(prev => ({
                ...prev,
                showToast: true,
                toastMessage: TOAST_MESSAGES.SUCCESS,
                showInput: false,
                text: ''
            }))
        } catch (error) {
            setFeedbackState(prev => ({
                ...prev,
                showToast: true,
                toastMessage: TOAST_MESSAGES.ERROR
            }))
        }
    }


    useEffect(() => {
        let toastTimer
        if (feedbackState.showToast) {
            toastTimer = setTimeout(() => {
                setFeedbackState(prev => ({
                    ...prev,
                    showToast: false
                }))
            }, 2000)
        }
        return () => clearTimeout(toastTimer)
    }, [feedbackState.showToast])


    return (
        <div className="flex flex-col w-full max-w-2xl mt-2">
            <div className="flex space-x-2 items-center">
                <button
                    onClick={() => handleFeedbackClick(FEEDBACK_TYPES.LIKE)}
                    className={` rounded-lg transition-colors duration-200 hover:bg-gray-100
          ${message?.feedback === FEEDBACK_TYPES.LIKE ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <ThumbsUp className="h-4 w-4" />
                </button>
                <div className="w-[0.1px] bg-gray-600 h-[20px]" />
                {feedbackState?.showInput ? <button
                    onClick={() => setFeedbackState(prev => ({
                        ...prev,
                        showInput: false,
                        text: ''
                    }))}
                    className={`p-1.5 rounded-lg transition-colors duration-200 hover:bg-gray-100 `}
                >
                    <X className="h-4 w-4" />
                </button> : <button
                    onClick={() => handleFeedbackClick(FEEDBACK_TYPES.DISLIKE)}
                    className={`p-1.5 rounded-lg transition-colors duration-200 hover:bg-gray-100 
          ${message?.feedback === FEEDBACK_TYPES.DISLIKE ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <ThumbsDown className="h-4 w-4" />
                </button>}
            </div>

            {feedbackState.showInput && (
                <div className="mt-4 space-y-3">
                    <textarea
                        placeholder="Please provide detailed feedback on the expected response..."
                        value={feedbackState.text}
                        onChange={(e) => setFeedbackState(prev => ({
                            ...prev,
                            text: e.target.value
                        }))}
                        className="w-full h-[70px] px-4 py-3 text-sm text-gray-700
              border border-gray-200 rounded-lg resize-y
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              transition-all duration-200"
                    />

                    <button
                        onClick={handleTextSubmit}
                        disabled={!feedbackState.text.trim()}
                        className="px-4 py-2 text-sm font-medium text-white
              bg-blue-600 rounded-lg 
              transition-all duration-200
              hover:bg-blue-700 
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:bg-blue-600
              shadow-sm hover:shadow"
                    >
                        Submit Feedback
                    </button>
                </div>
            )}

            {feedbackState.showToast && (
                <span className='text-green-700 font-semibold text-[13px]'>
                    {feedbackState.toastMessage}
                </span>
            )}
        </div>
    )
}

export default Feedback