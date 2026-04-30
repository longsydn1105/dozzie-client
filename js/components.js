// client/js/components.js

function renderNavbar() {
    // 1. Kiểm tra Token và bóc tách Role
    let token = localStorage.getItem('token');
    let isAdmin = false;
    let userName = 'Khách'; // Mặc định

    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));

            // --- LOGIC MỚI: KIỂM TRA HẠN SỬ DỤNG TOKEN ---
            const currentTime = Math.floor(Date.now() / 1000); // Lấy thời gian hiện tại (tính bằng giây)

            if (decodedPayload.exp && decodedPayload.exp < currentTime) {
                // TOKEN ĐÃ HẾT HẠN!
                console.warn('Token đã hết hạn, tự động đăng xuất trên UI.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                token = null; // Gán bằng null để code bên dưới tự động render ra nút Log In
            } else {
                // TOKEN CÒN SỐNG -> Lấy data ra dùng bình thường
                if (decodedPayload.role === 'admin') {
                    isAdmin = true;
                }

                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const userObj = JSON.parse(userStr);
                    userName = userObj.fullName || userObj.email.split('@')[0];
                }
            }
        } catch (error) {
            console.error('Lỗi giải mã token ở Navbar:', error);
            // Nếu token rác, decode lỗi thì cũng xóa luôn cho an toàn
            localStorage.removeItem('token');
            token = null;
        }
    }

    // 2. Tạo nút Dashboard cho Admin
    const adminDashboardBtn = isAdmin
        ? `<a href="/admin/dashboard.html" class="font-artusi rounded-full bg-[#229ebd] text-white px-5 py-2 font-bold hover:bg-[#1a8bb0] shadow-md hover:-translate-y-0.5 transition-all duration-300">Dashboard</a>`
        : '';

    // 3. Chuỗi HTML Navbar
    const navbarHTML = `
    <nav class="bg-white shadow-md py-4 sticky top-0 z-50 transition-all duration-300">
        <div class="container mx-auto px-4 flex justify-between items-center relative">
            
            <a href="/" class="flex items-center space-x-2 group">
                <img src="./assets/imgs/logo_dozzie.png" alt="Dozzie Logo" class="h-8 group-hover:scale-105 transition-transform">
            </a>

            <div class="hidden lg:flex items-center gap-8">
                <a href="/about.html" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">About Us</a>
                <a href="/features.html" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">Feature</a>
                <a href="/membership.html" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">Membership</a>
                <a href="/blog.html" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">Blog</a>
                <a href="/faq.html" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">FAQ</a>
            </div>

            <div class="hidden lg:flex items-center space-x-4">
                <div id="guest-actions" class="flex items-center space-x-4">
                    <a href="/login.html" class="font-artusi font-medium text-gray-700 transition-all duration-200 hover:font-bold hover:text-[#229ebd]">Log In</a>
                    <a href="/login.html?view=register" class="font-artusi rounded-full bg-[#229ebd] px-6 py-2.5 font-bold text-white transition-all duration-300 hover:bg-[#1a8bb0] hover:-translate-y-0.5 shadow-md hover:shadow-lg">Register</a>
                </div>

                <div id="user-actions" class="hidden items-center space-x-4">
                    
                    ${adminDashboardBtn} 
                    
                    <div class="relative" id="user-dropdown-container">
                        <button id="user-dropdown-trigger" class="flex items-center space-x-1 font-bogart font-bold text-gray-800 hover:text-[#229ebd] focus:outline-none transition-colors">
                            <span id="user-name-display">Xin chào, <span class="text-[#229ebd]">${userName}</span></span>
                            <svg class="w-4 h-4 transition-transform duration-200" id="user-dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        <div id="user-dropdown-menu" class="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 hidden opacity-0 transition-all duration-200 transform origin-top-right z-50 scale-95">
                            <div class="p-2 space-y-1 font-artusi">
                                <a href="/profile.html" class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#229ebd] rounded-lg transition-colors">Thông tin cá nhân</a>
                                
                                <a href="/payment.html" class="flex justify-between items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#229ebd] rounded-lg transition-colors group">
                                    <span>Thanh toán đơn</span>
                                    <span id="pending-badge" class="hidden bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full group-hover:scale-110 transition-transform">1</span>
                                </a>
                                
                                <a href="/my-booking.html" class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#229ebd] rounded-lg transition-colors">Lịch sử đặt phòng</a>

                                <a href="/control-room.html" class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#229ebd] rounded-lg transition-colors">Điều khiển phòng</a>

                                <div class="h-px bg-gray-100 my-1"></div>
                                
                                <button id="logout-btn" class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            </div>
    </nav>
    `;

    // 4. Bơm HTML vào DOM
    const placeholder = document.getElementById('app-navbar');
    if (placeholder) {
        placeholder.innerHTML = navbarHTML;
    }

    // --- 5. LOGIC HIỂN THỊ DỰA VÀO TOKEN ---
    // Sau khi bơm HTML xong, mình dùng JS để gỡ áo tàng hình
    if (token) {
        const guestDiv = document.getElementById('guest-actions');
        const userDiv = document.getElementById('user-actions');

        if (guestDiv) guestDiv.classList.add('hidden'); // Giấu Log In
        if (userDiv) {
            userDiv.classList.remove('hidden'); // Lột áo tàng hình
            userDiv.classList.add('flex'); // Trả lại layout flex cho nó xếp hàng ngang
        }
    }

    // --- 6. LOGIC XỬ LÝ DROPDOWN ---
    setupDropdownLogic();
}

