class AnswerController {
  constructor(answerService, surveyService, answerValidator, answerPolicy) {
    this.answerService = answerService;
    this.surveyService = surveyService;
    this.answerValidator = answerValidator;
    this.answerPolicy = answerPolicy;

    this.submit = this.submit.bind(this);
    this.getForUser = this.getForUser.bind(this);
    this.getAllUserAnswers = this.getAllUserAnswers.bind(this);
    this.getUserAnswersByAdmin = this.getUserAnswersByAdmin.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  async submit(req, res) {
    const { answers } = req.body;

    this.answerValidator.validateSubmit(req.body);

    const survey = await this.surveyService.getById(req.params.surveyId);

    this.answerPolicy.validateQuestionsExist(answers, survey.questions);
    this.answerPolicy.validateAnswersMatchQuestions(answers, survey.questions);

    await this.answerService.addAnswers(req.user.id, answers);

    res.json({ success: true });
  }

  async getForUser(req, res) {
    const answers = await this.answerService.getBySurveyAndUser(req.params.surveyId, req.user.id);

    res.json({ success: true, answers });
  }

  async getAllUserAnswers(req, res) {
    const answers = await this.answerService.getAllByUserId(req.user.id);

    res.json({ success: true, answers });
  }

  async getUserAnswersByAdmin(req, res) {
    await this.surveyService.getById(req.params.surveyId);

    const answers = await this.answerService.getBySurveyAndUser(req.params.surveyId, req.params.userId);

    res.json({ success: true, answers });
  }

  async getStats(req, res) {
    const results = await this.answerService.getAggregatedResults();

    res.json({ success: true, results });
  }
}

module.exports = AnswerController;
