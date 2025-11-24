// client/tailwind.config.js

export default {
  content: [
    "./index.html",
    "./**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Artusi thay bằng Prata
        artusi: ['Prata', 'serif'], 
        
        // Bogart thay bằng Fraunces
        bogart: ['Fraunces', 'serif'], 
        
        // (Optional) Thêm font mặc định cho body nếu muốn dễ đọc hơn
        sans: ['Nunito', 'sans-serif'], 
      },
      colors: {
        'dozzie-blue': '#219EBC',
        'dozzie-navy': '#18233B',
      }
    },
  },
  plugins: [],
}