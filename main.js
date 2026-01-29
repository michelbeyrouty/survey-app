const express = require("express");
const DB = require("./services/db");
const SurveyService = require("./services/survey.service");
const SurveyController = require("./controllers/survey.controller");
const errorHandlerMiddleware = require("./middlewares/errorHandler");

function createApp() {
  const app = express();
  app.use(express.json());

  const db = new DB();
  const surveyService = new SurveyService(db);
  const surveyController = new SurveyController(surveyService);

  app.get("/surveys", surveyController.list);

  app.get("/health", (req, res) => {
    res.send("Hello World!");
  });

  app.use(errorHandlerMiddleware);

  return app;
}

module.exports = createApp;
