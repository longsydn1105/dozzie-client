import axiosClient from './axiosClient.js';

const bookingApi = {
    /**
     * 1. Khách hàng tạo đơn đặt phòng mới
     * @param {Object} payload - { roomId, packageId, startTime }
     */
    createBooking: (payload) => axiosClient.post('/bookings', payload),

    /**
     * 2. Lấy danh sách booking của khách (Lịch sử cá nhân)
     * @param {Object} params - Các query filter (VD: { status: 'pending' })
     */
    getBookings: (params) => axiosClient.get('/bookings', { params }),

    /**
     * 3. Admin lấy tất cả booking (Hỗ trợ lọc theo thời gian, trạng thái)
     * @param {Object} params - Các query filter (VD: { timeFilter: 'today', status: 'cancelled' })
     */
    getAllBookingsForAdmin: (params) =>
        axiosClient.get('/bookings/admin', { params }),
};

export default bookingApi;
