import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Tự động đính kèm Token cho mọi Request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
        ) {
            alert(
                error.response.data.message || 'Phiên đăng nhập không hợp lệ!',
            );

            localStorage.removeItem('token');

            window.location.href = '/login.html';
        }
        return Promise.reject(error);
    },
);

export default axiosClient;
