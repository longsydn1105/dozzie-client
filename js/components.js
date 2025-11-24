// client/js/components.js

function renderNavbar() {
    const navbarHTML = `
    <nav class="bg-white shadow-md py-4 sticky top-0 z-50 transition-all duration-300">
        <div class="container mx-auto px-4 flex justify-between items-center relative">
            
            <a href="/" class="flex items-center space-x-2 group">
                <img src="/assets/imgs/logo_dozzie.png" alt="Dozzie Logo" class="h-8 group-hover:scale-105 transition-transform">
            </a>

            <div class="hidden lg:flex items-center space-x-8">

                <a href="#" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">About</a>

                <div class="group relative">
                    <button class="font-artusi flex items-center font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">
                        Offers
                        <svg class="ml-1 h-4 w-4 transform transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute left-1/2 mt-2 w-48 origin-top -translate-x-1/2 scale-y-0 transform rounded-xl bg-white py-2 opacity-0 shadow-xl border border-gray-100 transition-all duration-300 ease-out group-hover:scale-y-100 group-hover:opacity-100">
                        <a href="#" class="font-bogart block px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#229ebd] font-bold">Ưu đãi hôm nay</a>
                        <a href="#" class="font-bogart block px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#229ebd] font-bold">Gói dài hạn</a>
                    </div>
                </div>

                <a href="#" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">Membership</a>
                <a href="/blog.html" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">Blog</a>
                <a href="/faq.html" class="font-artusi font-medium text-gray-700 transition duration-200 hover:text-[#229ebd]">Q&A</a>
            </div>

            <div class="hidden lg:flex items-center space-x-4">
                <div id="guest-actions" class="flex items-center space-x-4">
                    <a href="/login.html" class="font-artusi font-medium text-gray-700 transition-all duration-200 hover:font-bold hover:text-[#229ebd]">Log In</a>
                    <a href="/login.html?view=register" class="font-artusi rounded-full bg-[#229ebd] px-6 py-2.5 font-bold text-white transition-all duration-300 hover:bg-[#1a8bb0] hover:-translate-y-0.5 shadow-md hover:shadow-lg">Register</a>
                </div>

                <div id="user-actions" class="hidden flex items-center space-x-4">
                    <span id="user-name-display" class="font-bogart font-bold text-gray-800">Xin chào,</span>
                    <button id="logout-btn" class="font-artusi rounded-full bg-gray-100 text-gray-600 px-5 py-2 font-bold hover:bg-red-500 hover:text-white transition duration-300">Logout</button>
                </div>
            </div>

            <div class="lg:hidden">
                <button id="mobile-menu-button" class="text-gray-700 hover:text-[#229ebd] focus:outline-none transition">
                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>
        </div>

        <div id="mobile-menu" class="mt-2 hidden bg-white py-4 shadow-inner border-t border-gray-100 lg:hidden">
            <div class="flex flex-col space-y-2 px-6">
                <a href="#" class="font-bogart block py-3 font-bold text-gray-700 hover:text-[#229ebd]">About</a>
                <a href="#" class="font-bogart block py-3 font-bold text-gray-700 hover:text-[#229ebd]">Offers</a>
                <a href="#" class="font-bogart block py-3 font-bold text-gray-700 hover:text-[#229ebd]">Membership</a>
                <a href="/blog.html" class="font-bogart block py-3 font-bold text-gray-700 hover:text-[#229ebd]">Blog</a>
                <a href="/faq.html" class="font-bogart block py-3 font-bold text-gray-700 hover:text-[#229ebd]">Q&A</a>
                <div class="h-px bg-gray-100 my-2"></div>
                <a href="/login.html" class="font-artusi block py-3 font-bold text-gray-700 hover:text-[#229ebd]">Log In</a>
                <a href="/login.html?view=register" class="font-artusi block rounded-lg text-[#229ebd] py-2 font-black">Register Now</a>
            </div>
        </div>
    </nav>
    `;

    // Bơm HTML vào thẻ có id="app-navbar"
    const placeholder = document.getElementById('app-navbar');
    if (placeholder) {
        placeholder.innerHTML = navbarHTML;
    }
}

function renderFooter() {
    const footerHTML = `
    <footer class="mt-20 border-t border-gray-100 bg-white pt-16 pb-8 font-bogart">
        <div class="container mx-auto px-4">
            <div class="mb-8 text-sm text-gray-500">
                Home
            </div>

            <div class="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-5">
                
                <div class="space-y-8 lg:col-span-2">
                    <a href="/" class="block">
                        <span class="font-artusi text-4xl font-black tracking-tighter text-[#229ebd]">
                            Dozzie.
                        </span>
                    </a>

                    <p class="text-lg font-medium text-gray-600">
                        Experience more for less
                    </p>

                    <div class="group flex cursor-pointer items-center gap-4">
                        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ebd]/10 text-[#229ebd] transition-colors group-hover:bg-[#229ebd] group-hover:text-white">
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                        </div>
                        <div>
                            <p class="font-artusi text-xs font-bold uppercase tracking-wider text-gray-400">WhatsApp</p>
                            <p class="font-bogart text-lg font-bold text-gray-800 transition hover:text-[#229ebd]">+84 909 090 909</p>
                        </div>
                    </div>

                    <div class="group flex cursor-pointer items-center gap-4">
                        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ebd]/10 text-[#229ebd] transition-colors group-hover:bg-[#229ebd] group-hover:text-white">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p class="font-artusi text-xs font-bold uppercase tracking-wider text-gray-400">Email</p>
                            <p class="font-bogart text-lg font-bold text-gray-800 transition hover:text-[#229ebd]">help@dozzie.com</p>
                        </div>
                    </div>

                    <div class="flex space-x-6 pt-2 pl-2">
                        <a href="#" class="transform text-gray-400 transition hover:-translate-y-1 hover:scale-110 hover:text-[#229ebd]"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" /></svg></a>
                        <a href="#" class="transform text-gray-400 transition hover:-translate-y-1 hover:scale-110 hover:text-[#229ebd]"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg></a>
                        <a href="#" class="transform text-gray-400 transition hover:-translate-y-1 hover:scale-110 hover:text-[#229ebd]"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
                    </div>
                </div>

                <div>
                    <h4 class="font-artusi mb-6 text-xl font-bold text-[#18233B]">Company</h4>
                    <ul class="space-y-3 text-gray-500">
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Our Profile</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Career</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Promo</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Bob's Club</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Blog</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-artusi mb-6 text-xl font-bold text-[#18233B]">Products</h4>
                    <ul class="space-y-3 text-gray-500">
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Dozzie Pod</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Dozzie Cabin</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">CRIB</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Dozzie Play</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Dozzie Living</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-artusi mb-6 text-xl font-bold text-[#18233B]">Support</h4>
                    <ul class="space-y-3 text-gray-500">
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Help Center</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Privacy Notice</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Terms & Conditions</a></li>
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Cookie Settings</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-artusi mb-6 text-xl font-bold text-[#18233B]">Business</h4>
                    <ul class="space-y-3 text-gray-500">
                        <li><a href="#" class="inline-block transition hover:translate-x-1 hover:text-[#229ebd]">Partnership</a></li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
                &copy; 2025 Dozzie Capsule Hotel. All rights reserved
            </div>
        </div>
    </footer>
    `;

    // Bắn Footer vào thẻ có id="app-footer"
    const footerPlaceholder = document.getElementById('app-footer');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    }
}

renderNavbar();
renderFooter();
