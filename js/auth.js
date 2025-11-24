// client/js/auth.js

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

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorDisplay = document.getElementById('reg-error-message');

    // Reset lỗi cũ
    if (errorDisplay) {
        errorDisplay.textContent = '';
        errorDisplay.classList.remove('animate-pulse');
    }

    if (password.length < 6) {
        const msg = 'Mật khẩu yếu quá (tối thiểu 6 ký tự)!';
        if (errorDisplay) errorDisplay.textContent = msg;
        else alert(msg);
        return;
    }

    try {
        const res = await fetch(
            'https://dozzie-server.onrender.com/api/auth/register',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: name, email, password }),
            },
        );

        const result = await res.json();

        // --- XỬ LÝ KHI LỖI (409, 400, 500...) ---
        if (!res.ok) {
            console.log('Server trả về lỗi:', result.message); // Check console xem nó in ra gì

            if (errorDisplay) {
                // Hiển thị lỗi lên màn hình cho khách đọc
                errorDisplay.textContent =
                    result.message || 'Đăng ký thất bại!';
                errorDisplay.classList.add(
                    'animate-pulse',
                    'text-red-600',
                    'font-bold',
                );
            } else {
                // Fallback nếu không tìm thấy div lỗi
                alert(result.message || 'Đăng ký thất bại!');
            }
            return; // Dừng lại, không chạy đoạn thành công
        }

        // --- THÀNH CÔNG ---
        alert('Đăng ký thành công! Mời đại ca đăng nhập ngay.', () => {
            switchToLogin();
            const loginEmail = document.getElementById('login-email');
            const loginPass = document.getElementById('login-password');
            if (loginEmail) loginEmail.value = email;
            if (loginPass) {
                loginPass.value = '';
                loginPass.focus();
            }
        });
    } catch (err) {
        console.error('Lỗi hệ thống:', err);
        if (errorDisplay)
            errorDisplay.textContent =
                'Lỗi kết nối server (Check xem server bật chưa?)';
        else alert('Lỗi kết nối server!');
    }
}

// --- 4. HÀM XỬ LÝ ĐĂNG NHẬP ---
async function handleLogin(event) {
    event.preventDefault();
    console.log('Đang submit form login...');

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDisplay = document.getElementById('login-error-message');

    if (errorDisplay) errorDisplay.textContent = '';

    if (!email || !password) {
        if (errorDisplay)
            errorDisplay.textContent = 'Vui lòng nhập đủ thông tin!';
        else alert('Vui lòng nhập đủ thông tin!');
        return;
    }

    try {
        const response = await fetch(
            'https://dozzie-server.onrender.com/api/auth/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            },
        );

        const result = await response.json();

        if (!response.ok) {
            if (errorDisplay) errorDisplay.textContent = result.message;
            else alert(result.message);
            return;
        }

        console.log('Login thành công!', result);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        // --- CHUYỂN TRANG ---
        alert('Đăng nhập thành công! Chào mừng trở lại.', () => {
            console.log('Callback chuyển trang đang chạy...');
            window.location.replace('/index.html');
        });

        // Fallback an toàn: Nếu sau 2s mà alert chưa chạy callback thì tự chuyển
        setTimeout(() => {
            if (window.location.pathname.includes('login.html')) {
                window.location.href = '/index.html';
            }
        }, 2000);
    } catch (error) {
        console.error(error);
        alert('Lỗi kết nối server!');
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
