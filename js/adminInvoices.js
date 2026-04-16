import invoiceApi from '../src/api/invoiceApi.js';

document.addEventListener('DOMContentLoaded', () => {
    loadAllInvoices();
});

async function loadAllInvoices() {
    const tableBody = document.getElementById('invoices-table-body');

    try {
        const response = await invoiceApi.getAllInvoices();
        const invoices = response.data.data;

        if (!invoices || invoices.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="p-8 text-center font-medium text-gray-500">Chưa có hóa đơn nào trên hệ thống.</td></tr>`;
            return;
        }

        tableBody.innerHTML = ''; // Xóa chữ loading

        invoices.forEach((inv) => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';

            // --- TRÍCH XUẤT VÀ CHỐNG LỖI DỮ LIỆU ---
            // 1. Thông tin khách
            const user = inv.userId || {};
            const customerName = user.fullName || 'Khách Vô Danh';
            const customerPhone = user.phone || 'Chưa có SĐT';

            // 2. Thông tin Booking
            const booking = inv.bookingId || {};

            // 3. Thông tin Phòng
            const room = booking.roomId;
            const roomName =
                room && typeof room === 'object'
                    ? room.label || room._id
                    : room || 'N/A';

            // 4. Thông tin Gói
            const pkg = booking.packageId;
            const pkgName = pkg && pkg.name ? pkg.name : 'Gói tùy chỉnh';

            // 5. Thời gian
            const checkIn = booking.startTime
                ? new Date(booking.startTime).toLocaleString('vi-VN')
                : 'N/A';
            const checkOut = booking.endTime
                ? new Date(booking.endTime).toLocaleString('vi-VN')
                : 'N/A';

            // 6. Trạng thái (Tạo Badge màu mè cho đẹp)
            let statusBadge = '';
            let refundBtn = '';

            if (inv.paymentStatus === 'paid') {
                statusBadge = `<span class="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">Đã Thanh Toán</span>`;
                // Đã thanh toán thì mới được hiện nút Hoàn Tiền
                refundBtn = `<button class="btn-refund text-red-500 hover:text-white border border-red-500 hover:bg-red-500 font-bold py-1 px-3 rounded transition-colors text-xs" data-id="${inv._id}">Hoàn Tiền</button>`;
            } else if (inv.paymentStatus === 'pending') {
                statusBadge = `<span class="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-xs">Chờ Thanh Toán</span>`;
                refundBtn = `<span class="text-gray-400 text-xs italic">Không khả dụng</span>`;
            } else if (inv.paymentStatus === 'refunded') {
                statusBadge = `<span class="bg-gray-200 text-gray-600 font-bold px-3 py-1 rounded-full text-xs">Đã Hoàn Tiền</span>`;
                refundBtn = `<span class="text-gray-400 text-xs italic">Đã xử lý</span>`;
            }

            // --- BƠM VÀO HTML ---
            tr.innerHTML = `
                <td class="p-4 border-b border-gray-100 font-mono font-bold text-dozzie-navy">${inv.invoiceCode}</td>
                <td class="p-4 border-b border-gray-100">
                    <p class="font-bold text-gray-800">${customerName}</p>
                    <p class="text-xs text-gray-500">${customerPhone}</p>
                </td>
                <td class="p-4 border-b border-gray-100">
                    <p class="font-bold text-dozzie-blue">${roomName}</p>
                    <p class="text-xs text-gray-500">${pkgName}</p>
                </td>
                <td class="p-4 border-b border-gray-100 text-xs text-gray-600">
                    <p><span class="font-bold">IN:</span> ${checkIn}</p>
                    <p><span class="font-bold">OUT:</span> ${checkOut}</p>
                </td>
                <td class="p-4 border-b border-gray-100 font-bold text-red-500 text-lg">
                    ${inv.totalAmount.toLocaleString('vi-VN')} đ
                </td>
                <td class="p-4 border-b border-gray-100 text-center">
                    ${statusBadge}
                </td>
                <td class="p-4 border-b border-gray-100 text-center">
                    ${refundBtn}
                </td>
            `;

            tableBody.appendChild(tr);
        });

        // Gắn sự kiện cho các nút Hoàn Tiền
        document.querySelectorAll('.btn-refund').forEach((btn) => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                handleRefund(id);
            });
        });
    } catch (error) {
        console.error('Lỗi tải danh sách hóa đơn:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="p-8 text-center font-bold text-red-500">Lỗi tải dữ liệu từ máy chủ.</td></tr>`;
    }
}

async function handleRefund(invoiceId) {
    if (
        !confirm(
            'Bạn có chắc chắn muốn HOÀN TIỀN (Refund) cho hóa đơn này không? Hành động này không thể hoàn tác!',
        )
    ) {
        return;
    }

    try {
        // Gọi API của Admin
        await invoiceApi.refundInvoice(invoiceId);
        alert('Hoàn tiền thành công!');

        // Load lại bảng để cập nhật trạng thái
        loadAllInvoices();
    } catch (error) {
        console.error('Lỗi hoàn tiền:', error);
        alert(error.response?.data?.message || 'Lỗi hệ thống khi hoàn tiền!');
    }
}
