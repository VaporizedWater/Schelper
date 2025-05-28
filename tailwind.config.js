module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                psublue: 'var(--color-psublue)',
                outlookblue: 'var(--color-outlookblue)',
                newblue: 'var(--color-newblue)',
                lightblack: 'var(--color-lightblack)',
                grayblue: 'var(--color-grayblue)',
                graybg: 'var(--color-graybg)',
                lightblue: 'var(--color-lightblue)',
                lightblue2: 'var(--color-lightblue2)',
                dark: 'var(--color-dark)',
            }
        },
    },
    plugins: [],
};
