module.exports = {
  apps: [
    {
      name: "gali-web-app-api",
      script: "./server.js",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
