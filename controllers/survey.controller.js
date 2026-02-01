class SurveyController {
  constructor(surveyService, questionService, userService, surveyValidator, surveyPolicy) {
    this.surveyService = surveyService;
    this.questionService = questionService;
    this.userService = userService;
    this.surveyValidator = surveyValidator;
    this.surveyPolicy = surveyPolicy;

    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
    this.share = this.share.bind(this);
  }

  async create(req, res) {
    const userId = req.user.id;
    const { title, questions = [] } = req.body;

    this.surveyValidator.validateTitle(title);

    const surveyId = await this.surveyService.create(userId, title);

    await this.questionService.addQuestions(surveyId, questions);

    const survey = await this.surveyService.getById(surveyId);
    res.json({ success: true, survey });
  }

  async getById(req, res) {
    const survey = await this.surveyService.getById(req.params.surveyId);

    this.surveyPolicy.ensureCanView(survey, req.user);

    res.json({ success: true, survey });
  }

  async list(req, res) {
    const { id, role } = req.user;

    const surveys = this.surveyPolicy.canListAll({ role }) ? await this.surveyService.list() : await this.surveyService.listForUser(id);

    res.json({ success: true, surveys });
  }

  async share(req, res) {
    const surveyId = req.params.surveyId;
    const userId = req.user.id;
    const { userIds } = req.body;

    this.surveyValidator.validateSharePayload(userIds);

    const survey = await this.surveyService.getById(surveyId);
    const users = await this.userService.getUsersByIds(userIds);

    this.surveyPolicy.ensureIsCreator(survey, userId);
    this.surveyPolicy.ensureCanShareTo(users);

    await this.surveyService.shareAccess(surveyId, userIds);
    res.json({ success: true });
  }
}

module.exports = SurveyController;