function setupDropdownLogic() {
    const trigger = document.getElementById('user-dropdown-trigger');
    const menu = document.getElementById('user-dropdown-menu');
    const icon = document.getElementById('user-dropdown-icon');

    if (!trigger || !menu) return; // Nếu khách chưa đăng nhập thì mấy cái này ko tồn tại, bỏ qua.

    // Bấm vào tên user -> Bật/Tắt menu
    trigger.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài body

        // Toggle class để hiện/ẩn
        menu.classList.toggle('hidden');

        // Timeout xíu để CSS transition (scale, opacity) chạy cho mượt
        setTimeout(() => {
            menu.classList.toggle('opacity-0');
            menu.classList.toggle('scale-95');
            menu.classList.toggle('opacity-100');
            menu.classList.toggle('scale-100');
        }, 10);

        // Xoay icon mũi tên cho nó sinh động
        icon.classList.toggle('rotate-180');
    });

    // Giải thích tận gốc: Click ra ngoài thì phải tự động đóng Menu lại
    // Ví dụ: Đang mở Dropdown mà bấm ra khoảng trắng màn hình thì nó phải thu vào.
    document.addEventListener('click', (event) => {
        const isClickInside =
            trigger.contains(event.target) || menu.contains(event.target);

        if (!isClickInside && !menu.classList.contains('hidden')) {
            // Hiệu ứng thu vào
            menu.classList.remove('opacity-100', 'scale-100');
            menu.classList.add('opacity-0', 'scale-95');
            icon.classList.remove('rotate-180');

            // Đợi CSS transition chạy xong (200ms) rồi mới set hidden
            setTimeout(() => {
                menu.classList.add('hidden');
            }, 200);
        }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Ông muốn đăng xuất khỏi hệ thống?')) {
                // Xóa sạch dấu vết
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Tải lại trang web (lúc này token mất -> nó sẽ tự hiện lại nút Login)
                window.location.href = '/index.html';
            }
        });
    }
}

