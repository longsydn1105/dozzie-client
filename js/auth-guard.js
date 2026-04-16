// js/auth-guard.js
(function () {
    const token = localStorage.getItem('token');

    // 1. Không có vé (token) -> Mời ra chuồng gà (Về Login)
    if (!token) {
        window.location.replace('/login.html');
        return;
    }

    try {
        // Bóc tách payload của JWT để soi thông tin
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const currentTime = Math.floor(Date.now() / 1000); // Đổi ra giây cho khớp với chuẩn JWT

        // 2. Vé hết hạn -> Xóa sạch dấu vết về Login
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
            console.warn(
                'Phiên đăng nhập đã hết hạn. Đang đưa về trang Login...',
            );
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('/login.html');
            return;
        }
    } catch (error) {
        // 3. Khách hàng táy máy "độ" lại token trên LocalStorage -> Báo lỗi, đá về Login
        console.error('Token bị lỗi hoặc không hợp lệ:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login.html');
    }
})();
