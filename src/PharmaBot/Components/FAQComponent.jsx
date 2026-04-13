import { useEffect, useState } from 'react'
import LoaderComponent from './LoaderComponent';

const FAQComponent = ({ inputRef, setFAQToggle, setQuery }) => {

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                let response = await fetch("https://5gp21pm1sa.execute-api.ap-south-1.amazonaws.com/demo/FAQ",{
                    method:"POST"
                });
                let data = await response.json();
                let resp = JSON.parse(data.body);
                console.log('questionsResponse', resp);
                setQuestions([...resp?.map(quest => {
                    return {
                        question: quest['Query'],
                        answer: JSON.stringify(quest['Response'])
                    };
                })]);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <>
            <div onClick={() => setFAQToggle(false)} className='fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[990] ' />
            <div className='top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] fixed bg-white rounded-lg shadow-xl p-6 z-[991] w-full max-w-xl mx-auto'>
                <h1 className='text-2xl font-semibold mb-4 text-gray-800 border-b pb-2'>Frequently Asked Queries</h1>

                {
                    loading && <div className="flex flex-col items-center gap-2">
                        <div className=" text-gray-800 ">
                            <div className="flex space-x-2 items-center">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                        <div className="text-gray-700 mt-4">Loading FAQs...</div>
                    </div>
                }

                {!loading && questions?.length > 0 && <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
                    {questions?.map((question, index) => (
                        <div onClick={() => { setQuery(question?.question); setFAQToggle(false); inputRef.current.focus() }} key={index} className="flex items-start cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors">
                            <div className="flex-shrink-0 bg-blue-100 text-blue-600 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3">
                                {index + 1}
                            </div>
                            <div className="text-gray-700">{question?.question}</div>
                        </div>
                    ))}
                </div>}
            </div>
        </>
    )
}

export default FAQComponent