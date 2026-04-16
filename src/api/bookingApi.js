import axiosClient from './axiosClient.js';

const bookingApi = {
    // ==========================================
    // KHU VỰC DÀNH CHO KHÁCH HÀNG (USER)
    // ==========================================

    /**
     * 1. Khách hàng tạo đơn đặt phòng mới (Giữ nguyên)
     * Kích hoạt khi khách bấm "Xác nhận đặt"
     * @param {Object} payload - { roomId, packageId, startTime }
     */
    createBooking: (payload) => axiosClient.post('/bookings', payload),

    /**
     * 2. Lấy danh sách booking của khách (Lịch sử cá nhân)
     * ⚠️ LƯU Ý: Tuyến đường đúng bên BE ông viết là /bookings/my-bookings
     * nên tôi phải sửa lại url cho khớp, không dùng /bookings chung chung nữa
     */
    getMyBookings: () => axiosClient.get('/bookings/my-bookings'),

    /**
     * 3. Khách hàng tự hủy đơn (Cancel Booking)
     * Chỉ áp dụng khi đơn đang Pending
     * @param {String} id - Mã Booking (bookingId)
     */
    cancelBooking: (id) => axiosClient.patch(`/bookings/${id}/cancel`),

    // ==========================================
    // KHU VỰC DÀNH CHO ADMIN
    // ==========================================

    /**
     * 4. Admin lấy tất cả booking (Dashboard/Báo cáo)
     * @param {Object} params - Các query filter (VD: { timeFilter: 'today', status: 'cancelled' })
     */
    getAllBookingsForAdmin: (params) =>
        axiosClient.get('/bookings/admin', { params }),

    /**
     * 5. Lấy danh sách Booking (Chung chung / Tìm kiếm)
     */
    getBookings: (params) => axiosClient.get('/bookings', { params }),

    /**
     * 6. Lấy chi tiết 1 Booking (Admin xem chi tiết)
     * @param {String} id - Mã Booking
     */
    getBookingById: (id) => axiosClient.get(`/bookings/${id}`),

    /**
     * 7. Cập nhật Booking (Admin Update trạng thái, thông tin)
     * @param {String} id - Mã Booking
     * @param {Object} payload - Thông tin cần update
     */
    updateBooking: (id, payload) => axiosClient.put(`/bookings/${id}`, payload),

    /**
     * 8. Xóa vĩnh viễn 1 Booking (Admin Delete - Xóa cứng)
     * Cảnh báo: Mất dữ liệu vĩnh viễn
     * @param {String} id - Mã Booking
     */
    deleteBookingById: (id) => axiosClient.delete(`/bookings/${id}`),
};

export default bookingApi;
