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
    return response.data
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


async function delete_user(userIdToBeDeleted,user_id){
    const response=await axios.delete(`http://localhost:8080/api/v1/admin/delete_user/${userIdToBeDeleted}`,
        { 
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }

        }
    )
    console.log(response)
}

async function get_users(user_id){
    const response=await axios.get('http://localhost:8080/api/v1/admin/users',
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }

        }
    )
    console.log(response.data)
    return response
}



async function upload(data,user_id) {
    const response=await axios.post('http://localhost:8080/api/v1/files/upload',data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    console.log(response)
}
async function map_files(data,user_id) {
    const response=await axios.post('http://localhost:8080/api/v1/files/mapper',data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    console.log(response)
    return response

}
async function submit_files(data,user_id) {
    const response=await axios.post('http://localhost:8080/api/v1/files/submit',data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    console.log(response)
    return response

}


async function get_response(user_id,filing_id) {
    const response=await axios.get(`http://localhost:8080/api/v1/edit/response/${filing_id}`,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    console.log(response)
    return response

}


async function get_xml_data(user_id,filing_id) {
    const id=45
    const response=await axios.get(`http://localhost:8080/api/v1/edit/approved/${filing_id}`,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    console.log(response)
    return response

}


async function accept_data(user_id,data,fund_id,filing_id) {
    const response=await axios.put(`http://localhost:8080/api/v1/submissions/${filing_id}/${fund_id}`,data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    console.log(response)
    return response
}



const api_call_methods={
    login,
    verify_otp,
    resend_otp,
    logout,
    reset_password,
    filings_list,
    create_user,
    delete_user,
    get_users,
    upload,
    map_files,
    submit_files,
    get_response,
    get_xml_data,
    accept_data

}

export default api_call_methods