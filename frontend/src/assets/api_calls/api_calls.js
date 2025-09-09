import axios from 'axios'


async function login(data){
    const response=await axios.post('http://localhost:8080/api/v1/auth/login',data)
    console.log(data)
    return response
}

async function verify_otp(data){
    const response=await axios.post('http://localhost:8080/api/v1/auth/verify_otp',data,
        {
            withCredentials:true
        }
    )
    return response
}

async function resend_otp(data){
    const response=await axios.post('http://localhost:8080/api/v1/auth/resend_otp',data,
        
    )
    return response
}
async function reset_password(data,user_id){
    const response=await axios.post('http://localhost:8080/api/v1/profile/reset_password',
        data,
        { 
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }

        }
    )
    return response
}


const api_call_methods={
    login,
    verify_otp,
    resend_otp,
    reset_password
}

export default api_call_methods