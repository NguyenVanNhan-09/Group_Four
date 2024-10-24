const API_URL = 'https://39cd-14-224-128-247.ngrok-free.app/'

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Bộ đánh chặn (interceptors)
apiClient.interceptors.request.use(
    function (config) {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return config
    },
    function (error) {
        return Promise.reject(error);
    }
)
export default apiClient