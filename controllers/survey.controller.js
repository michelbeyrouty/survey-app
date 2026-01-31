class SurveyController {
  constructor(surveyService, userService, surveyValidator, surveyPolicy) {
    this.surveyService = surveyService;
    this.userService = userService;
    this.surveyValidator = surveyValidator;
    this.surveyPolicy = surveyPolicy;

    this.share = this.share.bind(this);
    this.getById = this.getById.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.addAnswers = this.addAnswers.bind(this);
    this.getUserAnswers = this.getUserAnswers.bind(this);
    this.getAllUserAnswers = this.getAllUserAnswers.bind(this);
  }

  async create(req, res) {
    const userId = req.user.id;
    const survey = req.body;

    this.surveyValidator.validateSurvey(survey);
    await this.surveyService.create(userId, survey.title, survey.questions);

    res.json({ success: true, message: "Survey created successfully." });
  }

  async getById(req, res) {
    const survey = await this.surveyService.getById(req.params.surveyId);
    res.json({ success: true, survey });
  }

  async list(req, res) {
    const { id: userId, role } = req.user;

    const surveys = this.surveyPolicy.canListAll({ role }) ? await this.surveyService.list() : await this.surveyService.listForUser(userId);

    res.json({ success: true, surveys });
  }

  async share(req, res) {
    const surveyId = req.params.surveyId;
    const { id: userId } = req.user;

    const { userIds } = req.body;

    this.surveyValidator.validateSharePayload(userIds);

    const survey = await this.surveyService.getById(surveyId);
    const users = await this.userService.getUsersByIds(userIds);

    this.surveyPolicy.ensureCanShareTo(users);
    this.surveyPolicy.ensureIsCreator(survey, userId);

    await this.surveyService.shareAccess(surveyId, userIds);

    res.json({ success: true, message: "Survey access shared successfully." });
  }

  async addQuestion(req, res) {
    const userId = req.user.id;
    const surveyId = req.params.surveyId;
    const { questions } = req.body;

    this.surveyValidator.validateQuestions(questions);

    const survey = await this.surveyService.getById(surveyId);
    this.surveyPolicy.ensureIsCreator(survey, userId);

    await this.surveyService.addQuestions(surveyId, questions);

    res.json({ success: true, message: "Questions added successfully." });
  }

  async addAnswers(req, res) {
    const surveyId = req.params.surveyId;
    const userId = req.user.id;
    const { answers } = req.body;

    this.surveyValidator.validateAnswers(answers);

    const survey = await this.surveyService.getById(surveyId);

    this.surveyPolicy.validateQuestionsExist(answers, survey.questions);
    this.surveyPolicy.validateAnswersMatchQuestions(answers, survey.questions);

    await this.surveyService.addAnswers(userId, answers);

    res.json({ success: true, message: "Answers added successfully." });
  }

  async getUserAnswers(req, res) {
    const surveyId = req.params.surveyId;
    const userId = req.user.id;

    const answers = await this.surveyService.getAnswersBySurveyIdAndUserId(surveyId, userId);

    res.json({ success: true, answers });
  }

  async getAllUserAnswers(req, res) {
    const userId = req.user.id;

    const answers = await this.surveyService.getAllAnswersByUserId(userId);
    res.json({ success: true, answers });
  }
}

module.exports = SurveyController;
