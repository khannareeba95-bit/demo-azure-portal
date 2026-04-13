import React, { useState } from 'react'
import ResponseTable from './ResponseTable';
import Feedback from './Feedback';
import { ChevronDown } from 'lucide-react';

const ResponseType = ({ chat, setMessages, type }) => {

    const [showSqlQuery, setShowSqlQuery] = useState(false);

    if (chat.type === 'text') {
        return <div className="">
            <div className="">
                {chat.sender === 'bot' && <div className="mb-1 flex flex-col gap-1">
                    <span
                        onClick={() => setShowSqlQuery(prev => !prev)}
                        className='text-indigo-600 w-fit hover:text-indigo-700 cursor-pointer font-medium text-sm flex items-center gap-1.5 bg-indigo-50 px-4 py-2 rounded-lg transition-colors duration-200'
                    >
                        <span>Query</span>
                        <ChevronDown
                            size={18}
                            className={`transform transition-transform duration-200 ${showSqlQuery ? 'rotate-180' : ''}`}
                        />
                    </span>
                    <div className="">
                        {showSqlQuery && (
                            <div className="mt-4 bg-white p-6 rounded-xl border border-gray-100">
                                <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                                    {chat?.query}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>}
                <div className="">
                    {chat.text}
                </div>
            </div>
            < >
                {
                    chat.sender === 'bot' && <Feedback message={chat} feedbackId={chat?.refrenceUuid} setMessages={setMessages} />
                }
            </>

        </div>
    }

    return <div className="w-full">
        <ResponseTable tableData={chat?.text} responseQuery={chat?.query} type={type} />
        < >
            {
                chat.sender === 'bot' && <Feedback message={chat} feedbackId={chat?.refrenceUuid} setMessages={setMessages} />
            }
        </>
    </div>
}

export default ResponseType

