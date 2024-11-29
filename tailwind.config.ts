import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                psublue: "#001e44",
                outlookblue: "#1e407C",
                newblue: "#5d9bd8",
                lightblack: "1f1f1f",
                grayblue: "#ecf2fc",
                graybg: "#f8fafa",
                lightblue: "#c2e7ff",
            },
        },
    },
    plugins: [
        function ({ addUtilities }: any) {
            const newUtilities = {
                ".scrollbar-thin": {
                    scrollbarWidth: "thin",
                    scrollbarColor: "#e5e7eB white",
                },
            };

            addUtilities(newUtilities, ["responsive", "hover"]);
        },
    ],
};
export default config;
