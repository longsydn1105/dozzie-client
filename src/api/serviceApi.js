import axiosClient from './axiosClient.js';

const serviceApi = {
    /**
     * 1. Lấy danh sách gói đang hoạt động (Cho App Khách Hàng)
     * Router: GET /
     */
    getActivePackages: () => axiosClient.get('/service-packages'),

    /**
     *  Lấy TẤT CẢ các gói (Cho Web Admin)
     * Router: GET /all
     */
    getAllPackagesForAdmin: () => axiosClient.get('/service-packages/all'),

    /**
     * 2. Thêm gói dịch vụ mới (Admin)
     */
    createPackage: (payload) => axiosClient.post('/service-packages', payload),

    /**
     * 3. Sửa thông tin gói dịch vụ (Admin)
     */
    updatePackage: (id, payload) =>
        axiosClient.put(`/service-packages/${id}`, payload),

    /**
     * 4. Xóa vĩnh viễn gói dịch vụ (Admin)
     */
    deletePackage: (id) => axiosClient.delete(`/service-packages/${id}`),
};

export default serviceApi;
