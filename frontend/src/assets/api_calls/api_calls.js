import axios from 'axios'


async function login(data){
    const response=await axios.post('http://localhost:8080/api/v1/auth/login',data)
    return response
}

async function verify_otp(data){
    const response=await axios.post('http://localhost:8080/api/v1/auth/verify_otp',data)
    return response
}



const api_call_methods={
    login,
    verify_otp,
}

export default api_call_methods