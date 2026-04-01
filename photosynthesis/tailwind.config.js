/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: "var(--body-font-family)",
        heading: "var(--heading-font-family)",
        "small-bold-detail": "var(--small-bold-detail-font-family)",
        "sub-heading": "var(--sub-heading-font-family)",
        subtitle: "var(--subtitle-font-family)",
        title: "var(--title-font-family)",
      },
    },
  },
  plugins: [],
};
