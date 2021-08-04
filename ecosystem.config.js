module.exports = {
    apps: [
        {
            name: "fb-messenger",
            script: "./src/app.js",
            watch: false,
            max_memory_restart: '1000M',
            exec_mode: "cluster",
            instances: 1

        }
    ]
}