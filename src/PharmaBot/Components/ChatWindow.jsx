import React, { memo, useRef, useState } from 'react'
import Navbar from './Navbar'
import Messages from './Messages'
import InputForm from './InputForm'

const ChatWindow = memo(({ setMenuSelection }) => {

    const [messages, setMessages] = useState([
        // {
        //     sender: 'user',
        //     text: 'Hello, how are you ajnsi? ',
        //     type: 'text'
        // },
        // {
        //     sender: 'bot',
        //     text: 'I am fine, thank you. How can I help you? I am fine, thank you. How can I help you? I am fine, thank you. How can I help you? I am fine, thank you. How can I help you?',
        //     type: 'text'
        // },
        // {
        //     sender: 'user',
        //     text: 'I am looking for a product.',
        //     type: 'text'
        // },
        // {
        //     sender: 'bot',
        //     text: [{
        //         "userId": 1,
        //         "id": 1,
        //         "title": "delectus aut autem",
        //         "completed": false,
        //     },
        //     {
        //         "userId": 1,
        //         "id": 2,
        //         "title": "quis ut nam facilis et officia qui",
        //         "completed": false
        //     },
        //     {
        //         "userId": 1,
        //         "id": 3,
        //         "title": "fugiat veniam minus",
        //         "completed": false
        //     },
        //     {
        //         "userId": 1,
        //         "id": 4,
        //         "title": "et porro tempora",
        //         "completed": true
        //     },
        //     {
        //         "userId": 1,
        //         "id": 5,
        //         "title": "laboriosam mollitia et enim quasi adipisci quia provident illum",
        //         "completed": false
        //     },
        //     {
        //         "userId": 1,
        //         "id": 6,
        //         "title": "qui ullam ratione quibusdam voluptatem quia omnis",
        //         "completed": false
        //     },
        //     {
        //         "userId": 1,
        //         "id": 7,
        //         "title": "illo expedita consequatur quia in",
        //         "completed": false
        //     },
        //     {
        //         "userId": 1,
        //         "id": 8,
        //         "title": "quo adipisci enim quam ut ab",
        //         "completed": true
        //     },
        //     {
        //         "userId": 1,
        //         "id": 9,
        //         "title": "molestiae perspiciatis ipsa",
        //         "completed": false
        //     },
        //     {
        //         "userId": 1,
        //         "id": 10,
        //         "title": "illo est ratione doloremque quia maiores aut",
        //         "completed": true
        //     },
        //     {
        //         "userId": 1,
        //         "id": 11,
        //         "title": "vero rerum temporibus dolor",
        //         "completed": true
        //     },
        //     {
        //         "userId": 1,
        //         "id": 12,
        //         "title": "ipsa repellendus fugit nisi",
        //         "completed": true
        //     },
        //     {
        //         "userId": 1,
        //         "id": 13,
        //         "title": "et doloremque nulla",
        //         "completed": false
        //     },
        //     {
        //         "userId": 1,
        //         "id": 14,
        //         "title": "repellendus sunt dolores architecto voluptatum",
        //         "completed": true,
        //     }],
        //     type: 'table'
        // }
    ]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef();
    
    return (
        <div className={`
        flex flex-col h-full w-full
      `}>
            <Navbar inputRef={inputRef} setMenuSelection={setMenuSelection} setQuery={setQuery} />
            <div className=" flex flex-col h-full overflow-hidden">
                <Messages messages={messages} setMessages={setMessages} loading={loading} />
                <InputForm inputRef={inputRef} messages={messages} setMessages={setMessages} loading={loading} setLoading={setLoading} query={query} setQuery={setQuery} />
            </div>
        </div>
    )
})

export default ChatWindow