import axios from 'axios'


async function login(data){
    const response=await axios.post('http://localhost:8080/api/v1/auth/login',data)
    return response
}

async function verify_otp(data){
    const response=await axios.post('http://localhost:8080/api/v1/auth/verify_otp',data)
    return response
}

async function reset_password(data,user_id){
    const response=await axios.post('http://localhost:8080/api/v1/profile/reset_password',
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': user_id
            },

        }
    )
    return responseS
}


const api_call_methods={
    login,
    verify_otp,
    reset_password
}

export default api_call_methods