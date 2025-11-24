// client/js/booking.js

let requiredMale = 0;
let requiredFemale = 0;
let selectedRooms = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hứng dữ liệu từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const paramDate = urlParams.get('date');
    const paramTime = urlParams.get('time');
    const paramDuration = urlParams.get('duration');

    requiredMale = parseInt(urlParams.get('male')) || 0;
    requiredFemale = parseInt(urlParams.get('female')) || 0;
    if (requiredMale === 0 && requiredFemale === 0) requiredMale = 1;

    // --- MỚI: TỰ ĐỘNG ĐIỀN THÔNG TIN NGƯỜI DÙNG NẾU ĐÃ LOGIN ---
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Điền Họ tên (nếu có displayName hoặc lấy phần đầu email)
            const nameInput = document.getElementById('guest-name');
            if (nameInput) nameInput.value = user.displayName || '';

            // Điền Email
            const emailInput = document.getElementById('guest-email');
            if (emailInput) emailInput.value = user.email || '';
        } catch (e) {
            console.error('Lỗi đọc dữ liệu user:', e);
        }
    }
    // -------------------------------------------------------------

    // 2. Điền dữ liệu booking vào Form
    if (paramDate) document.getElementById('date-select').value = paramDate;
    if (paramTime) document.getElementById('start-time').value = paramTime;

    const durationSelect = document.getElementById('duration-select');
    if (paramDuration && durationSelect) durationSelect.value = paramDuration;

    // Hiển thị số lượng yêu cầu
    document.getElementById('req-male').textContent = requiredMale;
    document.getElementById('req-female').textContent = requiredFemale;

    // 3. Vẽ Bản Đồ
    renderFloor('map-floor-male', 'M', 20);
    renderFloor('map-floor-female', 'FM', 20);

    // 4. Tính toán & Check phòng
    checkAvailabilityAndCalcTime();

    // 5. Gắn sự kiện
    document
        .getElementById('date-select')
        .addEventListener('change', checkAvailabilityAndCalcTime);
    document
        .getElementById('start-time')
        .addEventListener('change', checkAvailabilityAndCalcTime);
    document
        .getElementById('duration-select')
        .addEventListener('change', checkAvailabilityAndCalcTime);

    // 6. Submit
    document
        .getElementById('booking-form')
        .addEventListener('submit', handleMultiBookingSubmit);

    updateSelectionStatus();

    // --- LOAD REVIEW CHO TRANG BOOKING ---
    loadBookingPageReviews();

    // Gắn sự kiện cho nút Viết Review ở trang này (Mở lại cái modal ở Main)
    const btnWritePage = document.getElementById('btn-write-review-page');
    if (btnWritePage) {
        btnWritePage.addEventListener('click', () => {
            // Trigger click vào nút viết review ẩn của Main (để tái sử dụng logic modal)
            const mainBtn = document.getElementById('btn-write-review');
            if (mainBtn) mainBtn.click();
        });
    }

    // 1. Chọn tất cả các link trong thanh điều hướng này
    const navLinks = document.querySelectorAll('#in-page-nav a');

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Chặn hành vi nhảy bụp mặc định

            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Tính toán vị trí cần đến (Trừ đi chiều cao của Navbar dính ở trên)
                const offsetTop = targetSection.offsetTop - 150;

                // Gọi hàm cuộn mượt
                smoothScrollTo(document.body, offsetTop, 1000); // 1000ms = 1 giây
            }
        });
    });

    // 2. Logic Active Menu khi cuộn (Highlight chữ khi lướt qua)
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const links = document.querySelectorAll('.nav-link');

        let current = '';
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            // -200 để active sớm hơn chút cho nhạy
            if (pageYOffset >= sectionTop - 200) {
                current = '#' + section.getAttribute('id');
            }
        });

        links.forEach((link) => {
            link.classList.remove('text-[#229ebd]', 'text-gray-800');
            link.classList.add('text-gray-400'); // Mặc định xám

            // Tìm cái gạch chân bên trong
            const border = link.querySelector('span');
            if (border) {
                border.classList.remove('w-full', 'opacity-100');
                border.classList.add('w-0', 'opacity-0');
            }

            if (link.getAttribute('href') === current) {
                link.classList.remove('text-gray-400');
                link.classList.add('text-[#229ebd]'); // Active màu xanh
                if (border) {
                    border.classList.remove('w-0', 'opacity-0');
                    border.classList.add('w-full', 'opacity-100'); // Hiện gạch chân
                }
            }
        });
    });
});

