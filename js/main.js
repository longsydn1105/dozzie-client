// client/js/main.js

// 1. HIỆU ỨNG KHI VÀO TRANG (FADE IN)
window.addEventListener('pageshow', (event) => {
    document.body.classList.add('loaded');
});

// client/js/main.js

// 1. Khai báo biến lưu hành động chờ (quan trọng)
window.dozzieAlertCallback = null;

// 2. GHI ĐÈ ALERT (PHIÊN BẢN CÓ CALLBACK)
// Cách dùng: alert("Thông báo", () => { code chạy sau khi bấm OK });
window.alert = function (message, callback = null) {
    console.log('Dozzie Alert:', message);

    // --- DÒNG QUAN TRỌNG PHẢI CÓ ĐỂ CHUYỂN TRANG ---
    if (typeof callback === 'function') {
        window.dozzieAlertCallback = callback;
    }
    // ------------------------------------------------

    // Xóa alert cũ
    const oldAlert = document.getElementById('dozzie-alert');
    if (oldAlert) oldAlert.remove();

    // HTML Alert
    const alertHTML = `
    <div id="dozzie-alert" class="fixed inset-0 z-[9999] flex items-center justify-center px-4 opacity-0 transition-opacity duration-300 ease-out">
        <div class="absolute inset-0 bg-[#18233B]/60 backdrop-blur-sm transition-opacity" onclick="closeDozzieAlert()"></div>
        <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 transform scale-90 transition-transform duration-300 ease-out border-4 border-white" id="dozzie-alert-box">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#229ebd]/10 mb-4">
                <svg class="h-8 w-8 text-[#229ebd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-black text-[#18233B] text-center mb-2 font-artusi tracking-wide">Dozzie Thông Báo</h3>
            <div class="mt-2 px-2">
                <p class="text-sm text-gray-500 text-center font-bogart leading-relaxed">${message}</p>
            </div>
            <div class="mt-6">
                <button onclick="closeDozzieAlert()" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg shadow-[#229ebd]/30 px-4 py-3 bg-[#229ebd] text-base font-bold text-white hover:bg-[#1a8bb0] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#229ebd] sm:text-sm transition-all duration-200 font-artusi">
                    OK, Đã rõ!
                </button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', alertHTML);

    setTimeout(() => {
        const alertEl = document.getElementById('dozzie-alert');
        const alertBox = document.getElementById('dozzie-alert-box');
        if (alertEl && alertBox) {
            alertEl.classList.remove('opacity-0');
            alertBox.classList.remove('scale-90');
            alertBox.classList.add('scale-100');
        }
    }, 10);
};

// 3. Hàm đóng Alert (Đã sửa để chạy lệnh chờ)
window.closeDozzieAlert = function () {
    const alertEl = document.getElementById('dozzie-alert');
    const alertBox = document.getElementById('dozzie-alert-box');

    if (alertEl && alertBox) {
        alertEl.classList.add('opacity-0');
        alertBox.classList.remove('scale-100');
        alertBox.classList.add('scale-90');

        setTimeout(() => {
            alertEl.remove();

            // --- CHẠY CALLBACK NẾU CÓ ---
            if (typeof window.dozzieAlertCallback === 'function') {
                window.dozzieAlertCallback();
                window.dozzieAlertCallback = null;
            }
        }, 300);
    }
};
// ... (Phần code cũ document.addEventListener... giữ nguyên bên dưới) ...
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. LOGIC CHUYỂN TRANG MƯỢT (FADE OUT)
    // ==========================================
    const links = document.querySelectorAll('a');
    links.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Chỉ chặn các link nội bộ, bỏ qua link neo, javascript, tab mới
            if (
                href &&
                !href.startsWith('#') &&
                !href.startsWith('javascript') &&
                link.target !== '_blank' &&
                href !== window.location.href
            ) {
                e.preventDefault();
                document.body.classList.remove('loaded'); // Làm mờ trang
                setTimeout(() => {
                    window.location.href = href;
                }, 500); // Chuyển sau 0.5s
            }
        });
    });

    // ==========================================
    // 2. RENDER UI COMPONENTS
    // ==========================================
    if (typeof renderNavbar === 'function') renderNavbar();
    if (typeof renderFooter === 'function') renderFooter();
    if (typeof checkAuthState === 'function') checkAuthState();

    // Logic Mobile Menu (Chờ Navbar render xong mới bắt)
    setTimeout(() => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }, 100);

    // ==========================================
    // 3. LOGIC SLIDER (SWIPER) - Đã gom gọn
    // ==========================================
    if (typeof Swiper !== 'undefined') {
        // 3.1. Slider Hero (Trang chủ)
        const heroSlider = document.querySelector('.mySwiper');
        if (heroSlider) {
            new Swiper('.mySwiper', {
                loop: true,
                speed: 800,
                autoplay: { delay: 4000, disableOnInteraction: false },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    renderBullet: function (index, className) {
                        return (
                            '<span class="' +
                            className +
                            ' !bg-[#229ebd] !w-3 !h-3 !opacity-50 hover:!opacity-100 transition-opacity"></span>'
                        );
                    },
                },
            });
        }

        // 3.2. Slider News & Updates
        const updateSlider = document.querySelector('.updateSwiper');
        if (updateSlider) {
            new Swiper('.updateSwiper', {
                loop: true,
                slidesPerView: 1,
                spaceBetween: 20,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                },
            });
        }

        // 3.3. Slider Blog (Nếu có)
        const blogSlider = document.querySelector('.blogHeroSwiper');
        if (blogSlider) {
            new Swiper('.blogHeroSwiper', {
                speed: 1000,
                parallax: true,
                loop: true,
                autoplay: { delay: 5000, disableOnInteraction: false },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: { el: '.swiper-pagination', clickable: true },
            });
        }
    }

    // ==========================================
    // 4. LOGIC FAQ (ACCORDION)
    // ==========================================
    const faqButtons = document.querySelectorAll('.faq-btn');
    faqButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('svg');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.classList.remove('rotate-180');
                btn.classList.remove('text-[#229ebd]');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.add('rotate-180');
                btn.classList.add('text-[#229ebd]');
            }
        });
    });

    // ==========================================
    // 5. LOGIC BOOKING BAR (NÂNG CẤP)
    // ==========================================
    const quickDateInput = document.getElementById('quick-date');
    const quickTimeInput = document.getElementById('quick-time');
    const focusInputs = document.querySelectorAll('.focus-bar-input');
    const overlay = document.getElementById('dim-overlay');
    const bookingBar = document.getElementById('booking-bar');
    const btnQuickSearch = document.getElementById('btn-quick-search');

    // --- A. Set Ngày Giờ Mặc Định ---
    if (quickDateInput) {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;

            if (!quickDateInput.value) quickDateInput.value = todayStr;
            quickDateInput.min = todayStr; // Chặn quá khứ

            if (quickTimeInput && !quickTimeInput.value)
                quickTimeInput.value = timeStr;
        } catch (e) {
            console.error(e);
        }
    }

    // --- B. Hiệu ứng Tập trung (Dim Overlay) ---
    function activateFocusMode() {
        if (overlay && bookingBar) {
            overlay.classList.remove('invisible', 'opacity-0');
            overlay.classList.add('visible', 'opacity-100');
            bookingBar.classList.add(
                'scale-[1.02]',
                'shadow-2xl',
                'relative',
                'z-50',
            );
        }
    }

    function deactivateFocusMode() {
        if (overlay && bookingBar) {
            overlay.classList.remove('visible', 'opacity-100');
            overlay.classList.add('invisible', 'opacity-0');
            bookingBar.classList.remove(
                'scale-[1.02]',
                'shadow-2xl',
                'relative',
                'z-50',
            );

            // Đóng luôn dropdown khách nếu đang mở
            const guestDropdown = document.getElementById('guest-dropdown');
            if (guestDropdown) guestDropdown.classList.add('hidden');
        }
    }

    if (focusInputs.length > 0) {
        focusInputs.forEach((input) => {
            // Input thường thì focus là bật
            input.addEventListener('focus', activateFocusMode);

            // Nút Guest (Button) thì click mới bật
            if (input.tagName === 'BUTTON' || input.id === 'guest-trigger') {
                input.addEventListener('click', (e) => {
                    e.stopPropagation();
                    activateFocusMode();
                    // Toggle dropdown khách
                    const guestDropdown =
                        document.getElementById('guest-dropdown');
                    if (guestDropdown) guestDropdown.classList.toggle('hidden');
                });
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', deactivateFocusMode);
    }

    // --- C. Logic Dropdown Khách (Cộng/Trừ) ---
    const guestSummary = document.getElementById('guest-summary');
    const btnsMinus = document.querySelectorAll('.guest-btn-minus');
    const btnsPlus = document.querySelectorAll('.guest-btn-plus');
    let counts = { male: 1, female: 0 }; // Mặc định

    function updateGuestUI() {
        if (document.getElementById('count-male'))
            document.getElementById('count-male').textContent = counts.male;
        if (document.getElementById('count-female'))
            document.getElementById('count-female').textContent = counts.female;
        if (guestSummary)
            guestSummary.textContent = `${counts.male} Nam, ${counts.female} Nữ`;
    }

    btnsMinus.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.dataset.type;
            if (counts[type] > 0) {
                if (counts.male + counts.female === 1 && counts[type] === 1)
                    return; // Giữ ít nhất 1 người
                counts[type]--;
                updateGuestUI();
            }
        });
    });

    btnsPlus.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.dataset.type;
            if (counts[type] < 10) {
                counts[type]++;
                updateGuestUI();
            }
        });
    });

    // --- D. Logic Chuyển Trang (Search) ---
    if (btnQuickSearch) {
        btnQuickSearch.addEventListener('click', () => {
            const date = document.getElementById('quick-date').value;
            const duration = document.getElementById('quick-duration').value;
            const time = document.getElementById('quick-time').value; // Lấy giờ (VD: "11:49")
            // Logic chọn giới tính thông minh:
            // Nếu chỉ có Nam -> Nam. Nếu chỉ có Nữ -> Nữ.
            // Nếu có cả 2 -> Ưu tiên Nam (hoặc logic khác tuỳ ông, hiện tại code cũ đang là Select box, giờ ta truyền tham số)
            // Ở đây tôi truyền số lượng luôn để bên kia xử lý
            let genderParam = 'Nam';
            if (counts.female > counts.male) genderParam = 'Nữ';

            // Tạo URL param mở rộng để bên Booking biết số lượng
            // (Cần update booking.js để hứng guest_male và guest_female nếu muốn xịn hơn)
            const targetUrl = `/book-now.html?date=${date}&time=${time}&duration=${duration}&gender=${genderParam}&male=${counts.male}&female=${counts.female}`;
            window.location.href = targetUrl;
        });
    }

    loadReviews();
    setupReviewLogic();
});
// --- HÀM LẤY VÀ HIỂN THỊ REVIEW ---
async function loadReviews() {
    const container = document.getElementById('review-list-container');
    if (!container) return;

    try {
        const res = await fetch(
            'https://dozzie-server.onrender.com/api/reviews',
        );
        const result = await res.json();

        if (result.data && result.data.length > 0) {
            container.innerHTML = ''; // Xóa mẫu

            result.data.forEach((review) => {
                // Render từng thẻ review
                const stars =
                    '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                const date = new Date(review.createdAt).toLocaleDateString(
                    'vi-VN',
                );
                const userName = review.userId
                    ? review.userId.displayName
                    : 'Ẩn danh';
                const userInitial = userName.charAt(0).toUpperCase();

                const html = `
                <div class="swiper-slide h-auto">
                    <div class="flex h-full flex-col rounded-3xl border border-gray-100 bg-[#f8faff] p-8 shadow-sm transition-shadow hover:shadow-md">
                        <div class="mb-4 flex text-yellow-400 text-xl tracking-widest">${stars}</div>
                        <p class="font-bogart mb-6 flex-1 text-lg italic leading-relaxed text-gray-600">"${review.comment}"</p>
                        <div class="flex items-center gap-4">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#18233B] font-bold text-white shadow-md">${userInitial}</div>
                            <div>
                                <h4 class="font-artusi font-bold text-[#18233B] text-lg">${userName}</h4>
                                <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">${date}</p>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });

            // Khởi tạo Swiper cho Review (Sau khi có data)
            if (typeof Swiper !== 'undefined') {
                new Swiper('.reviewSwiper', {
                    slidesPerView: 1,
                    spaceBetween: 30,
                    pagination: { el: '.swiper-pagination', clickable: true },
                    breakpoints: {
                        768: { slidesPerView: 2 }, // iPad hiện 2
                        1024: { slidesPerView: 3 }, // PC hiện 3
                    },
                    autoplay: { delay: 5000 },
                });
            }
        }
    } catch (err) {
        console.error('Lỗi load review:', err);
    }
}

