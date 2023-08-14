import React, { useEffect } from "react";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate();
    useEffect(() => {
        if (localStorage.getItem('name') === null) {
            navigate('/');
        }
        else {
            socket.connect();
        }
    }, [navigate]);
    return (
        <React.Fragment>
            <h1>This is Home</h1>
        </React.Fragment>
    );
};
export default Home;