// --- LOGIC ACTIVE MENU KHI CUỘN ---
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // -150 để kích hoạt sớm hơn 1 chút khi cuộn tới gần
        if (pageYOffset >= sectionTop - 150) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove('text-[#229ebd]', 'border-[#229ebd]');
        if (link.getAttribute('href').includes(currentSection)) {
            link.classList.add('text-[#229ebd]', 'border-[#229ebd]');
        }
    });
});

// --- HÀM TOÁN HỌC CUỘN MƯỢT (Ease Out Cubic) ---
// element: thường là window hoặc body
// target: vị trí pixel muốn đến
// duration: thời gian chạy (ms)
function smoothScrollTo(element, target, duration) {
    const start = window.pageYOffset;
    const distance = target - start;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;

        // Hàm Ease Out Cubic: Chạy nhanh lúc đầu, chậm dần lúc cuối
        const run = easeOutCubic(timeElapsed, start, distance, duration);

        window.scrollTo(0, run);

        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Công thức toán học: t = time, b = start, c = change, d = duration
    function easeOutCubic(t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    }

    requestAnimationFrame(animation);
}
// Hàm lấy review riêng cho trang Booking
async function loadBookingPageReviews() {
    const container = document.getElementById('review-page-list');
    if (!container) return;

    try {
        const res = await fetch(
            'https://dozzie-server.onrender.com/api/reviews',
        );
        const result = await res.json();

        if (result.data && result.data.length > 0) {
            container.innerHTML = '';

            result.data.forEach((review) => {
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
                    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full flex flex-col hover:shadow-md transition-all">
                        
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-full bg-[#229ebd]/10 flex items-center justify-center text-[#229ebd] font-bold text-lg border border-[#229ebd]/20">
                                ${userInitial}
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 font-artusi">${userName}</h4>
                                <p class="text-xs text-gray-400">${date}</p>
                            </div>
                            <div class="ml-auto text-yellow-400 text-sm tracking-widest">${stars}</div>
                        </div>

                        <p class="text-gray-600 text-sm leading-relaxed font-bogart flex-1">
                            "${review.comment}"
                        </p>
                    </div>
                </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });

            // Khởi tạo Swiper (3 cột)
            if (typeof Swiper !== 'undefined') {
                new Swiper('.reviewPageSwiper', {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                        renderBullet: function (index, className) {
                            return (
                                '<span class="' +
                                className +
                                ' !bg-[#229ebd] !w-2 !h-2 !opacity-50 hover:!opacity-100"></span>'
                            );
                        },
                    },
                    breakpoints: {
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    },
                });
            }
        } else {
            container.innerHTML =
                '<p class="text-center text-gray-400 w-full py-4">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>';
        }
    } catch (err) {
        console.error('Lỗi load review:', err);
    }
}
// --- HÀM GỘP: TÍNH GIỜ RA + CHECK PHÒNG TRỐNG ---
async function checkAvailabilityAndCalcTime() {
    calculateEndTime();
    await fetchAndMarkBusyRooms();
}

