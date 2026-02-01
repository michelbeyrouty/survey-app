const express = require("express");
const DB = require("./services/db");
const SurveyService = require("./services/survey.service");
const QuestionService = require("./services/question.service");
const AnswerService = require("./services/answer.service");
const UserService = require("./services/user.service");
const SurveyController = require("./controllers/survey.controller");
const QuestionController = require("./controllers/question.controller");
const AnswerController = require("./controllers/answer.controller");
const HealthController = require("./controllers/health.controller");
const SurveyValidator = require("./validators/survey.validator");
const QuestionValidator = require("./validators/question.validator");
const AnswerValidator = require("./validators/answer.validator");
const SurveyPolicy = require("./policies/survey.policy");
const AnswerPolicy = require("./policies/answer.policy");
const errorHandlerMiddleware = require("./middlewares/errorHandler");
const asyncHandler = require("./middlewares/asyncHandler");
const { requireAnyRole, requireAdmin, requireAnswerer } = require("./middlewares/auth");

function createApp() {
  const app = express();
  app.use(express.json());

  const db = new DB();

  const surveyService = new SurveyService(db);
  const userService = new UserService(db);
  const questionService = new QuestionService(db);
  const answerService = new AnswerService(db);

  const surveyValidator = new SurveyValidator();
  const questionValidator = new QuestionValidator();
  const answerValidator = new AnswerValidator();

  const surveyPolicy = new SurveyPolicy();
  const answerPolicy = new AnswerPolicy();

  const surveyController = new SurveyController(surveyService, questionService, userService, surveyValidator, surveyPolicy);
  const questionController = new QuestionController(questionService, surveyService, questionValidator, surveyPolicy);
  const answerController = new AnswerController(answerService, surveyService, answerValidator, answerPolicy);
  const healthController = new HealthController();

  app.get("/health", asyncHandler(healthController.check));

  app.get("/surveys", requireAnyRole(), asyncHandler(surveyController.list));
  app.post("/surveys", requireAdmin(), asyncHandler(surveyController.create));
  app.get("/surveys/:surveyId", requireAnyRole(), asyncHandler(surveyController.getById));
  app.post("/surveys/:surveyId/share", requireAdmin(), asyncHandler(surveyController.share));
  app.post("/surveys/:surveyId/questions", requireAdmin(), asyncHandler(questionController.add));

  app.get("/surveys/:surveyId/answers", requireAnswerer(), asyncHandler(answerController.getForUser));
  app.post("/surveys/:surveyId/answers", requireAnswerer(), asyncHandler(answerController.submit));
  // app.get("/surveys/answers", requireAnswerer(), asyncHandler(surveyController.getAllUserAnswers));

  // app.get("/users/:userId/surveys/:surveyId/answers", requireAdmin(), asyncHandler(surveyController.getUserAnswersByAdmin));
  // app.get("/surveys/:surveyId/stats", requireAdmin(), asyncHandler(surveyController.getAggregatedResults));

  app.use(errorHandlerMiddleware);

  return app;
}

module.exports = createApp;
