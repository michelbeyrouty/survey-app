const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const { USER_ROLES } = require("../config/constants");

const QUESTION_TYPES = ["TEXT", "MULTIPLE_CHOICE", "RATING", "BOOLEAN"];

class SurveyController {
  constructor(surveyService, userService) {
    this.surveyService = surveyService;
    this.userService = userService;

    this.share = this.share.bind(this);
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
  }

  async getById(req, res) {
    const surveyId = req.params.id;

    const survey = await this.surveyService.getById(surveyId);

    return res.json({
      success: true,
      survey,
    });
  }

  async share(req, res) {
    const surveyId = req.params.id;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestError("userIds must be a non-empty array.");
    }

    const survey = await this.surveyService.getById(surveyId);

    if (!survey) {
      throw new NotFoundError(`Survey with id ${surveyId} does not exist.`);
    }

    const users = await this.userService.getUsersByIds(userIds);

    if (users.length !== userIds.length) {
      throw new BadRequestError("One or more userIds are invalid.");
    }

    if (users.some((user) => user.role !== USER_ROLES.ADMIN)) {
      throw new BadRequestError("You can only share surveys with ADMIN users.");
    }

    await this.surveyService.shareAccess(surveyId, userIds);

    return res.json({
      success: true,
      message: "Survey access shared successfully.",
    });
  }

  async list(req, res) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let surveys = await this.surveyService.list();

    if (userRole === USER_ROLES.ADMIN) {
      surveys = await this.surveyService.listForUser(userId);
    }

    return res.json({
      success: true,
      surveys,
    });
  }

  async create(req, res) {
    const userId = req.user?.id;
    const { title, questions } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      throw new BadRequestError("Title must be a non-empty string.");
    }

    this.validateQuestions(questions);

    await this.surveyService.create(userId, title, questions);

    return res.json({
      success: true,
      message: "Survey created successfully.",
    });
  }

  validateQuestions(questions = []) {
    if (!questions) {
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestError("Questions must be a non-empty array.");
    }

    questions.forEach((q, index) => {
      if (!q.text || typeof q.text !== "string" || q.text.trim() === "") {
        throw new BadRequestError(`Question ${index + 1}: 'text' must be a non-empty string.`);
      }

      if (!q.type || !QUESTION_TYPES.includes(q.type)) {
        throw new BadRequestError(`Question ${index + 1}: 'type' must be one of: ${QUESTION_TYPES.join(", ")}.`);
      }

      if (q.type === "RATING") {
        if (typeof q.rating_min !== "number" || typeof q.rating_max !== "number") {
          throw new BadRequestError(`Question ${index + 1}: RATING type requires 'rating_min' and 'rating_max' as numbers.`);
        }
        if (q.rating_min >= q.rating_max) {
          throw new BadRequestError(`Question ${index + 1}: 'rating_min' must be less than 'rating_max'.`);
        }
      } else {
        if (q.rating_min !== undefined || q.rating_max !== undefined) {
          throw new BadRequestError(`Question ${index + 1}: '${q.type}' type should not have 'rating_min' or 'rating_max'.`);
        }
      }
    });
  }
}

module.exports = SurveyController;
