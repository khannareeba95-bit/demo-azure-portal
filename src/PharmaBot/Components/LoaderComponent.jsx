import { Bot } from 'lucide-react'
import React from 'react'

const LoaderComponent = () => {
    return (
        <div className="flex w-full justify-start">
            <div className="flex w-full gap-2">
                <div className="h-[30px] w-[30px] bg-gray-300 rounded-full flex items-center justify-center">
                    <Bot size={18} />
                </div>
                <div className="p-4 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none shadow-md border border-gray-200">
                    <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoaderComponent