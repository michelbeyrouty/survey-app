const BadRequestError = require("../errors/BadRequestError");
const { USER_ROLES } = require("../config/constants");

const QUESTION_TYPES = ["TEXT", "MULTIPLE_CHOICE", "RATING", "BOOLEAN"];

class SurveyController {
  constructor(surveyService) {
    this.surveyService = surveyService;

    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
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
