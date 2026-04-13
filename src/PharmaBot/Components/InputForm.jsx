import React, { useContext, useEffect, useRef, useState } from 'react'
import { ChevronUp, ListFilter, Paperclip, SendHorizonal } from 'lucide-react'
import { handleQueryMessage } from '../helpers';
import FileUpload from './FileUpload';
import UserContext from '../../Context/UserContext';
import { v4 as uuidv4 } from 'uuid'


const InputForm = ({ inputRef, messages, setMessages, loading, setLoading, query, setQuery }) => {

    const inputFormRef = useRef();
    const selectQueyRef = useRef();
    const inputFocusRef = useRef();
    const { userDetails, userState } = useContext(UserContext);


    const [queryOptions, setQueryOptions] = useState(['Product', 'Vendor', 'Material', 'All'])
    const [queryOption, setQueryOption] = useState('All');
    const [queryToggle, setQueryToggle] = useState(false);

    // const [query, setQuery] = useState("");

    const [fileUploadToggle, setFileUploadToggle] = useState(false)

    useEffect(() => {
        inputFormRef.current.scrollIntoView({
            behaviour: "smooth",
            block: "nearest"
        })
        inputRef.current.focus();
    }, [])

    useEffect(() => {
        function clickedOutside(event) {
            if (selectQueyRef.current && !selectQueyRef.current.contains(event.target))
                setQueryToggle(false);
        }
        window.addEventListener('mousedown', clickedOutside)

        return () => window.removeEventListener('mousedown', clickedOutside)
    }, [])

    async function handleSendMessage(e) {
        e.preventDefault();
        // if (loading) {
        //     return;
        // }

        let queryBody = {
            refrenceUuid: (uuidv4() + uuidv4()).replaceAll('-', ''),
            text: query,
            sender: "user",
            type: "text",
            RDS: queryOption?.toLowerCase(),
            loggedInUser: userDetails?.username,
            // loggedInUser: "rishav@02",
            // sessionId: "2972304b-9394-4f0d-9033-70f29c9f88c8",
            timeStamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        let userInputBody = {
            id: messages?.length + 1,
            text: queryBody?.text,
            sender: queryBody?.sender,
            type: queryBody?.type,
            timestamp: queryBody?.timeStamp,
        }
        setMessages(prev => [...prev, userInputBody]);
        setQuery("");
        setLoading(true);
        try {
            let result = await handleQueryMessage(queryBody, messages, setMessages);
            const { response, query } = result;

            setMessages(prev => [...prev, {
                id: messages?.length + 1,
                text: response,
                sender: 'bot',
                type: Array.isArray(response) ? 'table' : 'text',
                query: query ? query : "No Query Available",
                timestamp: new Date().toISOString(),
                refrenceUuid: queryBody?.refrenceUuid
            }])
            setLoading(false);

        } catch (error) {
            setLoading(false);
            setQuery("");
            console.error('InputForm error:', error);
        }
    }

    return (
        <form ref={inputFormRef} onSubmit={handleSendMessage} className="w-full p-2  border-t border-gray-400">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1 items-end border-2 bg-white  rounded-xl px-4 py-1 w-full mx-auto shadow-sm hover:shadow-md transition-shadow">
                <input
                    ref={inputRef}
                    style={{
                        border: 'none',
                        width: '100%',
                        outline: 'none !important'
                    }}
                    type="text"
                    placeholder="Type your message..."
                    className="text-base w-full bg-white outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                // value={query}
                // onChange={(e) => dispatch({ type: ACTIONS.CHANGE_QUERY, payload: e.target.value })}
                />

                <div className="flex items-center space-x-3 text-gray-500">
                    {fileUploadToggle && <FileUpload setFileUploadToggle={setFileUploadToggle} />}
                    <button onClick={() => setFileUploadToggle(!fileUploadToggle)} type="button" className="hover:text-gray-700 transition-colors">
                        <Paperclip className="text-lg" />
                    </button>

                    <div className="h-5 border-l border-gray-300"></div>

                    <button ref={selectQueyRef} type="button" className="hover:text-gray-700 relative transition-colors">
                        {queryToggle && <div className=" absolute bottom-[40px] left-[50%] translate-x-[-50%] bg-white w-[160px] p-2 gap-1 rounded-md z-50 shadow-lg flex flex-col justify-center">
                            {
                                queryOptions?.map(queryByOption => <div onClick={() => {
                                    setQueryOption(queryByOption);
                                    setQueryToggle(false);
                                }} className='hover:bg-[#1e3b8a] hover:text-white  rounded-md p-2'>{queryByOption}</div>)
                            }
                        </div>}
                        <div onClick={() => setQueryToggle(true)} className="flex border-b-2 border-gray-300 items-end">
                            <div className=" w-[4rem] text-md  font-normal text-left">{queryOption}</div>
                            <ChevronUp className={`${queryToggle ? 'rotate-180' : 'rotate-0'} transition-all ease-in-out 0.3s`} size={20} />
                        </div>
                    </button>

                    <div className="h-5 border-l border-gray-300" />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`text-blue-500 hover:text-blue-600 transition-colors ${false ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <SendHorizonal className="text-lg" />
                    </button>
                </div>
            </div>
        </form>
    )
}

export default InputForm