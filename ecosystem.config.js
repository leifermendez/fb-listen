module.exports = {
    apps: [
        {
            name: "fb-listen",
            script: "./src/app.js",
            watch: false,
            max_memory_restart: '1000M',
            exec_mode: "cluster",
            instances: 1,
            cron_restart: "*/45 * * * *"

        }
    ]
}