import serviceApi from '../src/api/serviceApi.js';

document.addEventListener('DOMContentLoaded', () => {
    loadPackages();
    setupCreateModal(); // Kích hoạt sự kiện cho Modal
});

// --- LOGIC CHO MODAL TẠO MỚI ---
function setupCreateModal() {
    const modal = document.getElementById('create-modal');
    const btnOpen = document.getElementById('btn-open-modal');
    const btnClose = document.getElementById('btn-close-modal');
    const createForm = document.getElementById('create-form');

    // Bấm nút -> Mở Modal (đổi từ none sang flex để ra giữa màn hình)
    btnOpen.addEventListener('click', () => (modal.style.display = 'flex'));

    // Bấm hủy -> Tắt Modal + Xóa trắng Form
    btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
        createForm.reset();
    });

    // Bấm Submit Tạo mới
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Cạo data từ form
        const payload = {
            name: createForm.name.value,
            hours: Number(createForm.hours.value),
            price: Number(createForm.price.value),
            isActive: createForm.isActive.value === 'true',
        };

        try {
            await serviceApi.createPackage(payload);
            alert('Tuyệt vời! Đã tạo gói dịch vụ mới.');

            // Dọn dẹp chiến trường
            modal.style.display = 'none';
            createForm.reset();

            // CHÚT YẾU QUYẾT: Load lại lưới data ngay lập tức
            loadPackages();
        } catch (error) {
            console.error('Lỗi tạo gói:', error);
            alert(
                error.response?.data?.message || 'Không thể tạo gói lúc này!',
            );
        }
    });
}

// --- LOGIC LẤY DATA & RENDER (Giữ nguyên như anh em đã chốt) ---
async function loadPackages() {
    const container = document.getElementById('packages-container');
    try {
        const response = await serviceApi.getAllPackagesForAdmin();
        const packages = response.data.data;
        container.innerHTML = '';

        if (packages.length === 0) {
            container.innerHTML =
                '<p>Chưa có gói dịch vụ nào trên hệ thống.</p>';
            return;
        }

        packages.forEach((pkg) => {
            container.appendChild(createPackageCard(pkg));
        });
    } catch (error) {
        console.error('Lỗi tải data:', error);
        container.innerHTML =
            '<p style="color:var(--danger-red)">Lỗi mất kết nối máy chủ!</p>';
    }
}

// Hàm render thẻ Form Sửa/Xóa giữ nguyên y đúc bản cũ nhé Đại Ca...
function createPackageCard(pkg) {
    const div = document.createElement('div');
    // CSS tổng của thẻ Card
    div.className =
        'bg-white rounded-2xl p-6 shadow-sm border border-gray-200 border-t-4 border-t-dozzie-blue hover:shadow-md transition-shadow';

    div.innerHTML = `
        <form class="update-form space-y-3">
            <div>
                <label class="block text-xs font-bold text-dozzie-navy mb-1 uppercase tracking-wide">Tên gói:</label>
                <input type="text" name="name" value="${pkg.name}" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-dozzie-blue focus:outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-dozzie-navy mb-1 uppercase tracking-wide">Giờ:</label>
                    <input type="number" name="hours" value="${pkg.hours}" required min="1" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-dozzie-blue focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-dozzie-navy mb-1 uppercase tracking-wide">Giá (VNĐ):</label>
                    <input type="number" name="price" value="${pkg.price}" required min="0" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-dozzie-blue focus:outline-none">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-dozzie-navy mb-1 uppercase tracking-wide">Trạng thái:</label>
                <select name="isActive" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-dozzie-blue focus:outline-none font-medium ${pkg.isActive ? 'text-green-600' : 'text-red-500'}">
                    <option value="true" ${pkg.isActive ? 'selected' : ''}>Hoạt động</option>
                    <option value="false" ${!pkg.isActive ? 'selected' : ''}>Ẩn</option>
                </select>
            </div>
            <div class="flex gap-2 pt-4 mt-2 border-t border-gray-100">
                <button type="submit" class="flex-1 bg-dozzie-navy text-white text-sm font-bold py-2 rounded-lg hover:bg-opacity-80 transition-colors">Lưu Sửa</button>
                <button type="button" class="btn-delete px-4 bg-red-100 text-red-600 text-sm font-bold py-2 rounded-lg hover:bg-red-200 transition-colors">Xóa</button>
            </div>
        </form>
    `;
    // Gắn sự kiện
    div.querySelector('.update-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
            name: form.name.value,
            hours: Number(form.hours.value),
            price: Number(form.price.value),
            isActive: form.isActive.value === 'true',
        };
        try {
            await serviceApi.updatePackage(pkg._id, payload);
            alert(`Đã cập nhật thành công gói: ${payload.name}`);
        } catch (error) {
            alert(error.response?.data?.message || 'Cập nhật thất bại!');
        }
    });

    div.querySelector('.btn-delete').addEventListener('click', async () => {
        if (confirm('Chắc chắn muốn xóa vĩnh viễn chứ?')) {
            try {
                await serviceApi.deletePackage(pkg._id);
                alert('Đã xóa bay màu!');
                loadPackages();
            } catch (error) {
                alert(
                    error.response?.data?.message || 'Không thể xóa gói này!',
                );
            }
        }
    });

    return div;
}
