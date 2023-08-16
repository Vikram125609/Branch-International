import React, { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { replyToClient } from "../../Api";
const Home = () => {
    const navigate = useNavigate();
    const [chat, setChat] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [replyClientId, setReplyClientId] = useState('');
    const [messageId, setMessageId] = useState('');
    const [replyMessagePriority, setReplyMessagePriority] = useState('');
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
                clientId: replyClientId,
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
            const data = {
                ans: chat,
                messageId: messageId,
                replyMessagePriority: replyMessagePriority
            };
            replyToClient(data).then(() => {
                console.log('Successfully Updated');
            });
            setChat('');
        }
    };
    const pick = (messageId) => {
        const data = {
            messageId, agentId: localStorage.getItem('_id')
        }
        socket.emit('agentPickQuestion', data)
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
        });
        socket.on('agentPickedQuestion', (data) => {
            console.log(data);
        });
        return () => {
            socket.removeListener('clientReceiveAnswer');
            socket.removeListener('agentPickedQuestion');
        }
    }, []);
    useEffect(() => {
        socket.on('queryInMediumPriorityRoom', (data) => {
            const { _id, name, role, chat, priority, messageId } = data;
            setChatHistory((prevValue) => {
                return [...prevValue, { _id, name, role, chat, priority, messageId }];
            });
        });
        socket.on('queryInLowPriorityRoom', (data) => {
            const { _id, name, role, chat, priority, messageId } = data;
            setChatHistory((prevValue) => {
                return [...prevValue, { _id, name, role, chat, priority, messageId }];
            });
        });
        socket.on('queryInHighPriorityRoom', (data) => {
            const { _id, name, role, chat, priority, messageId } = data;
            setChatHistory((prevValue) => {
                return [...prevValue, { _id, name, role, chat, priority, messageId }];
            });
        });
        return () => {
            socket.removeListener('queryInMediumPriorityRoom');
            socket.removeListener('queryInLowPriorityRoom');
            socket.removeListener('queryInHighPriorityRoom');
        };
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
                <div style={{ height: `${localStorage.getItem('role') === 'Agent' ? '80vh' : '85vh'}`, width: '100vw' }} className="">
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
                                                            <button onClick={() => { setReplyClientId(message._id); setMessageId(message.messageId); setReplyMessagePriority(message.priority); }}>{replyClientId === message._id ? 'Active' : 'Reply'}</button>
                                                        )
                                                        : (
                                                            <span></span>
                                                        )
                                                }
                                                {
                                                    message?.role === 'Client' & localStorage.getItem('role') === 'Agent' ?
                                                        (
                                                            <button onClick={() => pick(message.messageId)}>Pick</button>
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
                                                                <button onClick={() => { setReplyClientId(message._id); setMessageId(message.messageId); setReplyMessagePriority(message.priority); }} style={{ backgroundColor: 'rgba(46, 204, 113)' }} className="rounded-full text-white mx-1 px-1" >{replyClientId === message._id ? 'Active' : 'Reply'}</button>
                                                            )
                                                            : (
                                                                <span></span>
                                                            )
                                                    }
                                                    {
                                                        message?.role === 'Client' & localStorage.getItem('role') === 'Agent' ?
                                                            (
                                                                <button onClick={() => pick(message.messageId)} style={{ backgroundColor: 'rgba(46, 204, 113)' }} className="rounded-full text-white mx-1 px-1">Pick</button>
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