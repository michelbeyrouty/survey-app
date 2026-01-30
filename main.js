const express = require("express");
const DB = require("./services/db");
const SurveyService = require("./services/survey.service");
const UserService = require("./services/user.service");
const SurveyController = require("./controllers/survey.controller");
const errorHandlerMiddleware = require("./middlewares/errorHandler");
const asyncHandler = require("./middlewares/asyncHandler");
const { requireAnyRole, requireAdmin } = require("./middlewares/auth");

function createApp() {
  const app = express();
  app.use(express.json());

  const db = new DB();
  const surveyService = new SurveyService(db);
  const userService = new UserService(db);
  const surveyController = new SurveyController(surveyService, userService);

  app.get("/health", (req, res) => {
    res.send("Hello World!");
  });

  app.get("/surveys", requireAnyRole(), asyncHandler(surveyController.list));
  app.get("/surveys/:id", requireAnyRole(), asyncHandler(surveyController.getById));
  app.post("/surveys/:id/share", requireAnyRole(), asyncHandler(surveyController.share));
  app.post("/surveys", requireAdmin(), asyncHandler(surveyController.create));

  app.use(errorHandlerMiddleware);

  return app;
}

module.exports = createApp;
