import axiosClient from './axiosClient.js';

const messageApi = {
    // ==========================================
    // CHAT & TIN NHẮN
    // ==========================================

    /**
     * 1. Lấy lịch sử tin nhắn của một Booking
     * @param {String} bookingId - Mã Booking
     */
    getChatHistory: (bookingId) =>
        axiosClient.get(`/chat/history/${bookingId}`),
};

export default messageApi;
