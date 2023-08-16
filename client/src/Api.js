import axios from 'axios'
export const registerUser = (data) => axios.post('http://localhost:8080/register', data);
export const totalPendingQuery = () => axios.get('http://localhost:8080/totalPendingQuery');
export const replyToClient = (data) => axios.post('http://localhost:8080/replyToClient',data);