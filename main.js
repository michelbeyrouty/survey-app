const express = require("express");
const DB = require("./services/db");
const SurveyService = require("./services/survey.service");
const UserService = require("./services/user.service");
const SurveyController = require("./controllers/survey.controller");
const HealthController = require("./controllers/health.controller");
const SurveyValidator = require("./validators/surveyValidator");
const SurveyPolicy = require("./policies/surveyPolicy");
const errorHandlerMiddleware = require("./middlewares/errorHandler");
const asyncHandler = require("./middlewares/asyncHandler");
const { requireAnyRole, requireAdmin, requireAnswerer } = require("./middlewares/auth");

function createApp() {
  const app = express();
  app.use(express.json());

  const db = new DB();
  const surveyService = new SurveyService(db);
  const userService = new UserService(db);
  const surveyValidator = new SurveyValidator();
  const surveyPolicy = new SurveyPolicy();
  const surveyController = new SurveyController(surveyService, userService, surveyValidator, surveyPolicy);
  const healthController = new HealthController();

  app.get("/health", asyncHandler(healthController.check));

  app.get("/surveys", requireAnyRole(), asyncHandler(surveyController.list));
  app.post("/surveys", requireAdmin(), asyncHandler(surveyController.create));
  app.post("/surveys/:surveyId/questions", requireAdmin(), asyncHandler(surveyController.addQuestion));
  app.post("/surveys/:surveyId/answers", requireAnswerer(), asyncHandler(surveyController.addAnswers));
  app.get("/surveys/:surveyId/answers", requireAnswerer(), asyncHandler(surveyController.getUserAnswers));
  app.get("/surveys/answers", requireAnswerer(), asyncHandler(surveyController.getAllUserAnswers));
  app.get("/surveys/:surveyId", requireAnyRole(), asyncHandler(surveyController.getById));
  app.get("/surveys/:surveyId/stats", requireAdmin(), asyncHandler(surveyController.getAggregatedResults));
  app.post("/surveys/:surveyId/share", requireAdmin(), asyncHandler(surveyController.share));

  app.get("/users/:userId/surveys/:surveyId/answers", requireAdmin(), asyncHandler(surveyController.getUserAnswersByAdmin));

  app.use(errorHandlerMiddleware);

  return app;
}

module.exports = createApp;
