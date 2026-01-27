const express = require('express');
const SurveyService = require('./services/survey.service');
const SurveyController = require('./controllers/survey.controller');
const errorHandlerMiddleware = require('./middlewares/errorHandler');

function createApp() {
  const app = express();
  app.use(express.json());

  const surveyService = new SurveyService();
  const surveyController = new SurveyController(surveyService);

  app.post('/take', surveyController.take);

  app.get('/health', (req, res) => {
    res.send('Hello World!');
  });

  app.use(errorHandlerMiddleware);

  return app;
}

module.exports = createApp;
