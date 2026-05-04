// js/components/AdminSidebar.js
import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

export function renderSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const notifyAudio = new Audio('../assets/audio/notification_ting.mp3');

    // 1. Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;

    // 2. Định nghĩa menu
    const menuItems = [
        { name: 'Tổng quan', path: 'dashboard.html', icon: '📊' },
        { name: 'Quản lý Phòng', path: 'rooms.html', icon: '🛏️' },
        { name: 'Gói dịch vụ', path: 'servicepackage.html', icon: '🏷️' },
        { name: 'Đơn đặt phòng', path: 'bookings.html', icon: '📅' },
        { name: 'Hóa đơn', path: 'invoices.html', icon: '💸' },
        { name: 'Người dùng', path: 'users.html', icon: '👥' },
        { name: 'Đánh giá', path: 'reviews.html', icon: '⭐' },
        {
            name: 'Giao tiếp',
            path: 'message.html',
            icon: '💬',
            id: 'menu-chat',
        },
        { name: 'Cứu hộ SOS', path: 'sos.html', icon: '🚨' },
    ];

    if (currentPath.includes('message.html')) {
        localStorage.removeItem('hasUnreadMsg');
    }
    const hasUnread = localStorage.getItem('hasUnreadMsg') === 'true';

    // 3. Render Menu
    const menuHTML = menuItems
        .map((item) => {
            const isActive = currentPath.includes(item.path);

            let badgeHTML = '';
            if (item.id === 'menu-chat') {
                badgeHTML = `<span id="chat-badge" class="ml-auto h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] ${hasUnread ? '' : 'hidden'}"></span>`;
            }

            if (isActive) {
                return `
                <a href="${item.path}" class="bg-dozzie-blue flex items-center space-x-3 rounded-lg p-3 font-medium text-white shadow-md">
                    <span class="h-6 w-6">${item.icon}</span> <span>${item.name}</span>
                    ${badgeHTML}
                </a>`;
            } else {
                return `
                <a href="${item.path}" class="flex items-center space-x-3 rounded-lg p-3 text-gray-300 transition hover:bg-gray-700 hover:text-white">
                    <span class="h-6 w-6">${item.icon}</span> <span>${item.name}</span>
                    ${badgeHTML}
                </a>`;
            }
        })
        .join('');

    // 4. Lấy thông tin User
    let user = { fullName: 'Admin Dozzie', email: 'admin@dozzie.com' };
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const parsedUser = JSON.parse(userStr);
            user.fullName =
                parsedUser.fullName || parsedUser.name || 'Admin Dozzie';
            user.email = parsedUser.email || 'admin@dozzie.com';
        } catch (e) {}
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=219EBC&color=fff&size=128`;

    // 5. Bơm HTML vào Sidebar
    container.innerHTML = `
        <div class="bg-dozzie-navy flex w-64 flex-col p-6 text-white shadow-xl min-h-screen sticky top-0">
            <div class="mb-10 flex flex-col items-center border-b border-gray-700 pb-8">
                <img src="${avatarUrl}" alt="Avatar" class="h-20 w-20 rounded-full mb-4 border-2 border-dozzie-blue shadow-lg" />
                <h3 class="text-xl font-bold text-center">${user.fullName}</h3>
                <p class="text-sm text-gray-400 text-center">${user.email}</p>
            </div>
            <nav class="grow space-y-4">${menuHTML}</nav>
            <button id="logoutBtn" class="mt-auto flex w-full items-center justify-center space-x-2 rounded-lg bg-red-600 p-3 font-semibold text-white transition hover:bg-red-700 shadow-md">
                <span>🚪</span> <span>Đăng xuất</span>
            </button>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
            localStorage.clear();
            window.location.href = '../login.html';
        }
    });

    // ==========================================
    // 6. LOGIC CHAT (KHÔNG Ở TRANG MESSAGE)
    // ==========================================
    if (!currentPath.includes('message.html')) {
        if (typeof io !== 'undefined') {
            const socket = io('https://dozzie-server.onrender.com');

            socket.on('connect', () => {
                console.log('🟢 Sidebar socket đã kết nối thành công');
            });

            socket.on('admin_global_notification', (newMessage) => {
                localStorage.setItem('hasUnreadMsg', 'true');
                const badge = document.getElementById('chat-badge');
                if (badge) badge.classList.remove('hidden');

                notifyAudio.currentTime = 0;
                notifyAudio
                    .play()
                    .catch((e) => console.error('Lỗi phát âm thanh:', e));
            });

            socket.on('connect_error', (err) => {
                console.error('Socket kết nối lỗi:', err.message);
            });
        }
    }

    // ==========================================
    // 7. LOGIC SOS (HOẠT ĐỘNG Ở TẤT CẢ MỌI TRANG)
    // ==========================================
    if (typeof io !== 'undefined') {
        const sosSocket = io('https://dozzie-server.onrender.com'); 
        const sirenAudio = new Audio('../assets/audio/siren-alarm.mp3'); 
        sirenAudio.loop = true;

        sosSocket.on('ADMIN_SOS_ALERT', (sosData) => {
            console.log('🚨 BÁO ĐỘNG SOS PHÒNG:', sosData.roomId);

            sirenAudio
                .play()
                .catch((e) => console.error('Lỗi phát còi SOS:', e));

            // Tránh duplicate popup nếu nhận nhiều sự kiện cùng lúc
            if (document.getElementById(`sos-modal-${sosData.sosId}`)) return;

            // Dựng Modal đỏ chớp nháy
            const modalHTML = `
                <div id="sos-modal-${sosData.sosId}" class="fixed inset-0 z-[9999] flex items-center justify-center bg-red-900/90 backdrop-blur-sm">
                    <div class="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(255,0,0,0.8)] animate-pulse">
                        <div class="text-red-600 text-6xl mb-4">🚨</div>
                        <h1 class="text-4xl font-extrabold text-red-600 uppercase tracking-wider mb-2">Báo Động SOS!</h1>
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">PHÒNG: ${sosData.roomId}</h2>
                        <p class="text-lg text-gray-600 mb-8 font-medium">Khách hàng cần hỗ trợ gấp: ${sosData.message || ''}</p>
                        
                        <button id="btn-ack-${sosData.sosId}" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg transition transform hover:scale-105">
                            TÔI ĐÃ NHẬN TIN - ĐI CỨU HỘ
                        </button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Nút xác nhận tắt báo động
            document
                .getElementById(`btn-ack-${sosData.sosId}`)
                .addEventListener('click', () => {
                    sirenAudio.pause();
                    sirenAudio.currentTime = 0;
                    document
                        .getElementById(`sos-modal-${sosData.sosId}`)
                        .remove();

                    // Gọi API xác nhận đã xử lý SOS
                    const token = localStorage.getItem('token') || '';
                    fetch(
                        `https://dozzie-server.onrender.com/api/sos/resolve/${sosData.sosId}`,
                        {
                            method: 'PATCH',
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    ).catch((err) => console.error('Lỗi khi tắt SOS:', err));
                });
        });
    }
}
