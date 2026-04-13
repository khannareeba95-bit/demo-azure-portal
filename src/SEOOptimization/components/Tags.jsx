import { BarChart2, Loader2, Tag, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'

const Tags = ({ loading, oneWordTags = [], twoWordTags = [], threeWordTags = [] }) => {
  const [copiedTag, setCopiedTag] = useState(null)
  const [copiedAll, setCopiedAll] = useState({ one: false, two: false, three: false })
  const [timeoutId, setTimeoutId] = useState(null)
  const [timeoutIdAll, setTimeoutIdAll] = useState(null)

  const handleTagClick = async (tag) => {
    try {
      await navigator.clipboard.writeText(tag)
      setCopiedTag(tag)

      if (timeoutId) clearTimeout(timeoutId)

      const newTimeoutId = setTimeout(() => {
        setCopiedTag(null)
        setTimeoutId(null)
      }, 2000)

      setTimeoutId(newTimeoutId)
    } catch (err) {
      console.error('Failed to copy tag:', err)
    }
  }

  const handleCopyAllTaglines = async (type, tags) => {
    try {
      if (!tags?.length) return

      await navigator.clipboard.writeText(tags.join(', '))

      setCopiedAll((prev) => ({ one: false, two: false, three: false, [type]: true }))

      if (timeoutIdAll) clearTimeout(timeoutIdAll)

      const newTimeoutIdAll = setTimeout(() => {
        setCopiedAll({ one: false, two: false, three: false })
        setTimeoutIdAll(null)
      }, 2000)

      setTimeoutIdAll(newTimeoutIdAll)
    } catch (err) {
      console.error('Failed to copy all taglines:', err)
    }
  }

  const TagItem = ({ tag }) => (
    <div
      onClick={() => handleTagClick(tag)}
      className='bg-[#e9e8ea] hover:bg-[#d4d3d6] px-2 py-1 rounded-md text-[#1a3b8b] text-[12px] cursor-pointer transition-colors duration-200 flex items-center gap-1 select-none'
      title="Click to copy"
    >
      {tag}
      {copiedTag === tag && <Check size={12} className="text-green-600" />}
    </div>
  )

  const TagColumn = ({ title, tags, type }) => {
    const isCopiedAll = copiedAll[type]

    return (
      <div className="flex-1 bg-white rounded-lg overflow-auto max-h-[400px]" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div className="flex justify-between items-center mx-3">
          <h1 className='text-[18px] flex items-center gap-2 sticky top-0 py-4 bg-white text-[#1a3b8b] font-[600] pb-[15px] mb-[5px]'>
            <Tag className="text-gray-400" size={24} />
            {title}
          </h1>

          {tags?.length > 0 && !loading && (
            <div
              onClick={() => handleCopyAllTaglines(type, tags)}
              className="flex items-center gap-2 cursor-pointer text-black px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {isCopiedAll ? (
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

        {loading ? (
          <div className="flex flex-col items-center justify-center w-full p-8">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin my-3" />
            <div className="mt-2 text-blue-600 font-medium">Generating tags...</div>
          </div>
        ) : tags?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <BarChart2 className="text-gray-600" size={24} />
            </div>
            <p className="text-gray-600 text-md font-semibold mt-2">{title} will appear here when processing is complete</p>
          </div>
        ) : (
          <div className='flex flex-wrap gap-2 p-3 overflow-y-auto max-h-[200px] group'>
            {tags.map((tag, idx) => <TagItem key={idx} tag={tag} />)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      <TagColumn title="One Word Tags" tags={oneWordTags} type="one" />
      <TagColumn title="Two Words Tags" tags={twoWordTags} type="two" />
      <TagColumn title="Three Words Tags" tags={threeWordTags} type="three" />
    </div>
  )
}

export default Tags
