/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./mobile-app/**/*.{js,ts,jsx,tsx}"
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    theme: {
        extend: {
            fontFamily: {
                'heading': ['"Baloo 2"', 'cursive'],
                'body': ['"Comic Neue"', 'cursive'],
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}
