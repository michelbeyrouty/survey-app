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

    if (userRole === USER_ROLES.ADMIN) {
      surveys = await this.surveyService.listForUser(userId);
    } else {
      surveys = await this.surveyService.list();
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

    const survey = await this.surveyService.getById(surveyId);
    const users = await this.userService.getUsersByIds(userIds);

    if (!survey) {
      throw new NotFoundError(`Survey with id ${surveyId} does not exist.`);
    }

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
    // const userId = req.user?.id;
    const surveyId = req.params.surveyId;
    const { responses } = req.body;

    if (!Array.isArray(responses) || responses.length === 0) {
      throw new BadRequestError("Responses must be a non-empty array.");
    }

    const questions = await this.surveyService.getQuestionsBySurveyId(surveyId);
    const questionIds = new Set(questions.map((q) => q.id));

    if (responses.find((r) => !questionIds.has(r.question_id))) {
      throw new BadRequestError(`One or more question IDs do not exist in survey ${surveyId}.`);
    }

    // Validate that the value of the response matches the question type
    for (const resp of responses) {
      const question = questions.find((q) => q.id === resp.question_id);

      switch (question.type) {
        case "TEXT":
          if (typeof resp.value !== "string") {
            throw new BadRequestError(`Response for question ${question.id} must be a string.`);
          }
          break;
        case "RATING":
          if (typeof resp.value !== "number" || resp.value < question.rating_min || resp.value > question.rating_max) {
            throw new BadRequestError(`Response for question ${question.id} must be a number between ${question.rating_min} and ${question.rating_max}.`);
          }
          break;
        case "BOOLEAN":
          if (typeof resp.value !== "boolean") {
            throw new BadRequestError(`Response for question ${question.id} must be a boolean.`);
          }
          break;
        default:
          throw new BadRequestError(`Unknown question type for question ${question.id}.`);
      }
    }

    console.log("Questions for survey:", questions);

    return res.json({
      success: true,
      message: "Response added successfully.",
    });
  }
}

module.exports = SurveyController;
