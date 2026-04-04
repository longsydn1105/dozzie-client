import axiosClient from './axiosClient.js';

const invoiceApi = {
    // ==========================================
    // KHU VỰC DÀNH CHO KHÁCH HÀNG (USER)
    // ==========================================

    /**
     * 1. Lấy danh sách hóa đơn của bản thân
     * Dùng để render ra các tab: Pending, Paid, Refunded ở trang Lịch sử
     */
    getMyInvoices: () => axiosClient.get('/invoices/my-invoices'),

    /**
     * 2. Khách bấm Xác nhận thanh toán
     * Gọi API này khi khách bấm thanh toán thành công ở màn hình Đếm ngược
     * @param {String} id - Mã ID của hóa đơn (Invoice _id)
     */
    payInvoice: (id) => axiosClient.patch(`/invoices/${id}/pay`),

    // ==========================================
    // KHU VỰC DÀNH CHO ADMIN
    // ==========================================

    /**
     * 3. Lấy toàn bộ hóa đơn hệ thống (Cho Dashboard Admin)
     */
    getAllInvoices: () => axiosClient.get('/invoices/all'),

    /**
     * 4. Tạo hóa đơn thủ công (Admin dùng)
     * Lưu ý: Hàm này ít dùng ở FE vì Backend đã tự động tạo lúc Đặt phòng rồi
     * @param {Object} data - payload (bookingId, userId, roomCharge, extraFee)
     */
    createInvoice: (data) => axiosClient.post('/invoices/create', data),

    /**
     * 5. Admin hoàn tiền cho khách (Hủy kèo)
     * Chỉ áp dụng cho những hóa đơn có status là 'paid'
     * @param {String} id - Mã ID của hóa đơn
     */
    refundInvoice: (id) => axiosClient.patch(`/invoices/${id}/refund`),
};

export default invoiceApi;
