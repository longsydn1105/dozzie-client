import invoiceApi from '../src/api/invoiceApi.js';

document.addEventListener('DOMContentLoaded', () => {
    // 2. Tải dữ liệu hóa đơn
    loadInvoiceDetail();
});

// Thay thế toàn bộ hàm loadInvoiceDetail hiện tại của ông bằng cục này
async function loadInvoiceDetail() {
    const container = document.getElementById('payment-content');

    try {
        const response = await invoiceApi.getMyInvoices();
        const invoices = response.data.data;

        // Tìm hóa đơn đang chờ thanh toán
        const pendingInvoice = invoices.find(
            (inv) => inv.paymentStatus === 'pending',
        );

        if (!pendingInvoice) {
            renderEmptyState(container);
            return;
        }

        const booking = pendingInvoice.bookingId;
        const room = booking.roomId;
        const servicePackage = booking.packageId;

        // --- ÁO GIÁP CHỐNG LỖI UNDEFINED ---
        // 1. Xử lý tên phòng: Nếu nó là Object thì lấy .label, nếu nó là chuỗi gốc (M-01) thì lấy chính nó
        const roomName =
            room && typeof room === 'object'
                ? room.label || room.name || room._id
                : room || 'Chưa rõ phòng';

        // 2. Xử lý tên gói dịch vụ: An toàn lấy tên và giờ
        const pkgName =
            servicePackage && servicePackage.name
                ? servicePackage.name
                : 'Gói dịch vụ';
        const pkgHours =
            servicePackage && servicePackage.hours ? servicePackage.hours : 0;
        // ------------------------------------

        // Render chi tiết hóa đơn
        container.innerHTML = `
            <div class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 transition-all">
                <div class="bg-dozzie-navy p-8 text-white">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-sm font-bold tracking-widest uppercase opacity-70">Mã hóa đơn</span>
                        <span class="font-mono font-bold">${pendingInvoice.invoiceCode}</span>
                    </div>
                    <div class="text-4xl font-black">${pendingInvoice.totalAmount.toLocaleString('vi-VN')} <span class="text-xl">VNĐ</span></div>
                </div>

                <div class="p-8 space-y-6">
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <p class="text-xs font-bold text-gray-400 uppercase mb-1">Phòng</p>
                            <p class="text-lg font-bold text-dozzie-navy">${roomName}</p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-gray-400 uppercase mb-1">Gói dịch vụ</p>
                            <p class="text-lg font-bold text-dozzie-navy">${pkgName} (${pkgHours}h)</p>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-dashed border-gray-200">
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-500 font-medium">Nhận phòng:</span>
                            <span class="font-bold text-dozzie-navy">${new Date(booking.startTime).toLocaleString('vi-VN')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500 font-medium">Trả phòng:</span>
                            <span class="font-bold text-dozzie-navy">${new Date(booking.endTime).toLocaleString('vi-VN')}</span>
                        </div>
                    </div>

                    <button id="btn-pay-now" class="w-full bg-dozzie-blue hover:bg-opacity-90 text-white font-black py-5 rounded-2xl shadow-lg shadow-dozzie-blue/30 transition-all active:scale-95 text-xl mt-4">
                        XÁC NHẬN THANH TOÁN
                    </button>
                    
                    <p class="text-center text-xs text-gray-400 font-medium italic">
                        * Quá trình thanh toán được bảo mật bởi hệ thống Dozzie.
                    </p>
                </div>
            </div>
        `;

        // Gắn sự kiện thanh toán
        document
            .getElementById('btn-pay-now')
            .addEventListener('click', () => handlePayment(pendingInvoice._id));
    } catch (error) {
        console.error('Lỗi load hóa đơn:', error);
        container.innerHTML = `<p class="text-center text-red-500 font-bold py-10">Không thể tải thông tin thanh toán. Vui lòng thử lại!</p>`;
    }
}

async function handlePayment(invoiceId) {
    const btn = document.getElementById('btn-pay-now');
    btn.disabled = true;
    btn.innerHTML = 'ĐANG XỬ LÝ...';

    try {
        await invoiceApi.payInvoice(invoiceId);

        alert(
            'Thanh toán thành công! Chúc bạn có thời gian thư giãn tuyệt vời.',
        );

        // Đưa về trang chủ
        window.location.href = '/index.html';
    } catch (error) {
        alert(
            error.response?.data?.message ||
                'Thanh toán thất bại, vui lòng thử lại.',
        );
        btn.disabled = false;
        btn.innerHTML = 'XÁC NHẬN THANH TOÁN';
    }
}

function renderEmptyState(container) {
    container.innerHTML = `
        <div class="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
            <div class="text-6xl mb-6">☕</div>
            <h2 class="text-2xl font-bold text-dozzie-navy mb-2">Bạn không có hóa đơn nào chờ thanh toán</h2>
            <p class="text-gray-500 mb-8">Hãy đặt cho mình một căn Pod thật "chill" để trải nghiệm ngay nhé!</p>
            <a href="/book-now.html" class="inline-block bg-dozzie-navy text-white font-bold px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all">
                ĐẶT PHÒNG NGAY
            </a>
        </div>
    `;
}
