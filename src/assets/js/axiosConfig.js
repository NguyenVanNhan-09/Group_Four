const API_URL = 'http://localhost:8017/'

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
})

// Bộ đánh chặn (interceptors)
apiClient.interceptors.request.use(
   function (config) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
         config.headers["Authorization"] = `Bearer ${accessToken}`
      }
      return config;
   },
   function (error) {
      return Promise.reject(error)
   }
)

export default apiClient
