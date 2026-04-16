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
            // Bước 1: Cứ gặp 401/403 là dọn dẹp bộ nhớ cho sạch sẽ đã
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Bước 2: Cài chốt chặn "chống tự reload"
            if (!window.location.pathname.includes('/login.html')) {
                alert(
                    error.response.data.message ||
                        'Phiên đăng nhập không hợp lệ hoặc tài khoản bị khóa!',
                );
                window.location.href = '/login.html';
            }
        }

        // Bước 3: Bắt buộc phải ném cái lỗi này đi tiếp để đoạn catch(error) bên form login còn hứng được
        return Promise.reject(error);
    },
);

export default axiosClient;
