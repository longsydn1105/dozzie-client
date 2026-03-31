import userApi from '../src/api/userApi.js';

async function fetchAndRenderUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    try {
        // 1. Gọi API lấy danh sách
        const res = await userApi.getAllUsers();
        // Xử lý an toàn vì res của axios thường nằm trong res.data
        const users = res.data?.data || [];

        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-500">Chưa có người dùng nào trên hệ thống.</td></tr>`;
            return;
        }

        // 2. Map dữ liệu thành các dòng HTML
        const html = users
            .map((user, index) => {
                // Định dạng ngày tháng (VD: 20/10/2025)
                const dateStr = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A';

                // Xử lý màu sắc cho Role
                const roleBadge =
                    user.role === 'admin'
                        ? `<span class="bg-dozzie-blue/10 text-dozzie-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Admin</span>`
                        : `<span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">User</span>`;

                // Xử lý màu sắc cho Status
                const statusBadge =
                    user.status === 'active'
                        ? `<span class="text-green-600 font-bold text-sm flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Hoạt động</span>`
                        : `<span class="text-red-600 font-bold text-sm flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Khóa</span>`;

                return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4 text-gray-500 font-medium">${index + 1}</td>
                    <td class="p-4">
                        <div class="font-bold text-dozzie-navy">${user.fullName}</div>
                        <div class="text-sm text-gray-500">${user.email}</div>
                    </td>
                    <td class="p-4 font-medium text-gray-700">${user.phone || 'Chưa cập nhật'}</td>
                    <td class="p-4">${roleBadge}</td>
                    <td class="p-4">${statusBadge}</td>
                    <td class="p-4 text-sm text-gray-500">${dateStr}</td>
                    <td class="p-4 text-center">
                        <button onclick="editUser('${user._id}')" class="text-dozzie-blue hover:text-[#187b94] font-bold mx-2 transition">Sửa</button>
                        <button onclick="deleteUser('${user._id}')" class="text-red-500 hover:text-red-700 font-bold mx-2 transition">Xóa</button>
                    </td>
                </tr>
            `;
            })
            .join('');

        // 3. Đổ HTML vào bảng
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-500 font-bold">Lỗi tải dữ liệu. Hãy kiểm tra kết nối Server!</td></tr>`;
    }
}

// Hàm mở Modal và đổ dữ liệu cũ vào
window.editUser = async function (id) {
    try {
        const res = await userApi.getUserById(id);
        const user = res.data?.data || res.data;

        if (user) {
            // Đổ data vào các ô input trong Modal
            document.getElementById('edit-userId').value = user._id;
            document.getElementById('edit-fullName').value = user.fullName;
            document.getElementById('edit-phone').value = user.phone || '';
            document.getElementById('edit-role').value = user.role;
            document.getElementById('edit-status').value = user.status;

            // Hiển thị Modal
            const modal = document.getElementById('editUserModal');
            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết user:', error);
        alert('Không thể lấy thông tin người dùng!');
    }
};

// 2. Hàm đóng Modal
window.closeModal = function () {
    document.getElementById('editUserModal').classList.add('hidden');
};

// 3. Xử lý khi nhấn nút "Lưu Thay Đổi" (Submit Form)
const editForm = document.getElementById('formEditUser');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-userId').value;
        const payload = {
            fullName: document.getElementById('edit-fullName').value,
            phone: document.getElementById('edit-phone').value,
            role: document.getElementById('edit-role').value,
            status: document.getElementById('edit-status').value,
        };

        try {
            const res = await userApi.adminUpdateUser(id, payload);

            if (res.data?.success || res.status === 200) {
                alert('Cập nhật thành công!');
                closeModal();
                fetchAndRenderUsers();
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật user:', error);
            alert(error.response?.data?.message || 'Cập nhật thất bại!');
        }
    });
}

// 4. Xử lý xóa User
window.deleteUser = async function (id) {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này không')) {
        try {
            await userApi.deleteUser(id);
            alert('Đã xóa thành công!');
            fetchAndRenderUsers(); // Cập nhật lại bảng
        } catch (error) {
            alert('Xóa thất bại!');
        }
    }
};

// Chạy hàm ngay khi HTML đã load xong
document.addEventListener('DOMContentLoaded', fetchAndRenderUsers);
