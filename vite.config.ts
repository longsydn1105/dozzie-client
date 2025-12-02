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
                features: resolve(__dirname, 'features.html')
            },
        },
    },
});