function renderFooter() {
    const footerHTML = `
    <footer class="mt-20 border-t border-gray-100 bg-white pt-16 pb-8 font-bogart">
        <div class="container mx-auto px-4">
            <div class="mb-8 text-sm text-gray-500">
                Home
            </div>

            <div class="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-5">
                
                <div class="space-y-8 lg:col-span-2">
                    <a href="/" class="block">
                        <span class="font-artusi text-4xl font-black tracking-tighter text-[#229ebd]">
                            Dozzie.
                        </span>
                    </a>

                    <p class="text-lg font-medium text-gray-600">
                        Experience more for less
                    </p>

                    <div class="group flex cursor-pointer items-center gap-4">
                        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ebd]/10 text-[#229ebd] transition-colors group-hover:bg-[#229ebd] group-hover:text-white">
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                        </div>
                        <div>
                            <p class="font-artusi text-xs font-bold uppercase tracking-wider text-gray-400">WhatsApp</p>
                            <p class="font-bogart text-lg font-bold text-gray-800 transition hover:text-[#229ebd]">+84 387234792</p>
                        </div>
                    </div>

                    <div class="group flex cursor-pointer items-center gap-4">
                        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ebd]/10 text-[#229ebd] transition-colors group-hover:bg-[#229ebd] group-hover:text-white">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p class="font-artusi text-xs font-bold uppercase tracking-wider text-gray-400">Email</p>
                            <p class="font-bogart text-lg font-bold text-gray-800 transition hover:text-[#229ebd]">DozzieCapsule@gmail.com</p>
                        </div>
                    </div>

                    <div class="flex space-x-6 pt-2 pl-2">
                        <a href="#" class="transform text-gray-400 transition hover:-translate-y-1 hover:scale-110 hover:text-[#229ebd]"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" /></svg></a>
                        <a href="#" class="transform text-gray-400 transition hover:-translate-y-1 hover:scale-110 hover:text-[#229ebd]"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg></a>
                        <a href="#" class="transform text-gray-400 transition hover:-translate-y-1 hover:scale-110 hover:text-[#229ebd]"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
                    </div>
                </div>

                <div>
                    <h4 class="font-artusi mb-6 text-xl font-bold text-[#18233B]">Company</h4>
                    <ul class="space-y-3 text-gray-500">
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Our Profile</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Career</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Promo</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Bob's Club</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Blog</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-artusi mb-6 text-xl font-bold text-[#18233B]">Products</h4>
                    <ul class="space-y-3 text-gray-500">
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Dozzie Pod</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Dozzie Cabin</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">CRIB</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Dozzie Play</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Dozzie Living</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-artusi mb-6 text-xl font-bold text-[#18233B]">Support</h4>
                    <ul class="space-y-3 text-gray-500">
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Help Center</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Privacy Notice</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Terms & Conditions</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Cookie Settings</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-artusi mb-6 text-xl font-bold text-[#18233B]">Business</h4>
                    <ul class="space-y-3 text-gray-500">
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Partnership</a></li>
                    </ul>
                </div>
                
            </div>

            <div class="border-t border-gray-100 pt-8 mb-8">
                <p class="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Chấp nhận thanh toán</p>
                <div class="flex flex-wrap justify-center items-center gap-6 md:gap-8 opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" class="h-6 md:h-8 object-contain grayscale hover:grayscale-0 transition-all">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" class="h-6 md:h-8 object-contain grayscale hover:grayscale-0 transition-all">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg" alt="JCB" class="h-6 md:h-8 object-contain grayscale hover:grayscale-0 transition-all">
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" class="h-6 md:h-8 object-contain grayscale hover:grayscale-0 transition-all">
                    <img src="https://vnpay.vn/assets/images/logo-icon/logo-primary.svg" alt="VNPay" class="h-5 md:h-6 object-contain grayscale hover:grayscale-0 transition-all">
                    <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Vietcombank.png" alt="Vietcombank" class="h-4 md:h-6 object-contain grayscale hover:grayscale-0 transition-all">
                </div>
            </div>
            
            <div class="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
                &copy; 2025 Dozzie Capsule Hotel. All rights reserved
            </div>
        </div>
    </footer>
    `;

    // Bắn Footer vào thẻ có id="app-footer"
    const footerPlaceholder = document.getElementById('app-footer');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    }
}

renderNavbar();
renderFooter();
