class QuestionController {
  constructor(questionService, surveyService, questionValidator, surveyPolicy) {
    this.questionService = questionService;
    this.surveyService = surveyService;
    this.questionValidator = questionValidator;
    this.surveyPolicy = surveyPolicy;

    this.add = this.add.bind(this);
    this.list = this.list.bind(this);
  }

  async add(req, res) {
    const { surveyId } = req.params;
    const userId = req.user.id;
    const { questions } = req.body;

    this.questionValidator.validateQuestions(questions);

    const survey = await this.surveyService.getById(surveyId);
    this.surveyPolicy.ensureHasAccess(survey, userId);

    await this.questionService.addQuestions(surveyId, questions);
    res.json({ success: true });
  }

  async list(req, res) {
    const questions = await this.questionService.getBySurveyId(req.params.surveyId);
    res.json({ success: true, questions });
  }
}

module.exports = QuestionController;
