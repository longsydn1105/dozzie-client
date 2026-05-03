// js/admin-message.js
import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import bookingApi from '../src/api/bookingApi.js';
import messageApi from '../src/api/messageApi.js';

// 1. CẤU HÌNH CƠ BẢN
const API_URL = 'https://dozzie-server.onrender.com/api';
const SOCKET_URL = 'https://dozzie-server.onrender.com';

// Lấy Token của Admin (Giả sử ông lưu ở localStorage)
const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token') || '';
let adminData = userStr ? JSON.parse(userStr) : { role: 'admin' };

// Trạng thái hiện tại
let currentBookingId = null;
let currentRoomId = null;
let socket = null;
// Cache bookings for debugging / lookup when clicking
let bookingsCache = {};

// 2. KẾT NỐI SOCKET.IO NGAY LẬP TỨC
function initSocket() {
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('🟢 Đã kết nối Socket Server thành công');
    });

    // Lắng nghe khi đang ở trong phòng kín
    socket.on('receive_message', (message) => {
        // Chỉ vẽ lên màn hình nếu tin nhắn thuộc về phòng đang mở
        if (message.bookingId === currentBookingId) {
            appendMessageToUI(message);
            scrollToBottom();
        }
        // Cập nhật lại tin nhắn cuối ở Cột Trái
        updateLastMessageInList(message.bookingId, message.text);
    });

    // Lắng nghe GLOBAL (để cập nhật list khi có người nhắn mà mình đang không xem phòng đó)
    socket.on('admin_global_notification', (message) => {
        if (message.bookingId !== currentBookingId) {
            updateBadgeInList(message.bookingId, true);
            updateLastMessageInList(message.bookingId, message.text);

            // Xóa chấm đỏ ở Sidebar tổng vì mình đang ở trang Message rồi
            localStorage.removeItem('hasUnreadMsg');
        }
    });
}

