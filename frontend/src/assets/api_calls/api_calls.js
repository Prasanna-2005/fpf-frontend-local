import axios from 'axios'

//-----------AUTH ENDPOINT CALLS-----------------//
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
    const response=await axios.post('http://localhost:8080/api/v1/auth/resend_otp',data)
    return response
}

async function logout(data){
    const response=await axios.post('http://localhost:8080/api/v1/auth/logout',data)
    return response
}

//-----------PROFILE ENDPOINT CALLS-----------------//

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
//----------- ENDPOINT CALLS-----------------//


async function filings_list(user_id){
    const response=await axios.get('http://localhost:8080/api/v1/filings_list',
        { params: {
                user_id:user_id
            },
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }

        }
    )
    console.log(response)
}


//-----------ADMIN ENDPOINT CALLS-----------------//

async function create_user(data,user_id){
    const response=await axios.post('http://localhost:8080/api/v1/admin/create_user',data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }

        }
    )
    console.log(response)
}


async function delete_user(data,user_id){
    const response=await axios.post('http://localhost:8080/api/v1/admin/create_user',data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }

        }
    )
    console.log(response)
}





const api_call_methods={
    login,
    verify_otp,
    resend_otp,
    logout,
    reset_password,
    filings_list,
    create_user,
    delete_user

}

export default api_call_methods