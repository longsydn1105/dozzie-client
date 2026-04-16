// js/admin-auth-guard.js
(function () {
    const token = localStorage.getItem('token');

    // 1. Không có token -> Cút về Login
    if (!token) {
        window.location.replace('/login.html');
        return;
    }

    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const currentTime = Math.floor(Date.now() / 1000);

        // 2. Token hết hạn -> xoá token + user info -> login
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('/login.html');
            return;
        }

        // 3. Có token nhưng role là 'user' -> Đá về trang chủ khách hàng
        if (decodedPayload.role !== 'admin') {
            window.location.replace('/index.html');
            return;
        }

        // Vượt qua 3 ải -> Cho phép ở lại trang Admin làm việc!
    } catch (error) {
        // Token bị chế cháo bậy bạ -> Đá về Login
        localStorage.removeItem('token');
        window.location.replace('/login.html');
    }
})();