// 3. LOGIC LẤY DANH SÁCH PHÒNG (CỘT TRÁI)
async function fetchChatList() {
    const listContainer = document.getElementById('chat-list-container');

    try {
        // Gọi API lấy danh sách các Booking đang Active
        const response = await bookingApi.getAllBookingsForAdmin({
            status: 'active',
        });

        // Debug: in ra console response đầy đủ để dễ kiểm tra
        console.log('getAllBookingsForAdmin response:', response);

        const bookings = response.data.data || [];

        // cache toàn bộ bookings để dễ lookup khi cần debug
        bookingsCache = {};

        if (bookings.length === 0) {
            listContainer.innerHTML = `<div class="p-6 text-center text-gray-500">Không có đơn đặt phòng nào đang hoạt động.</div>`;
            return;
        }

        listContainer.innerHTML = ''; // Xóa loading

        // Vẽ từng item
        bookings.forEach((booking) => {
            // cache
            bookingsCache[booking._id] = booking;

            // Lấy tên phòng hoặc tên khách — backend populate roomId with `label` not `name`
            const roomName = booking.roomId?.label || booking.roomId?.name || booking.roomId || 'Phòng Unknow';
            const customerName = booking.userId?.fullName || 'Khách hàng';

            const itemHTML = `
                <div class="chat-list-item flex items-center p-4 border-b border-dozzie-gray cursor-pointer hover:bg-dozzie-bg transition relative" 
                     data-bookingid="${booking._id}" 
                     data-roomname="${roomName}">
                    <div class="relative">
                        <img src="https://ui-avatars.com/api/?name=${customerName}&background=219EBC&color=fff" class="h-12 w-12 rounded-full object-cover">
                    </div>
                    <div class="ml-4 flex-1 overflow-hidden">
                        <div class="flex justify-between items-center">
                            <h4 class="font-bold text-dozzie-navy truncate">${roomName} - ${customerName}</h4>
                        </div>
                        <p class="text-sm text-gray-500 truncate mt-1 last-msg-text" id="last-msg-${booking._id}">Nhấn để xem tin nhắn...</p>
                    </div>
                    <!-- Chấm đỏ báo có tin nhắn -->
                    <div id="badge-${booking._id}" class="hidden h-3 w-3 bg-dozzie-danger rounded-full absolute right-4 top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        // Gắn sự kiện click cho từng dòng
        document.querySelectorAll('.chat-list-item').forEach((item) => {
            item.addEventListener('click', function () {
                // Xóa màu active của các dòng khác
                document
                    .querySelectorAll('.chat-list-item')
                    .forEach((el) => el.classList.remove('bg-blue-50'));
                this.classList.add('bg-blue-50');

                const bId = this.getAttribute('data-bookingid');
                const rName = this.getAttribute('data-roomname');

                // Debug: log full booking object when clicking an item
                console.log('Clicked booking:', bookingsCache[bId]);

                openChatWindow(bId, rName);
            });
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách chat:', error);
        listContainer.innerHTML = `<div class="p-6 text-center text-dozzie-danger">Lỗi kết nối máy chủ!</div>`;
    }
}

// 4. MỞ CỬA SỔ CHAT BÊN PHẢI (Kéo Lịch sử & Join Room)
async function openChatWindow(bookingId, roomName) {
    currentBookingId = bookingId;
    currentRoomId = roomName;

    // Tắt chấm đỏ của phòng này
    updateBadgeInList(bookingId, false);

    // Mở UI
    document.getElementById('empty-chat-state').classList.add('hidden');
    document.getElementById('chat-header').classList.remove('hidden');
    document.getElementById('chat-messages').classList.remove('hidden');
    document.getElementById('chat-input-area').classList.remove('hidden');

    // Cập nhật Header — hiển thị tên khách nếu có
    const bookingObj = bookingsCache[bookingId] || null;
    const customerName = bookingObj?.userId?.fullName || 'Khách hàng';
    document.getElementById('chat-title').innerText = `${roomName} (${customerName})`;
    document.getElementById('chat-booking-id').innerText = bookingId;

    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = `<div class="text-center text-gray-400 my-4"><i class="fas fa-spinner fa-spin"></i> Đang tải tin nhắn...</div>`;

    try {
        // A. KÉO LỊCH SỬ TIN NHẮN TỪ API
        const response = await messageApi.getChatHistory(bookingId);
        const history = response.data?.data || [];

        messagesContainer.innerHTML = ''; // Xóa loading

        if (history.length === 0) {
            messagesContainer.innerHTML = `<div class="text-center text-gray-400 my-4 text-sm bg-dozzie-gray p-2 rounded-lg mx-10">Bắt đầu đoạn chat với khách hàng</div>`;
        } else {
            history.forEach((msg) => appendMessageToUI(msg));
        }
        scrollToBottom();

        // B. BÁO DANH VÀO PHÒNG QUA SOCKET
        socket.emit('join_chat', { bookingId: bookingId, role: 'admin' });
    } catch (error) {
        messagesContainer.innerHTML = `<div class="text-center text-dozzie-danger">Lỗi tải tin nhắn.</div>`;
    }
}

// 5. RENDER 1 TIN NHẮN LÊN MÀN HÌNH
function appendMessageToUI(message) {
    const messagesContainer = document.getElementById('chat-messages');
    const isMe = message.senderRole === 'admin';

    // Format giờ
    const date = new Date(message.createdAt || Date.now());
    const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const msgHTML = isMe
        ? `
        <!-- Tin của Lễ tân (Bên phải - Màu Xanh Dozzie) -->
        <div class="flex justify-end mb-4">
            <div class="max-w-[70%]">
                <div class="bg-dozzie-blue text-white p-3 rounded-2xl rounded-tr-sm shadow-sm inline-block">
                    <p class="text-sm">${message.text}</p>
                </div>
                <p class="text-[11px] text-gray-400 text-right mt-1">${timeString}</p>
            </div>
        </div>
        `
        : `
        <!-- Tin của Khách (Bên trái - Màu Trắng) -->
        <div class="flex justify-start mb-4">
            <img src="https://ui-avatars.com/api/?name=Guest&background=10B981&color=fff" class="h-8 w-8 rounded-full mr-2 self-end mb-5">
            <div class="max-w-[70%]">
                <div class="bg-white border border-dozzie-gray text-gray-800 p-3 rounded-2xl rounded-tl-sm shadow-sm inline-block">
                    <p class="text-sm">${message.text}</p>
                </div>
                <p class="text-[11px] text-gray-400 text-left mt-1">${timeString}</p>
            </div>
        </div>
        `;

    messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
}

// 6. XỬ LÝ GỬI TIN NHẮN
document.getElementById('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const text = input.value.trim();

    if (!text || !currentBookingId) return;

    const payload = {
        bookingId: currentBookingId,
        roomId: currentRoomId,
        senderRole: 'admin',
        text: text,
    };

    // Bắn qua Socket
    socket.emit('send_message', payload);

    input.value = '';
    input.focus();
});

// Cho phép Enter để gửi (Shift+Enter để xuống dòng)
document
    .getElementById('message-input')
    .addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document
                .getElementById('chat-form')
                .dispatchEvent(new Event('submit'));
        }
    });

// UTILS: Cuộn xuống cuối
function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}

// UTILS: Bật tắt chấm đỏ ở cột trái
function updateBadgeInList(bookingId, isShow) {
    const badge = document.getElementById(`badge-${bookingId}`);
    if (badge) {
        isShow
            ? badge.classList.remove('hidden')
            : badge.classList.add('hidden');
    }
}

// UTILS: Cập nhật chữ tin nhắn cuối
function updateLastMessageInList(bookingId, text) {
    const textEl = document.getElementById(`last-msg-${bookingId}`);
    if (textEl) {
        textEl.innerText = text;
        textEl.classList.replace('text-gray-500', 'text-gray-800');
        textEl.classList.add('font-medium');
    }
}

// CHẠY CHƯƠNG TRÌNH KHI TẢI TRANG
document.addEventListener('DOMContentLoaded', () => {
    initSocket();
    fetchChatList();
});
