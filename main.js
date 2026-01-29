const express = require("express");
const DB = require("./services/db");
const SurveyService = require("./services/survey.service");
const SurveyController = require("./controllers/survey.controller");
const errorHandlerMiddleware = require("./middlewares/errorHandler");
const { requireAnyRole } = require("./middlewares/auth");

function createApp() {
  const app = express();
  app.use(express.json());

  const db = new DB();
  const surveyService = new SurveyService(db);
  const surveyController = new SurveyController(surveyService);

  app.get("/health", (req, res) => {
    res.send("Hello World!");
  });

  app.get("/surveys", requireAnyRole(), surveyController.list);

  app.use(errorHandlerMiddleware);

  return app;
}

module.exports = createApp;
