// client/js/admin-guard.js
(function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user || user.role !== 'admin') {
        alert('Bạn không có quyền truy cập khu vực này!');
        window.location.href = '/login.html';
    }
})();
