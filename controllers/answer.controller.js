class AnswerController {
  constructor(answerService, surveyService, answerValidator, answerPolicy) {
    this.answerService = answerService;
    this.surveyService = surveyService;
    this.answerValidator = answerValidator;
    this.answerPolicy = answerPolicy;

    this.submit = this.submit.bind(this);
    this.getForUser = this.getForUser.bind(this);
    this.getAggregated = this.getAggregated.bind(this);
  }

  async submit(req, res) {
    const { surveyId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body;

    this.answerValidator.validateAnswers(answers);

    const survey = await this.surveyService.getById(surveyId);

    this.answerPolicy.validateQuestionsExist(answers, survey.questions);
    this.answerPolicy.validateAnswersMatchQuestions(answers, survey.questions);

    await this.answerService.addAnswers(userId, answers);
    res.json({ success: true });
  }

  async getForUser(req, res) {
    const answers = await this.answerService.getBySurveyAndUser(req.params.surveyId, req.user.id);

    res.json({ success: true, answers });
  }

  async getAggregated(req, res) {
    const results = await this.answerService.getAggregatedResults(req.params.surveyId);
    res.json({ success: true, results });
  }
}

module.exports = AnswerController;
