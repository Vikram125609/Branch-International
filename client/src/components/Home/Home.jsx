import React, { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate();
    const [chat, setChat] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [url, setUrl] = useState(window.location.href);
    const handleQuery = (e) => {
        setChat(e.target.value);
    };
    const sendQuery = () => {
        if (localStorage.getItem('role') === 'Client') {
            socket.emit('clientSendQuery', {
                _id: localStorage.getItem('_id'),
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
    const backToRoom = () => {
        navigate('/room');
    }
    useEffect(() => {
        socket.on('clientReceiveAnswer', (data) => {
            const { _id, name, role, chat } = data;
            setChatHistory((prevValue) => {
                return [...prevValue, { _id, name, role, chat }]
            });
            console.log('Event clientReceiveAnswer is active');
        });
        return () => {
            socket.removeListener('agentReceiveQuery');
            socket.removeListener('clientReceiveAnswer');
        }
    }, []);
    useEffect(() => {
        if (localStorage.getItem('name') === null) {
            navigate('/');
        }
        else {
            if (localStorage.getItem('role') === 'Client') {
                if (!socket.connected) {
                    socket.connect();
                }
            }
        }
        return () => {
            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);
            const data = {
                roomType: params.get('roomType')
            }
            socket.emit('agentLeaveRoom', data);
        }
    }, [navigate]);
    return (
        <div className="bg-slate-600 h-screen">
            <h1 style={{ lineHeight: '5vh' }} className="text-center text-white">{localStorage.getItem('role')}</h1>
            {
                localStorage.getItem('role') === 'Agent' ? (<button onClick={backToRoom} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Back
                </button>) : (<span></span>)
            }
            <div className="flex flex-col">
                <div style={{ height: '85vh', width: '100vw' }} className="">
                    {
                        chatHistory.map((message, id) => {
                            return (
                                <div key={id}>
                                    {
                                        localStorage.getItem('_id') === message._id ?
                                            (<div className="flex flex-row justify-end p-1">
                                                {
                                                    message?.priority === '0' ?
                                                        (
                                                            <p className="text-red-500">{message.chat}</p>
                                                        ) :
                                                        (
                                                            message?.priority === '1' ?
                                                                (
                                                                    <p className="text-yellow-500">{message.chat}</p>
                                                                ) :
                                                                (
                                                                    <p className="text-white">{message.chat}</p>
                                                                )
                                                        )
                                                }
                                                {
                                                    message?.role === 'Client' & localStorage.getItem('role') === 'Agent' ?
                                                        (
                                                            <button>Reply</button>
                                                        )
                                                        : (
                                                            <span></span>
                                                        )
                                                }
                                                {
                                                    message?.role === 'Client' & localStorage.getItem('role') === 'Agent' ?
                                                        (
                                                            <button>Pick</button>
                                                        )
                                                        : (
                                                            <span></span>
                                                        )
                                                }
                                            </div>
                                            ) : (
                                                <div className="flex flex-row justify-start p-1">
                                                    {
                                                        message?.priority === '0' ?
                                                            (
                                                                <p className="text-red-500">{message.chat}</p>
                                                            ) :
                                                            (
                                                                message?.priority === '1' ?
                                                                    (
                                                                        <p className="text-yellow-500">{message.chat}</p>
                                                                    ) :
                                                                    (
                                                                        <p className="text-white">{message.chat}</p>
                                                                    )
                                                            )
                                                    }
                                                    {
                                                        message?.role === 'Client' & localStorage.getItem('role') === 'Agent' ?
                                                            (
                                                                <button style={{ backgroundColor: 'rgba(46, 204, 113)' }} className="rounded-full text-white mx-1 px-1" >Reply</button>
                                                            )
                                                            : (
                                                                <span></span>
                                                            )
                                                    }
                                                    {
                                                        message?.role === 'Client' & localStorage.getItem('role') === 'Agent' ?
                                                            (
                                                                <button style={{ backgroundColor: 'rgba(46, 204, 113)' }} className="rounded-full text-white mx-1 px-1">Pick</button>
                                                            )
                                                            : (
                                                                <span></span>
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
                    <button onClick={sendQuery} style={{ height: '5vh', width: '100%', backgroundColor: 'rgba(46, 204, 113)' }} className="rounded-none text-white">Send</button>
                </div>
            </div>
        </div>
    );
};
export default Home;