// js/components/AdminSidebar.js

export function renderSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;

    // 2. Định nghĩa menu với các link chuẩn
    const menuItems = [
        { name: 'Tổng quan', path: 'dashboard.html', icon: '📊' },
        { name: 'Quản lý Phòng', path: 'rooms.html', icon: '🛏️' },
        { name: 'Đơn đặt phòng', path: 'bookings.html', icon: '📅' },
        { name: 'Hóa đơn', path: 'invoices.html', icon: '💸' },
        { name: 'Cứu hộ SOS', path: 'sos.html', icon: '🚨' },
    ];

    // 3. Render Menu: So khớp URL để gán Class Active y hệt code gốc của ông
    const menuHTML = menuItems
        .map((item) => {
            const isActive = currentPath.includes(item.path);

            if (isActive) {
                // Class khi đang ở trang đó (Active)
                return `
                <a href="${item.path}" class="bg-dozzie-blue flex items-center space-x-3 rounded-lg p-3 font-medium text-white shadow-md">
                    <span class="h-6 w-6">${item.icon}</span> <span>${item.name}</span>
                </a>
            `;
            } else {
                // Class bình thường (Inactive)
                return `
                <a href="${item.path}" class="flex items-center space-x-3 rounded-lg p-3 text-gray-300 transition hover:bg-gray-700 hover:text-white">
                    <span class="h-6 w-6">${item.icon}</span> <span>${item.name}</span>
                </a>
            `;
            }
        })
        .join('');

    // 4. Lấy thông tin User an toàn (ưu tiên fullName như code ông viết)
    let user = { fullName: 'Admin Dozzie', email: 'admin@dozzie.com' };
    const userStr = localStorage.getItem('user');

    if (userStr) {
        try {
            const parsedUser = JSON.parse(userStr);
            user.fullName =
                parsedUser.fullName || parsedUser.name || 'Admin Dozzie';
            user.email = parsedUser.email || 'admin@dozzie.com';
        } catch (e) {
            console.error('Lỗi parse data user:', e);
        }
    }

    // Tạo link avatar tự động lấy chữ cái đầu của tên (API ui-avatars)
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=219EBC&color=fff&size=128`;

    // 5. Bơm nguyên khối HTML gốc của ông vào
    container.innerHTML = `
        <div class="bg-dozzie-navy flex w-64 flex-col p-6 text-white shadow-xl min-h-screen sticky top-0">
            <div class="mb-10 flex flex-col items-center border-b border-gray-700 pb-8">
                <img src="${avatarUrl}" alt="Avatar" class="h-20 w-20 rounded-full mb-4 border-2 border-dozzie-blue shadow-lg" />
                <h3 id="adminName" class="text-xl font-bold text-center">${user.fullName}</h3>
                <p id="adminEmail" class="text-sm text-gray-400 text-center">${user.email}</p>
            </div>

            <nav class="flex-grow space-y-4">
                ${menuHTML}
            </nav>

            <button id="logoutBtn" class="mt-auto flex w-full items-center justify-center space-x-2 rounded-lg bg-red-600 p-3 font-semibold text-white transition hover:bg-red-700 shadow-md">
                <span>🚪</span> <span>Đăng xuất</span>
            </button>
        </div>
    `;

    // 6. Xử lý nút Đăng xuất (Gắn thẳng vào đây luôn để file HTML nhẹ đi)
    document.getElementById('logoutBtn').addEventListener('click', () => {
        const isConfirm = confirm('Ông có chắc chắn muốn đăng xuất không?');
        if (isConfirm) {
            localStorage.clear();
            window.location.href = '../login.html';
        }
    });
}
