import { BarChart2, Loader2, Proportions, Tags, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'

const Tagline = ({ loading, tagLines }) => {
  const [copiedTagline, setCopiedTagline] = useState(null)
  const [timeoutId, setTimeoutId] = useState(null)
  const [copiedAllTaglines, setCopiedAllTaglines] = useState(false)

  const handleTaglineClick = async (tagline) => {
    try {
      await navigator.clipboard.writeText(tagline)
      setCopiedTagline(tagline)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      const newTimeoutId = setTimeout(() => {
        setCopiedTagline(null)
        setTimeoutId(null)
      }, 2000)

      setTimeoutId(newTimeoutId)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleCopyAllTaglines = async () => {
    try {
      const formattedTaglines = tagLines.join(', ')
      await navigator.clipboard.writeText(formattedTaglines)
      setCopiedAllTaglines(true)

      setTimeout(() => {
        setCopiedAllTaglines(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy all taglines: ', err)
    }
  }

  const TaglineItem = ({ tagline }) => {
    const isCopied = copiedTagline === tagline

    return (
      <div
        onClick={() => handleTaglineClick(tagline)}
        className='bg-[#e9e8ea] hover:bg-[#d4d3d6] px-2 py-1 rounded-md text-[#1a3b8b] text-[12px] cursor-pointer transition-colors duration-200 flex items-center gap-1 select-none'
        title="Click to copy"
      >
        {tagline}
        {isCopied && (
          <Check size={12} className="text-green-600" />
        )}
      </div>
    )
  }

  const hasTaglines = tagLines?.length > 0 && !loading

  return (
    <div className="bg-white rounded-lg shadow-sm border my-4">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h1 className='text-[18px] flex items-center gap-2 text-[#1a3b8b] font-[600]'>
            <Tags className="text-gray-600" size={24} />
            Taglines
          </h1>
          {hasTaglines && (
            <div
              onClick={handleCopyAllTaglines}
              className="flex items-center gap-2 cursor-pointer text-black px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {copiedAllTaglines ? (
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
      </div>
      <div className='w-[97%] mx-auto h-[1px] bg-[#e9e8ea] mb-2' />
      <div className="w-full">
        {tagLines?.length === 0 && !loading ? <div className="text-center py-8 text-gray-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <BarChart2 className="text-gray-600" size={24} />
          </div>
          <p className="text-gray-600 text-md font-semibold mt-2">Taglines will appear here when processing is complete</p>
        </div> : loading ? <div className="flex flex-col items-center justify-center w-full p-8">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin my-3" />
          <div className="mt-2 text-blue-600 font-medium">Generating taglines...</div>
        </div> : <div className='flex flex-wrap gap-2 p-3 overflow-y-auto max-h-[300px] group'>
          {
            tagLines?.map((tagline, index) => <TaglineItem key={index} tagline={tagline} />)
          }
        </div>}
      </div>
    </div>
  )
}

export default Tagline