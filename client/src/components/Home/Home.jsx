import React, { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate();
    const [chat, setChat] = useState('');
    const [priority, setPriority] = useState('2');
    const [chatHistory, setChatHistory] = useState([]);
    const handleQuery = (e) => {
        setChat(e.target.value);
    };
    const sendQuery = () => {
        if (localStorage.getItem('role') === 'Client') {
            socket.emit('clientSendQuery', {
                _id: localStorage.getItem('_id'),
                name: localStorage.getItem('name'),
                role: localStorage.getItem('role'),
                priority: priority,
                chat: chat
            })
            setChatHistory((prevValue) => {
                return [...prevValue, {
                    _id: localStorage.getItem('_id'),
                    name: localStorage.getItem('name'),
                    role: localStorage.getItem('role'),
                    priority: priority,
                    chat: chat
                }]
            });
            setChat('');
        }
        else {
            socket.emit('agentAnswerQuery', {
                clientId: localStorage.getItem('clientId'),
                name: localStorage.getItem('name'),
                role: localStorage.getItem('role'),
                chat: chat
            })
            setChatHistory((prevValue) => {
                return [...prevValue, {
                    _id: localStorage.getItem('_id'),
                    name: localStorage.getItem('name'),
                    role: localStorage.getItem('role'),
                    chat: chat
                }]
            });
            setChat('');
        }
    };
    useEffect(() => {
        socket.on('agentReceiveQuery', (data) => {
            const { _id, name, role, chat } = data;
            localStorage.setItem('clientId', data._id);
            setChatHistory((prevValue) => {
                return [...prevValue, { _id, name, role, chat, priority }]
            });
        });
        socket.on('clientReceiveAnswer', (data) => {
            const { _id, name, role, chat } = data;
            setChatHistory((prevValue) => {
                return [...prevValue, { _id, name, role, chat }]
            });
        });
    }, []);
    useEffect(() => {
        if (localStorage.getItem('name') === null) {
            navigate('/');
        }
        else {
            socket.connect();
        }
    }, [navigate]);
    return (
        <div className="bg-slate-600 h-screen">
            <h1 style={{ lineHeight: '5vh' }} className="text-center text-white">{localStorage.getItem('role')}</h1>
            <div className="flex flex-col">
                <div style={{ height: `${localStorage.getItem('role') === 'Client' ? '80vh' : '85vh' }`, width: '100vw' }} className="">
                    {
                        chatHistory.map((message, id) => {
                            return (
                                <div key={id}>
                                    {
                                        localStorage.getItem('_id') === message._id ?
                                            (<div className="flex flex-row justify-end p-1">
                                                {
                                                    message?.priority === '2' ?
                                                        (
                                                            <p className="text-red-900">{message.chat}</p>
                                                        ) :
                                                        (
                                                            message?.priority === '1' ?
                                                                (
                                                                    <p className="text-yellow-900">{message.chat}</p>
                                                                ) :
                                                                (
                                                                    <p className="text-white">{message.chat}</p>
                                                                )
                                                        )
                                                }
                                            </div>
                                            ) : (
                                                <div className="flex flex-row justify-start p-1">
                                                    {
                                                        message?.priority === '2' ?
                                                            (
                                                                <p className="text-red-900">{message.chat}</p>
                                                            ) :
                                                            (
                                                                message?.priority === '1' ?
                                                                    (
                                                                        <p className="text-yellow-900">{message.chat}</p>
                                                                    ) :
                                                                    (
                                                                        <p className="text-white">{message.chat}</p>
                                                                    )
                                                            )
                                                    }
                                                </div>
                                            )
                                    }
                                </div>
                            );
                        })
                    }
                </div>
                <div>
                    <input onChange={handleQuery} style={{ height: '5vh', width: '100%' }} value={chat} className="p-2 rounded" type="text" name="name" id="" placeholder="Type your query" />
                    {
                        localStorage.getItem('role') === 'Client' ?
                            (<select onChange={(e) => { setPriority(e.target.value); }} style={{ height: '5vh', width: '100%' }} defaultValue={'2'} id="countries" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option value="2">Choose your Priority</option>
                                <option value="0">Priority 0</option>
                                <option value="1">Priority 1</option>
                                <option value="2">Priority 2</option>
                            </select>) : (<span></span>)
                    }
                    <button onClick={sendQuery} style={{ height: '5vh', width: '100%', backgroundColor: 'rgba(46, 204, 113)' }} className="rounded-none text-white">Send</button>
                </div>
            </div>
        </div>
    );
};
export default Home;