// --- HÀM XỬ LÝ LOGIC VIẾT REVIEW ---
function setupReviewLogic() {
    const btnWrite = document.getElementById('btn-write-review');
    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('close-review-modal-btn');
    const closeBg = document.getElementById('close-review-modal-bg');
    const starBtns = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('rating-value');
    const form = document.getElementById('review-form');

    if (!btnWrite || !modal) return;

    // 1. Mở Modal (Có check Login)
    btnWrite.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để viết đánh giá nha đại ca!', () => {
                window.location.href = '/login.html';
            });
            return;
        }
        // Hiện Modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    // 2. Đóng Modal
    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };
    closeBtn.addEventListener('click', closeModal);
    closeBg.addEventListener('click', closeModal);

    // 3. Chọn Sao (Hiệu ứng vàng)
    starBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const value = index + 1;
            ratingInput.value = value;
            // Tô màu các ngôi sao
            starBtns.forEach((s, i) => {
                if (i < value) s.classList.add('text-yellow-400');
                else s.classList.remove('text-yellow-400');
            });
        });
    });

    // 4. Submit Form
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = ratingInput.value;
            const comment = document.getElementById('review-comment').value;
            const token = localStorage.getItem('token');

            if (!rating) {
                alert('Vui lòng chọn số sao!');
                return;
            }

            try {
                const res = await fetch(
                    'https://dozzie-server.onrender.com/api/reviews',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`, // Gửi kèm token
                        },
                        body: JSON.stringify({ rating, comment }),
                    },
                );

                if (res.ok) {
                    alert('Cảm ơn đại ca đã đánh giá!', () => {
                        closeModal();
                        loadReviews(); // Load lại list ngay lập tức
                    });
                } else {
                    alert('Lỗi rồi! Thử lại sau nhé.');
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi kết nối server!');
            }
        });
    }
}
// --- CÁC HÀM GLOBAL (Auth) ---
// (Giữ nguyên logic checkAuth cũ của ông ở đây)
function checkAuthState() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const guestActions = document.getElementById('guest-actions');
    const userActions = document.getElementById('user-actions');
    const userNameDisplay = document.getElementById('user-name-display');
    const logoutBtn = document.getElementById('logout-btn');

    if (token && userStr) {
        const user = JSON.parse(userStr);
        if (guestActions) guestActions.style.display = 'none';
        if (userActions) {
            userActions.style.display = 'flex';
            userActions.classList.remove('hidden');
        }
        if (userNameDisplay)
            userNameDisplay.textContent = `Xin chào, ${user.displayName || user.email}`;
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    } else {
        if (guestActions) guestActions.style.display = 'flex';
        if (userActions) userActions.style.display = 'none';
    }
}

function handleLogout() {
    // 1. Xóa sạch dấu vết
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. Thông báo -> Chờ bấm OK -> Mới chuyển trang
    alert('Đã đăng xuất thành công! Hẹn gặp lại.', () => {
        // Cách 1: Chuyển về trang chủ
        window.location.href = '/index.html';

        // Cách 2 (Nếu đang ở trang chủ rồi thì reload lại để cập nhật Header)
        // window.location.reload();
    });
}
