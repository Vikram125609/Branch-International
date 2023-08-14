import React, { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate();
    const [chat, setChat] = useState('');
    const handleQuery = (e) => {
        setChat(e.target.value);
    };
    const sendQuery = () => {
        if (localStorage.getItem('role') === 'Client') {   
            socket.emit('clientSendQuery', {
                _id: localStorage.getItem('_id'),
                name: localStorage.getItem('name'),
                query: chat
            })
        }
        else {
            socket.emit('agentAnswerQuery', {
                clientId: localStorage.getItem('clientId'),
                name: localStorage.getItem('name'),
                ans: chat
            })
        }
    };
    useEffect(() => {
        socket.on('agentReceiveQuery', (data) => {
            console.log(data);
            localStorage.setItem('clientId', data._id);
        });
        socket.on('clientReceiveAnswer', (data) => {
            console.log(data);
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
                <div style={{ height: '85vh', width: '100vw' }} className="">
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