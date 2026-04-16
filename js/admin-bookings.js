import bookingApi from '../src/api/bookingApi.js'; // Nhớ đường dẫn này phải trỏ đúng file bookingApi.js

document.addEventListener('DOMContentLoaded', () => {
    setupFilters();
    loadBookings(); // Tải lần đầu
});

// --- 1. THIẾT LẬP BỘ LỌC CHÉO ---
function setupFilters() {
    const statusFilter = document.getElementById('filter-status');
    const dateFilter = document.getElementById('filter-date');
    const weekFilter = document.getElementById('filter-week');
    const monthFilter = document.getElementById('filter-month');
    const btnClear = document.getElementById('btn-clear-filter');

    // Chọn ngày thì xóa trắng tuần/tháng để logic không cắn nhau
    dateFilter.addEventListener('change', () => {
        weekFilter.value = '';
        monthFilter.value = '';
        loadBookings();
    });
    weekFilter.addEventListener('change', () => {
        dateFilter.value = '';
        monthFilter.value = '';
        loadBookings();
    });
    monthFilter.addEventListener('change', () => {
        dateFilter.value = '';
        weekFilter.value = '';
        loadBookings();
    });
    statusFilter.addEventListener('change', () => loadBookings());

    btnClear.addEventListener('click', () => {
        statusFilter.value = '';
        dateFilter.value = '';
        weekFilter.value = '';
        monthFilter.value = '';
        loadBookings();
    });
}

// --- 2. GỌI API LẤY DỮ LIỆU ---
async function loadBookings() {
    const tableBody = document.getElementById('bookings-table-body');
    const totalCount = document.getElementById('total-count');

    // Gom dữ liệu từ bộ lọc
    const params = {};
    const status = document.getElementById('filter-status').value;
    const date = document.getElementById('filter-date').value;
    const week = document.getElementById('filter-week').value;
    const month = document.getElementById('filter-month').value;

    if (status) params.status = status;

    // Gửi tham số customDate lên Backend
    if (date) params.customDate = date; // YYYY-MM-DD
    if (week) params.customWeek = week; // YYYY-Www
    if (month) params.customMonth = month; // YYYY-MM

    try {
        const response = await bookingApi.getAllBookingsForAdmin(params);
        const bookings = response.data.data;

        totalCount.textContent = `Tổng: ${response.data.count || bookings.length} đơn`;

        if (!bookings || bookings.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500 font-medium">Không tìm thấy đơn đặt phòng nào phù hợp!</td></tr>`;
            return;
        }

        renderTable(bookings);
    } catch (error) {
        console.error('Lỗi tải booking:', error);
        tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-500 font-bold">Lỗi kết nối máy chủ!</td></tr>`;
    }
}

// --- 3. RENDER BẢNG ---
function renderTable(bookings) {
    const tableBody = document.getElementById('bookings-table-body');
    tableBody.innerHTML = '';

    bookings.forEach((bk) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';

        // Bọc thép dữ liệu (chống undefined)
        const user = bk.userId || {};
        const userName = user.fullName || 'Khách vãng lai';
        const userEmail = user.email || '';

        const room = bk.roomId || {};
        const roomName =
            typeof room === 'object' ? room.label || room._id : room;

        const pkg = bk.packageId || {};
        const pkgName = pkg.name ? `${pkg.name} (${pkg.hours}h)` : 'N/A';

        const startTime = new Date(bk.startTime).toLocaleString('vi-VN');
        const endTime = new Date(bk.endTime).toLocaleString('vi-VN');
        const price = (bk.totalPrice || 0).toLocaleString('vi-VN');

        // Tạo Badge Trạng thái
        let statusBadge = '';
        let actionBtn = '';

        switch (bk.status) {
            case 'pending':
                statusBadge = `<span class="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-xs">Chờ thanh toán</span>`;
                // Nút Hủy chỉ xuất hiện khi pending
                actionBtn = `<button class="btn-cancel bg-red-100 text-red-600 hover:bg-red-500 hover:text-white border border-red-500 font-bold py-1.5 px-3 rounded-lg transition-colors text-xs shadow-sm" data-id="${bk._id}">Hủy Đơn</button>`;
                break;
            case 'active':
                statusBadge = `<span class="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">Đang sử dụng</span>`;
                actionBtn = `<span class="text-gray-400 text-xs italic">Không áp dụng</span>`;
                break;
            case 'completed':
                statusBadge = `<span class="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">Đã hoàn thành</span>`;
                actionBtn = `<span class="text-gray-400 text-xs italic">Không áp dụng</span>`;
                break;
            case 'cancelled':
            case 'admin_cancelled':
                statusBadge = `<span class="bg-gray-200 text-gray-600 font-bold px-3 py-1 rounded-full text-xs">Đã Hủy</span>`;
                actionBtn = `<span class="text-gray-400 text-xs italic">Đã xử lý</span>`;
                break;
            default:
                statusBadge = `<span class="bg-gray-100">${bk.status}</span>`;
        }

        tr.innerHTML = `
            <td class="p-4 border-b border-gray-100">
                <p class="font-bold text-dozzie-navy">${userName}</p>
                <p class="text-xs text-gray-500">${userEmail}</p>
            </td>
            <td class="p-4 border-b border-gray-100">
                <p class="font-bold text-dozzie-blue">${roomName}</p>
                <p class="text-xs text-gray-500">${pkgName}</p>
            </td>
            <td class="p-4 border-b border-gray-100 text-xs text-gray-600">
                <p><span class="font-bold">IN:</span> ${startTime}</p>
                <p><span class="font-bold">OUT:</span> ${endTime}</p>
            </td>
            <td class="p-4 border-b border-gray-100 font-bold text-red-500 text-right text-lg">
                ${price} đ
            </td>
            <td class="p-4 border-b border-gray-100 text-center">
                ${statusBadge}
            </td>
            <td class="p-4 border-b border-gray-100 text-center">
                ${actionBtn}
            </td>
        `;

        tableBody.appendChild(tr);
    });

    // Bắt sự kiện cho các nút Hủy Đơn
    document.querySelectorAll('.btn-cancel').forEach((btn) => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            handleAdminCancel(id);
        });
    });
}

// --- 4. ADMIN HỦY ĐƠN ---
async function handleAdminCancel(bookingId) {
    if (!confirm('Admin có chắc chắn muốn huỷ đơn đặt phòng này không?'))
        return;

    try {
        // Dùng API Update Booking để đổi trạng thái thành admin_cancelled
        await bookingApi.updateBooking(bookingId, {
            status: 'admin_cancelled',
        });
        alert('Đã hủy đơn thành công!');
        loadBookings(); // Render lại bảng
    } catch (error) {
        console.error('Lỗi hủy đơn:', error);
        alert(error.response?.data?.message || 'Lỗi hệ thống khi hủy đơn!');
    }
}
