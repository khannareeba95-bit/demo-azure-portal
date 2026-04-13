import React, { use, useEffect, memo, useRef, useState } from 'react'
import ResponseType from './ResponseType';
import { Bot, User } from 'lucide-react';
import LoaderComponent from './LoaderComponent';

const Messages = memo(({ messages, setMessages, loading }) => {

    const messageContainerRef = useRef();


    useEffect(() => {
        messageContainerRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length])

    return (
        <div className="flex-1 w-full overflow-y-auto p-4">
            {messages?.length > 0 ? (
                <div className="flex flex-col gap-4 w-full p-4">
                    {messages.map((chat, index) => (
                        <div
                            ref={index === messages.length - 1 ? messageContainerRef : null}
                            key={index}
                            className={`flex w-full ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex w-full gap-2 ${chat.sender === 'user' && 'flex-row-reverse'}`}>
                                <div className={`h-[30px] w-[30px] ${chat.sender === 'user' ? 'bg-[#2563eb] text-white' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                                    {chat?.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                                <div
                                    className={`
                                                p-4 rounded-lg max-w-[90%]
                                            ${chat.type === 'text' ? 'break-words ' : ''}    
                                            ${chat.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                                            : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-md border border-gray-200'
                                        }
                    `}
                                >
                                    <ResponseType chat={chat} setMessages={setMessages} type="bot" />
                                </div>
                            </div>

                        </div>
                    ))}

                    {loading && <LoaderComponent />}
                </div>
            ) : (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-700">
                            How can I help you?
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Type a message to start the conversation
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
})

export default Messages