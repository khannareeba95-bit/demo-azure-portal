import { BarChart2, Check, Copy, Loader2, Proportions } from 'lucide-react'
import React, { useState } from 'react'

const Description = ({ loading, description }) => {

  const [copiedDescription,setCopiedDescription] = useState(false);
  const hasDescription = description?.length > 0 && !loading;

  const handleCopyAllTaglines = async () => {
    try {
      await navigator.clipboard.writeText(description)
      setCopiedDescription(true)
      setTimeout(() => {
        setCopiedDescription(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy all taglines: ', err)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border my-4">
      <div className="p-4 flex justify-between items-center">
        <h1 className='text-[18px] flex items-center gap-2 sticky top-0 bg-white text-[#1a3b8b] font-[600]   '>
          <Proportions className="text-gray-600" size={24} />
          Description</h1>
        {hasDescription && (
          <div
            onClick={handleCopyAllTaglines}
            className="flex items-center gap-2 cursor-pointer text-black px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
          >
            {copiedDescription ? (
              <>
                <Check size={18} className="text-green-700" />
                All Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
              </>
            )}
          </div>
        )}
      </div>
      <div className='w-[97%] mx-auto h-[1px] bg-[#e9e8ea] mb-2' />

      {description?.length === 0 && !loading ? <div className="text-center py-8 text-gray-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <BarChart2 className="text-gray-600" size={24} />
        </div>
        <p className="text-gray-600 text-md font-semibold mt-2">Description will appear here when processing is complete</p>
      </div> : <div className="w-full">
        {loading ? <div className="flex flex-col items-center justify-center w-full p-8">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin my-3" />
          <div className="mt-2 text-blue-600 font-medium">Generating description...</div>
        </div> : <div className="max-h-64 w-full overflow-y-auto p-4 ">
          <div className="space-y-2 px-2">
            {description}
          </div>
        </div>}
      </div>}
    </div>
  )
}

export default Description