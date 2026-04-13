import React, { useCallback, useEffect, useState } from 'react'
import ChatWindow from '../Components/ChatWindow';
import ChatFeedback from '../Components/ChatFeedback';


const Bot = () => {

  const [menuSelection, setMenuSelection] = useState('')

  const handleMenuSelection = useCallback((selection) => {
    setMenuSelection(selection);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("currentPage", "/vendoriq");
  }, []);

  return (
    <div className="flex flex-col h-screen ">
      <div className="flex flex-1 overflow-hidden  w-full flex-row-reverse ">
         <ChatWindow setMenuSelection={handleMenuSelection} />
        {/* {menuSelection === 'feedback' ? <ChatFeedback setMenuSelection={handleMenuSelection} /> : <ChatWindow setMenuSelection={handleMenuSelection} />} */}
      </div>
    </div>
  )
}

export default Bot