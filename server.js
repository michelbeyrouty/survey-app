const createApp = require("./main");
const Database = require("./services/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  const db = new Database();

  try {
    await db.init();

    const app = createApp({ db });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
      console.log(`📋 Surveys: http://localhost:${PORT}/surveys`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
