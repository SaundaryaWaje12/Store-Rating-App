/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000ff",   // Purple
        secondary: "#06B6D4", // Cyan
        accent: "#704fbdff",    // Yellow
        danger: "#3a9a7aff",    // Red
        success: "#51597dff",   // Green
        card: "#a0347aff",      // Dark Blue
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(49, 71, 182, 0.6), 0 0 40px rgba(57, 160, 86, 0.4)",
      },
      animation: {
        gradient: "gradientShift 8s ease infinite",
      },
      keyframes: {
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
    },
  },
  plugins: [],
};