// --- HÀM CHECK PHÒNG BỊ KẸT ---
async function fetchAndMarkBusyRooms() {
    const dateStr = document.getElementById('date-select').value;
    const timeStr = document.getElementById('start-time').value;
    const duration = parseInt(
        document.getElementById('duration-select').value || 3,
    );

    if (!dateStr || !timeStr) return;

    const userStart = new Date(`${dateStr}T${timeStr}:00`);
    const userEnd = new Date(userStart.getTime() + duration * 60 * 60 * 1000);

    try {
        // Reset trạng thái phòng
        document.querySelectorAll('.room-pod').forEach((el) => {
            el.classList.remove('booked-pod');
            el.innerHTML = `<span class="font-bold text-xs text-gray-500 pointer-events-none">${el.getAttribute('data-id')}</span>`;
        });

        const res = await fetch(
            `https://dozzie-server.onrender.com/api/bookings?date=${dateStr}`,
        );
        const result = await res.json();
        const bookings = result.data || [];
        const busyRoomIds = [];

        bookings.forEach((booking) => {
            const bookStart = new Date(booking.startTime);
            const bookEnd = new Date(booking.endTime);
            const isOverlap = bookStart < userEnd && bookEnd > userStart;

            if (isOverlap) {
                booking.roomIds.forEach((id) => {
                    if (!busyRoomIds.includes(id)) busyRoomIds.push(id);
                });
            }
        });

        // Tô màu phòng bận
        busyRoomIds.forEach((id) => {
            const el = document.querySelector(`.room-pod[data-id="${id}"]`);
            if (el) {
                el.classList.add('booked-pod');
                el.classList.remove('selected-pod');
                el.innerHTML =
                    '<span class="font-bold text-[10px] text-gray-400 transform -rotate-45">Bận</span>';

                if (selectedRooms.includes(id)) {
                    selectedRooms = selectedRooms.filter((r) => r !== id);
                    updateSelectionStatus();
                }
            }
        });
    } catch (err) {
        console.error('Lỗi check phòng:', err);
    }
}

