import axiosClient from './axiosClient.js';

const serviceApi = {
    /**
     * 1. Lấy danh sách gói dịch vụ đang hoạt động
     * (Khách hàng dùng để chọn lúc đặt phòng)
     */
    getAllPackages: () => axiosClient.get('/service-packages'),

    /**
     * 2. Thêm gói dịch vụ mới (Admin)
     * @param {Object} payload - Dữ liệu gói mới (VD: { name: "Gói Đêm", hours: 12, price: 200000 })
     */
    createPackage: (payload) => axiosClient.post('/service-packages', payload),

    /**
     * 3. Sửa thông tin gói dịch vụ (Admin)
     * Dùng cái này để Đổi giá hoặc Ẩn gói (truyền isActive: false)
     * @param {String} id - Mã ID của gói cần sửa
     * @param {Object} payload - Thông tin cần cập nhật
     */
    updatePackage: (id, payload) =>
        axiosClient.put(`/service-packages/${id}`, payload),

    /**
     * 4. Xóa vĩnh viễn gói dịch vụ (Admin)
     * Chú ý: Cẩn thận khi dùng nếu gói này đã có khách đặt trong quá khứ!
     * @param {String} id - Mã ID của gói cần xóa
     */
    deletePackage: (id) => axiosClient.delete(`/service-packages/${id}`),
};

export default serviceApi;
