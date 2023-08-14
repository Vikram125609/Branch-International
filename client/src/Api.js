import axios from 'axios'
export const registerUser = (data) => axios.post('http://localhost:8080/register', data);