// --- HÀM VẼ SÀN ---
function renderFloor(containerId, prefix, totalRooms) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const totalBlocks = Math.ceil(totalRooms / 2);
    for (let i = 0; i < totalBlocks; i++) {
        const roomA_ID = `${prefix}-${String(i * 2 + 1).padStart(2, '0')}`;
        const roomB_ID = `${prefix}-${String(i * 2 + 2).padStart(2, '0')}`;
        const blockHTML = `
            <div class="relative w-full aspect-[3/4] group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div class="room-pod pod-shape-a absolute inset-0 bg-white border-2 border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors z-10 flex items-start justify-start pl-2 pt-2"
                     data-id="${roomA_ID}" onclick="toggleRoomSelection(this)">
                    <span class="font-bold text-xs text-gray-500 pointer-events-none">${roomA_ID}</span>
                </div>
                <div class="room-pod pod-shape-b absolute inset-0 bg-gray-50 border-2 border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors z-20 flex items-end justify-end pr-2 pb-2"
                     data-id="${roomB_ID}" onclick="toggleRoomSelection(this)">
                    <span class="font-bold text-xs text-gray-500 pointer-events-none">${roomB_ID}</span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', blockHTML);
    }
}

// --- HÀM CHỌN PHÒNG ---
window.toggleRoomSelection = function (element) {
    if (element.classList.contains('booked-pod')) {
        alert('Phòng này đã có người đặt trong khung giờ bạn chọn rồi!');
        return;
    }

    const roomId = element.getAttribute('data-id');
    const isMaleRoom = roomId.startsWith('M');

    if (selectedRooms.includes(roomId)) {
        selectedRooms = selectedRooms.filter((id) => id !== roomId);
        element.classList.remove('selected-pod');
    } else {
        const currentMaleCount = selectedRooms.filter((id) =>
            id.startsWith('M'),
        ).length;
        const currentFemaleCount = selectedRooms.filter((id) =>
            id.startsWith('FM'),
        ).length;

        if (isMaleRoom) {
            if (currentMaleCount >= requiredMale) {
                alert(`Bạn chỉ cần đặt ${requiredMale} phòng Nam thôi!`);
                return;
            }
        } else {
            if (currentFemaleCount >= requiredFemale) {
                alert(`Bạn chỉ cần đặt ${requiredFemale} phòng Nữ thôi!`);
                return;
            }
        }
        selectedRooms.push(roomId);
        element.classList.add('selected-pod');
    }
    updateSelectionStatus();
};

// --- HÀM CẬP NHẬT UI ---
function updateSelectionStatus() {
    const statusEl = document.getElementById('selection-status');
    const countDisplay = document.getElementById('selected-count-display');
    const btnConfirm = document.getElementById('btn-confirm-booking');

    const currentMale = selectedRooms.filter((id) => id.startsWith('M')).length;
    const currentFemale = selectedRooms.filter((id) =>
        id.startsWith('FM'),
    ).length;

    countDisplay.textContent = selectedRooms.length;
    const isEnough =
        currentMale === requiredMale && currentFemale === requiredFemale;

    if (isEnough) {
        statusEl.className = 'text-green-500 flex items-center gap-1 font-bold';
        statusEl.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Đã chọn đủ!`;
        document.getElementById('selected-room-ids').value =
            JSON.stringify(selectedRooms);
        if (btnConfirm) {
            btnConfirm.disabled = false;
            btnConfirm.classList.remove(
                'bg-gray-300',
                'cursor-not-allowed',
                'shadow-none',
            );
            btnConfirm.classList.add(
                'bg-[#229ebd]',
                'hover:bg-[#1a8bb0]',
                'shadow-lg',
                'shadow-[#229ebd]/30',
                'hover:-translate-y-1',
                'cursor-pointer',
            );
        }
    } else {
        statusEl.className =
            'text-orange-500 flex items-center gap-1 font-bold';
        const missingMale = requiredMale - currentMale;
        const missingFemale = requiredFemale - currentFemale;
        let msg = 'Thiếu: ';
        let parts = [];
        if (missingMale > 0) parts.push(`${missingMale} Nam`);
        if (missingFemale > 0) parts.push(`${missingFemale} Nữ`);
        if (missingMale < 0) parts.push(`Dư ${Math.abs(missingMale)} Nam`);
        if (missingFemale < 0) parts.push(`Dư ${Math.abs(missingFemale)} Nữ`);
        statusEl.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> ${msg + parts.join(', ')}`;
        if (btnConfirm) {
            btnConfirm.disabled = true;
            btnConfirm.classList.add(
                'bg-gray-300',
                'cursor-not-allowed',
                'shadow-none',
            );
            btnConfirm.classList.remove(
                'bg-[#229ebd]',
                'hover:bg-[#1a8bb0]',
                'shadow-lg',
                'shadow-[#229ebd]/30',
                'hover:-translate-y-1',
                'cursor-pointer',
            );
        }
    }
}

// --- HÀM TÍNH GIỜ RA ---
function calculateEndTime() {
    const dateStr = document.getElementById('date-select').value;
    const timeStr = document.getElementById('start-time').value;
    const duration = parseInt(
        document.getElementById('duration-select').value || 3,
    );
    const displayEl = document.getElementById('end-time-display');
    const hiddenInput = document.getElementById('hidden-end-date-iso');

    if (!dateStr || !timeStr) {
        displayEl.textContent = '--:--';
        return;
    }
    const startDate = new Date(`${dateStr}T${timeStr}:00`);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    const timeFormat = endDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const dateFormat = endDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
    });
    displayEl.textContent = `${timeFormat} (${dateFormat})`;
    hiddenInput.value = endDate.toISOString();
}

// --- HÀM SUBMIT ---
async function handleMultiBookingSubmit(e) {
    e.preventDefault();
    // (Validation logic...)

    const dateStr = document.getElementById('date-select').value;
    const startTimeStr = document.getElementById('start-time').value;
    const startFull = new Date(`${dateStr}T${startTimeStr}:00`);
    const endTimeISO = document.getElementById('hidden-end-date-iso').value;

    const bookingPayload = {
        roomIds: selectedRooms,
        startTime: startFull.toISOString(),
        endTime: endTimeISO,
        name: document.getElementById('guest-name').value,
        phone: document.getElementById('guest-phone').value,
        email: document.getElementById('guest-email').value,
    };

    try {
        const res = await fetch(
            'https://dozzie-server.onrender.com/api/bookings',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload),
            },
        );
        const result = await res.json();
        if (!res.ok) {
            alert(`Thất bại: ${result.message}`);
        } else {
            // ⭐️ CHUYỂN TRANG TẠI ĐÂY ⭐️
            alert(
                `Đặt thành công ${selectedRooms.length} phòng! Kiểm tra email nhé.`,
                () => {
                    console.log('Callback đang chạy...');
                    window.location.href = '/index.html'; // Chuyển về trang chủ
                },
            );
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối server!');
    }
}
