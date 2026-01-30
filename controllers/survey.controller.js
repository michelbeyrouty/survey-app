const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const { USER_ROLES } = require("../config/constants");

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
    this.addResponse = this.addResponse.bind(this);
  }

  async create(req, res) {
    const userId = req.user?.id;
    const survey = req.body;

    this.surveyValidator.validateSurvey(survey);

    await this.surveyService.create(userId, survey.title, survey.questions);
    return res.json({
      success: true,
      message: "Survey created successfully.",
    });
  }

  async getById(req, res) {
    const surveyId = req.params.surveyId;

    const survey = await this.surveyService.getById(surveyId);

    return res.json({
      success: true,
      survey,
    });
  }

  async list(req, res) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let surveys = {};

    if (this.surveyPolicy.canListAll({ role: userRole })) {
      surveys = await this.surveyService.list();
    } else {
      surveys = await this.surveyService.listForUser(userId);
    }

    return res.json({
      success: true,
      surveys,
    });
  }

  async share(req, res) {
    const surveyId = req.params.surveyId;
    const { userIds } = req.body;

    this.surveyValidator.validateSharePayload(userIds);

    await this.surveyService.getById(surveyId);
    const users = await this.userService.getUsersByIds(userIds);

    this.surveyPolicy.ensureCanShare(users);

    await this.surveyService.shareAccess(surveyId, userIds);

    res.json({
      success: true,
      message: "Survey access shared successfully.",
    });
  }

  async addQuestion(req, res) {
    const userId = req.user?.id;
    const surveyId = req.params.surveyId;
    const { questions } = req.body;

    this.surveyValidator.validateQuestions(questions);

    const survey = await this.surveyService.getById(surveyId);

    this.surveyPolicy.ensureIsCreator(survey, userId);

    await this.surveyService.addQuestions(surveyId, questions);

    return res.json({
      success: true,
      message: "Questions added successfully.",
    });
  }

  async addResponse(req, res) {
    const surveyId = req.params.surveyId;
    const { responses } = req.body;

    this.surveyValidator.validateResponses(responses);

    const survey = await this.surveyService.getById(surveyId);

    this.surveyValidator.validateQuestionsExist(responses, survey.questions);
    this.surveyValidator.validateResponsesMatchQuestions(responses, survey.questions);

    console.log("Questions for survey:", survey.questions);

    return res.json({
      success: true,
      message: "Response added successfully.",
    });
  }
}

module.exports = SurveyController;
