// PM2 keeps the Civic Wise API running: it restarts it if it crashes and
// starts it again when the server reboots (after `pm2 startup` and `pm2 save`).
//
//   pm2 start deploy/pm2/ecosystem.config.cjs     first time
//   pm2 reload civicwise-api                       after a deploy (no downtime)
//   pm2 logs civicwise-api                         live log
//   pm2 status                                     is it up?
module.exports = {
  apps: [
    {
      name: "civicwise-api",
      cwd: "/var/www/civicwise/app/server",
      script: "dist/index.js",
      // Load server/.env, the same way `npm start` does.
      node_args: "--env-file=.env",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      restart_delay: 3000,
      time: true,
      env: { NODE_ENV: "production" },
    },
  ],
};
