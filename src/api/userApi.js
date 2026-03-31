import axiosClient from './axiosClient';

const userApi = {
    // Role User
    /**
     * 1. User tự cập nhật thông tin cá nhân của mình
     * @param {Object} payload - Thông tin cần sửa (VD: { fullName, phone, avatar... })
     */
    updateProfile: (payload) => axiosClient.put('/users/profile', payload),

    //Role Admin
    /**
     * 2. Lấy danh sách tất cả user
     * @param {Object} params - Dùng để làm bộ lọc, tìm kiếm, phân trang (VD: { role: 'user', search: 'Long' })
     */
    getAllUsers: (params) => axiosClient.get('/users', { params }),

    /**
     * 3. Lấy chi tiết 1 user cụ thể theo ID
     * @param {String} id - Cái mã _id loằng ngoằng của MongoDB
     */
    getUserById: (id) => axiosClient.get(`/users/${id}`),

    /**
     * 4. Admin sửa thông tin của 1 user bất kỳ (Đổi role, cấm tài khoản...)
     * @param {String} id - ID của user cần sửa
     * @param {Object} payload - Dữ liệu mới cập nhật
     */
    adminUpdateUser: (id, payload) => axiosClient.put(`/users/${id}`, payload),

    /**
     * 5. Xóa/Ban một user khỏi hệ thống
     * @param {String} id - ID của user cần tiễn đi
     */
    deleteUser: (id) => axiosClient.delete(`/users/${id}`),
};

export default userApi;
