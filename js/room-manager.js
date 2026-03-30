import roomApi from '../src/api/roomApi.js';

const RoomManager = {
    /**
     * Khởi tạo: Kiểm tra tham số URL để quyết định luồng xử lý
     */
    init() {
        const maleGrid = document.getElementById('male-rooms-grid');
        const femaleGrid = document.getElementById('female-rooms-grid');
        if (maleGrid) maleGrid.innerHTML = '';
        if (femaleGrid) femaleGrid.innerHTML = '';

        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id');

        if (roomId && window.location.pathname.includes('room-detail')) {
            this.loadRoomDetail(roomId);
            this.bindDetailEvents();
        } else {
            this.loadRooms();
            this.bindListEvents();
        }

        window.closeModal = () => this.closeModal();
    },

    /**
     * Đăng ký sự kiện cho trang danh sách phòng
     */
    bindListEvents() {
        const btnAdd = document.getElementById('btnAddRoom');
        if (!btnAdd || btnAdd.dataset.bound === 'true') return;

        btnAdd.addEventListener('click', () => this.openModal());
        btnAdd.dataset.bound = 'true';

        const formAdd = document.getElementById('formAddRoom');
        if (formAdd) {
            formAdd.addEventListener('submit', (e) => this.handleSubmit(e));
            formAdd.dataset.bound = 'true';
        }
    },

    /**
     * Đăng ký sự kiện cho trang chi tiết (Update)
     */
    bindDetailEvents() {
        const formUpdate = document.getElementById('formUpdateRoom');
        if (!formUpdate || formUpdate.dataset.bound === 'true') return;

        formUpdate.addEventListener('submit', (e) =>
            this.handleUpdateSubmit(e),
        );
        formUpdate.dataset.bound = 'true';

        const btnDelete = document.getElementById('btnDeleteRoom');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => this.handleDelete());
            btnDelete.dataset.bound = 'true';
        }
    },

    /**
     * Xử lý cập nhật thông tin phòng
     */
    async handleUpdateSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rawData = Object.fromEntries(formData.entries());

        const payload = {
            label: rawData.label,
            gender: rawData.gender,
            floor: Number(rawData.floor),
            status: rawData.status,
            iotConfig: {
                deviceId: rawData['iotConfig.deviceId'],
                topicDoor: rawData['iotConfig.topicDoor'],
                topicPower: rawData['iotConfig.topicPower'],
            },
        };

        const roomId = rawData._id;

        try {
            const response = await roomApi.updateRoom(roomId, payload);
            const result = response.data || response;

            if (result.success) {
                alert('Thông báo: Cập nhật thông tin phòng thành công.');
                this.loadRoomDetail(roomId);
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                'Lỗi hệ thống: Không thể cập nhật dữ liệu.';
            alert('Thông báo lỗi: ' + errorMsg);
        }
    },

    /**
     * Xử lý xóa phòng với xác nhận an toàn
     */
    async handleDelete() {
        const roomId = document.getElementById('in-id').value;
        const roomLabel = document.getElementById('in-label').value;

        const isConfirm = confirm(
            `Cảnh báo: Bạn có chắc chắn muốn xóa phòng "${roomLabel}" (ID: ${roomId}) không? Hành động này không thể hoàn tác.`,
        );

        if (isConfirm) {
            try {
                const response = await roomApi.deleteRoom(roomId);
                const result = response.data || response;

                if (result.success) {
                    alert('Thông báo: Đã xóa phòng khỏi hệ thống thành công.');
                    window.location.href = '/admin/rooms.html';
                }
            } catch (err) {
                const errorMsg =
                    err.response?.data?.message ||
                    'Lỗi hệ thống: Không thể xóa phòng.';
                alert('Thông báo lỗi: ' + errorMsg);
            }
        }
    },

    /**
     * Tải và hiển thị danh sách phòng (Có sắp xếp)
     */
    async loadRooms() {
        try {
            const response = await roomApi.getAllRooms();
            const rooms = response.data?.data || response.data || [];

            const sortFn = (a, b) =>
                a._id.localeCompare(b._id, undefined, { numeric: true });

            const maleRooms = rooms
                .filter((r) => r.gender === 'Nam')
                .sort(sortFn);
            const femaleRooms = rooms
                .filter((r) => r.gender === 'Nữ')
                .sort(sortFn);

            this.renderGrid(maleRooms, 'male-rooms-grid');
            this.renderGrid(femaleRooms, 'female-rooms-grid');
        } catch (err) {
            console.error('Lỗi hệ thống: Không thể tải danh sách phòng.', err);
        }
    },

    /**
     * Hiển thị danh sách phòng lên lưới
     */
    renderGrid(rooms, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const statusColors = {
            available: { bg: 'bg-green-100', dot: 'bg-green-500' },
            occupied: { bg: 'bg-red-100', dot: 'bg-red-500' },
            cleaning: { bg: 'bg-blue-100', dot: 'bg-blue-500' },
            maintenance: { bg: 'bg-gray-200', dot: 'bg-gray-500' },
        };

        container.innerHTML = rooms
            .map((room) => {
                const color =
                    statusColors[room.status] || statusColors.maintenance;
                return `
                <div onclick="window.location.href='/admin/room-detail.html?id=${room._id}'" 
                     class="relative bg-white border-2 border-gray-100 rounded-xl p-4 h-32 shadow-sm hover:border-dozzie-blue transition-all cursor-pointer hover:shadow-md">
                    <span class="absolute top-2 left-2 text-[10px] font-bold text-gray-400 uppercase">${room._id}</span>
                    <div class="flex items-center justify-center h-full">
                        <div class="w-10 h-10 rounded-full ${color.bg} flex items-center justify-center">
                            <div class="w-2.5 h-2.5 rounded-full ${color.dot}"></div>
                        </div>
                    </div>
                    <span class="absolute bottom-2 right-2 text-xs font-bold text-gray-600">${room.label}</span>
                </div>`;
            })
            .join('');
    },

    /**
     * Tải thông tin chi tiết của một phòng
     */
    async loadRoomDetail(id) {
        try {
            const response = await roomApi.getRoomById(id);
            const room = response.data?.data || response.data;
            this.renderDetailUI(room);
        } catch (err) {
            alert(
                'Thông báo: Không tìm thấy thông tin chi tiết cho phòng này.',
            );
            window.location.href = '/admin/rooms.html';
        }
    },

    /**
     * Đổ dữ liệu vào trang Chi tiết
     */
    renderDetailUI(room) {
        const safeSetVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        safeSetVal('in-label', room.label);
        safeSetVal('in-id', room._id);
        safeSetVal('in-gender', room.gender);
        safeSetVal('in-floor', room.floor);
        safeSetVal('in-status', room.status);

        const iot = room.iotConfig || {};
        safeSetVal('in-deviceId', iot.deviceId);
        safeSetVal('in-topicDoor', iot.topicDoor);
        safeSetVal('in-topicPower', iot.topicPower);

        // HIỂN THỊ TRẠNG THÁI ONLINE/OFFLINE (Dựa trên isOnline)
        const onlineBadge = document.getElementById('det-online');
        if (onlineBadge) {
            const isOnline = iot.isOnline || false;
            onlineBadge.innerHTML = `
                <div class="w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}"></div>
                <span class="${isOnline ? 'text-green-600' : 'text-gray-400'}">${isOnline ? 'TRỰC TUYẾN' : 'NGOẠI TUYẾN'}</span>
            `;
        }

        // NẾU ÔNG CÓ MỘT CÁI BADGE RIÊNG CHO STATUS PHÒNG (Sẵn sàng, Đang bận...)
        const statusBadge = document.getElementById('det-status-badge');
        if (statusBadge) {
            const statusMap = {
                available: {
                    text: 'Sẵn sàng',
                    class: 'bg-green-500/20 text-green-600',
                },
                occupied: {
                    text: 'Đang bận',
                    class: 'bg-red-500/20 text-red-600',
                },
                cleaning: {
                    text: 'Dọn dẹp',
                    class: 'bg-blue-500/20 text-blue-600',
                },
                maintenance: {
                    text: 'Bảo trì',
                    class: 'bg-gray-500/20 text-gray-600',
                },
            };
            const config = statusMap[room.status] || statusMap.maintenance;
            statusBadge.textContent = config.text;
            statusBadge.className = `px-4 py-2 rounded-full font-bold text-sm uppercase ${config.class}`;
        }
    },

    /**
     * Xử lý tạo phòng mới
     */
    async handleSubmit(e) {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target).entries());
        payload.floor = Number(payload.floor);

        try {
            const res = await roomApi.createRoom(payload);
            if (res.data?.success || res.success) {
                alert('Thông báo: Khởi tạo dữ liệu phòng mới thành công.');
                this.closeModal();
                this.loadRooms();
            }
        } catch (err) {
            const msg =
                err.response?.data?.message || 'Lỗi hệ thống khi tạo phòng.';
            alert('Thông báo lỗi: ' + msg);
        }
    },

    openModal() {
        document.getElementById('addRoomModal')?.classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('addRoomModal')?.classList.add('hidden');
    },
};

window.RoomManager = RoomManager;

window.addEventListener('load', () => RoomManager.init());

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        if (window.location.pathname.includes('room-detail')) {
            const id = new URLSearchParams(window.location.search).get('id');
            if (id) RoomManager.loadRoomDetail(id);
        } else {
            RoomManager.loadRooms();
        }
    }
});
