// client/js/auth.js

import { default as authApi } from '../src/api/authApi';

(function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Nếu đã có token (đã đăng nhập)
    if (token && user) {
        if (user.role === 'admin') {
            window.location.href = '/admin/dashboard.html';
        } else {
            window.location.href = '/index.html';
        }
    }
})();

// --- 1. HIỆU ỨNG KHI VÀO TRANG (FADE IN) ---
window.addEventListener('pageshow', (event) => {
    document.body.classList.add('loaded');
});

// --- 2. CÁC HÀM CHUYỂN ĐỔI GIAO DIỆN (UI) ---
function switchToRegister() {
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    if (loginView && registerView) {
        loginView.classList.add('hidden-form');
        setTimeout(() => {
            registerView.classList.remove('hidden-form');
        }, 50);
    }
}

function switchToLogin() {
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    if (loginView && registerView) {
        registerView.classList.add('hidden-form');
        setTimeout(() => {
            loginView.classList.remove('hidden-form');
        }, 50);
    }
}

// --- HÀM XỬ LÝ ĐĂNG KÝ (FIX LỖI HIỂN THỊ) ---
async function handleRegister(event) {
    event.preventDefault();

    // 1. Lấy dữ liệu (Sửa name thành fullName cho khớp Schema)
    const fullName = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorDisplay = document.getElementById('reg-error-message');

    // Reset UI lỗi
    if (errorDisplay) {
        errorDisplay.textContent = '';
        errorDisplay.classList.remove('animate-pulse');
    }

    // Validation nhẹ phía Client
    if (password.length < 6) {
        const msg = 'Mật khẩu yếu quá (tối thiểu 6 ký tự)!';
        if (errorDisplay) errorDisplay.textContent = msg;
        else alert(msg);
        return;
    }

    try {
        // 2. Gọi API (Axios sẽ tự lo JSON.stringify và Header)
        // Nếu lỗi (4xx, 5xx), nó nhảy xuống block catch ngay lập tức
        const response = await authApi.register({ fullName, email, password });

        // 3. XỬ LÝ THÀNH CÔNG (Chỉ chạy đến đây nếu status là 2xx)
        console.log('Đăng ký ngon lành!', response.data);

        alert('Đăng ký thành công! Mời bạn đăng nhập.');

        // Chuyển tab sang Login
        if (typeof switchToLogin === 'function') {
            switchToLogin();
            // Đổ sẵn email vừa đăng ký vào ô login cho tiện
            const loginEmail = document.getElementById('login-email');
            if (loginEmail) {
                loginEmail.value = email;
                document.getElementById('login-password')?.focus();
            }
        }
    } catch (error) {
        // 4. XỬ LÝ LỖI (Tất cả lỗi 400, 409, 500... bơi hết vào đây)
        console.error('Lỗi đăng ký:', err);

        // Lấy message lỗi từ Server trả về (ví dụ: "Email đã tồn tại")
        const serverMsg = error.response?.data?.message || 'Lỗi kết nối!';
        if (errorDisplay) {
            errorDisplay.textContent = serverMsg;
            errorDisplay.style.color = 'red';
        } else {
            alert(serverMsg);
        }
    }
}

// --- 4. HÀM XỬ LÝ ĐĂNG NHẬP ---
async function handleLogin(event) {
    event.preventDefault();
    console.log('Đang submit form login...');

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDisplay = document.getElementById('login-error-message');

    // 1. Reset & Validate nhanh
    if (errorDisplay) errorDisplay.textContent = '';

    if (!email || !password) {
        const msg = 'Vui lòng nhập đủ thông tin!';
        if (errorDisplay) errorDisplay.textContent = msg;
        else alert(msg);
        return;
    }

    try {
        // 2. Gọi API qua authApi (Axios)
        const response = await authApi.login({ email, password });

        const { success, token, user, message } = response.data;

        if (success) {
            // Lưu "vé" vào bộ nhớ trình duyệt
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            alert('Đăng nhập thành công!');

            // 2. Kiểm tra Role để điều hướng
            if (user.role === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/index.html';
            }
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        const message = error.response?.data?.message || 'Lỗi kết nối server!';

        if (errorDisplay) {
            errorDisplay.textContent = message;
        } else {
            alert(message);
        }
    }
}

// --- 5. KÍCH HOẠT SỰ KIỆN (DOM READY) ---
document.addEventListener('DOMContentLoaded', () => {
    // A. Hiệu ứng chuyển trang (Links)
    const links = document.querySelectorAll('a');
    links.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (
                href &&
                !href.startsWith('#') &&
                !href.startsWith('javascript') &&
                link.target !== '_blank' &&
                href !== window.location.href
            ) {
                e.preventDefault();
                document.body.classList.remove('loaded');
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });

    // B. Gắn sự kiện Form Submit
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // C. Gắn sự kiện Toggle Buttons
    const toRegisterBtn = document.getElementById('to-register-btn');
    const toLoginBtn = document.getElementById('to-login-btn');

    if (toRegisterBtn)
        toRegisterBtn.addEventListener('click', switchToRegister);
    if (toLoginBtn) toLoginBtn.addEventListener('click', switchToLogin);

    // D. Check URL Param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'register') {
        const loginView = document.getElementById('login-view');
        const registerView = document.getElementById('register-view');
        if (loginView && registerView) {
            loginView.classList.add('hidden-form');
            registerView.style.transition = 'none';
            registerView.classList.remove('hidden-form');
            setTimeout(() => {
                registerView.style.transition = '';
            }, 100);
        }
    }
});
