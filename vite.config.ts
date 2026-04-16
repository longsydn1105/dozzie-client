import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [tailwindcss()],
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                register: resolve(__dirname, 'register.html'),
                booking: resolve(__dirname, 'book-now.html'),
                blog: resolve(__dirname, 'blog.html'),
                faq: resolve(__dirname, 'faq.html'),
                about: resolve(__dirname, 'about.html'),
                membership: resolve(__dirname, 'membership.html'),
                features: resolve(__dirname, 'features.html'),
                myBooking: resolve(__dirname, 'my-booking.html'),
                payment: resolve(__dirname, 'payment.html'),

                // --- KHU VỰC ADMIN (TẤT CẢ FILE TRONG THƯ MỤC ADMIN) ---
                adminDashboard: resolve(__dirname, 'admin/dashboard.html'),
                adminBookings: resolve(__dirname, 'admin/bookings.html'),
                adminInvoices: resolve(__dirname, 'admin/invoices.html'),
                adminRoomDetail: resolve(__dirname, 'admin/room-detail.html'),
                adminRooms: resolve(__dirname, 'admin/rooms.html'),
                adminServicePackage: resolve(__dirname,'admin/servicepackage.html',),
                adminUsers: resolve(__dirname, 'admin/users.html'),
            },
        },
    },
});
