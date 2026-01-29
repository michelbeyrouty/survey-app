const createApp = require("./main");
const Database = require("./services/db");
const { SERVER_CONFIG } = require("./config/constants");

async function startServer() {
  const db = new Database();

  try {
    await db.init();

    const app = createApp({ db });

    app.listen(SERVER_CONFIG.PORT, () => {
      console.log(
        `🚀 Server running: http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}/`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
