const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");

let server;

server = app.listen(config.port, () => {
  logger.info(`🟢 Listening to port ${config.port}`);
});

process.on("unhandledRejection", (error) => {
  logger.info("🔴 UNHANDLED REJECTION!");
  logger.info(error);
  if (server) {
    server.close(() => {
      logger.info("⚠️ Server Closed!");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  logger.info("🔴 SIGTERM RECEIVED!");
  if (server) {
    server.close(() => {
      logger.info("⚠️ Server Closed!");
    });
  }
});
