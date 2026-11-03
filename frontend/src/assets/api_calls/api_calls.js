import api from '@/axios'
//-----------AUTH ENDPOINT CALLS-----------------//
async function login(data){
    const response=await api.post('/api/v1/auth/login',data, { skipErrorToast: true })
    console.log(data)
    return response
}

async function verify_otp(data){
    const response=await api.post('/api/v1/auth/verify_otp',data,
        {
            withCredentials:true,
            skipErrorToast: true,
        }
    )
    return response
}
async function refresh_token(user_id){
    const data={
        'user_id':user_id
    }
    const response=await api.post('/api/v1/auth/access_token',data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            },
            skipErrorToast: true,
        }
    )
    return response
}

async function resend_otp(data){
    const response=await api.post('/api/v1/auth/resend_otp',data, { skipErrorToast: true })
    return response
}

async function logout(data){
    const response=await api.post('/api/v1/auth/logout',data)
    return response
}

//-----------PROFILE ENDPOINT CALLS-----------------//

async function reset_password(data,user_id){
    const response=await api.post('/api/v1/profile/reset_password',
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


async function filings_list(user_id,clientCode){
    const response=await api.get('/api/v1/filings_list',
        { params: {
                user_id:user_id,
                clientCode:clientCode
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
    const response=await api.post('/api/v1/admin/create_user',data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }

        }
    )
    console.log(response)
}

async function edit_user(data,user_id){
    const response=await api.post('/api/v1/admin/edit_user',data,
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
    const response=await api.delete(`/api/v1/admin/delete_user/${userIdToBeDeleted}`,
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
    const response=await api.get('/api/v1/admin/users',
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
    const response=await api.post('/api/v1/files/upload',data,
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
    const response=await api.post('/api/v1/files/mapper',data,
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
    const response=await api.post('/api/v1/files/submit',data,
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
async function discard_filing(data,user_id){
    const response=await api.post('/api/v1/files/cancel',data,
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


async function get_response(user_id, filing_id, version = null) {
    const params = {}
    if (version) params.version = version
    const response=await api.get(`/api/v1/edit/response/${filing_id}`,
        {
            params,
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    console.log(response)
    return response

}
async function get_computations(user_id,filing_id) {
    const response=await api.get(`/api/v1/edit/computation_logs/${filing_id}`,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    console.log("compuations",response)
    return response

}


async function get_xml_data(user_id,filing_id) {
    
    const response=await api.get(`/api/v1/edit/approved/${filing_id}`,
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

async function update_status(user_id,filing_id,status) {
    const current_time = new Date();
    console.log(status)
    const data={
        "Timestamp":current_time.toISOString(),
        "FilingStatus":status,
    }
    const response=await api.post(`/api/v1/edit/update_status/${filing_id}`,data,
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
    const response=await api.put(`/api/v1/submissions/${filing_id}/${fund_id}`,data,
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


async function revert_data(user_id,data,fund_id,filing_id) {
    const response=await api.put(`/api/v1/submissions/revert/${filing_id}/${fund_id}`,data,
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
async function download_input(user_id,filing_name) {
    const response=await api.get('/api/v1/files/download_input_files',
        {
                params: { filing_name },
                responseType: "blob",    
                withCredentials: true,
                headers: {
                    'X-User-ID': user_id
                }
            }
    )
    return response
}

async function verify_user(user_id){
    const response=await api.get('/api/v1/verify_user',
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            },
            skipErrorToast: true,
        }
    )
    console.log(response)
}

//"/history"

async function get_history(user_id,data, options = {}){
    const response=await api.get(`/api/v1/submissions/history`, 
        {   params: {
                filingid: data.filingId,
                fundSeriesid: data.fundId,
                fieldNo: data.fieldNo
            },
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            },
            // Prefetch can fire many requests; skip by default, toast on explicit user open
            skipErrorToast: options.skipErrorToast !== false,
        }
    )
    return response
}

async function get_mapped_files(user_id, filing_name, version = null) {
    const data = {
        filing_name: filing_name,
        filing: false,
    }
    if (version) data.version = Number(version)

    const response=await api.post('/api/v1/files/mapper',data,
        {
            withCredentials: true ,
            headers:{
                'X-User-ID': user_id
            }
        }
    )
    return response
}

async function get_related_filings(user_id, filing_id) {
    const response = await api.get(`/api/v1/filings/${filing_id}/related`,
        {
            withCredentials: true,
            headers: {
                'X-User-ID': user_id
            }
        }
    )
    return response
}

async function get_filing_versions(user_id, filing_id) {
    const response = await api.get(`/api/v1/filings/${filing_id}/versions`,
        {
            withCredentials: true,
            headers: {
                'X-User-ID': user_id
            }
        }
    )
    return response
}

async function get_reviews(user_id, filing_id, fund_id) {
    const response = await api.get(`/api/v1/submissions/${filing_id}/reviews`,
        {
            params: { fundSeriesid: fund_id },
            withCredentials: true,
            headers: {
                'X-User-ID': user_id
            }
        }
    )
    return response
}

async function accept_review(user_id, filing_id, fund_id, field_no) {
    const response = await api.post(`/api/v1/submissions/${filing_id}/reviews`,
        { fund_id, field_no },
        {
            withCredentials: true,
            headers: {
                'X-User-ID': user_id
            }
        }
    )
    return response
}

async function undo_review(user_id, filing_id, fund_id, field_no) {
    const response = await api.delete(`/api/v1/submissions/${filing_id}/reviews`,
        {
            data: { fund_id, field_no },
            withCredentials: true,
            headers: {
                'X-User-ID': user_id
            }
        }
    )
    return response
}

async function latest_changes(user_id, filing_id) {
    const data = {
        filing_id
    }

    const response = await api.post('/api/v1/submissions/latest_changes', data,
        {
            withCredentials: true,
            headers: {
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
    logout,
    reset_password,
    filings_list,
    create_user,
    delete_user,
    refresh_token,
    get_users,
    upload,
    map_files,
    submit_files,
    discard_filing,
    get_response,
    get_xml_data,
    accept_data,
    revert_data,
    update_status,
    download_input,
    verify_user,
    get_computations,
    get_history,
    get_mapped_files,
    get_related_filings,
    get_filing_versions,
    edit_user,
    latest_changes,
    get_reviews,
    accept_review,
    undo_review

}

export default api_call_methods