module.exports = {
    apps: [
        {
            name: "Schelper",
            script: "pnpm",
            args: "start",
            interpreter: "none",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
