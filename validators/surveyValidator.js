const BadRequestError = require("../errors/BadRequestError");

class SurveyValidator {
  static QUESTION_TYPES = ["TEXT", "MULTIPLE_CHOICE", "RATING", "BOOLEAN"];

  validateSurvey({ title, questions }) {
    this.validateTitle(title);
    this.validateQuestions(questions);
  }

  validateTitle(title) {
    if (!title || typeof title !== "string" || !title.trim()) {
      throw new BadRequestError("Title must be a non-empty string.");
    }
  }

  validateQuestions(questions = []) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestError("Questions must be a non-empty array.");
    }

    questions.forEach((q, index) => {
      if (!q.text || typeof q.text !== "string") {
        throw new BadRequestError(`Question ${index + 1}: invalid text.`);
      }

      if (!SurveyValidator.QUESTION_TYPES.includes(q.type)) {
        throw new BadRequestError(`Question ${index + 1}: invalid type.`);
      }

      if (q.type === "RATING") {
        if (typeof q.rating_min !== "number" || typeof q.rating_max !== "number") {
          throw new BadRequestError(`Question ${index + 1}: RATING requires rating_min and rating_max.`);
        }
        if (q.rating_min >= q.rating_max) {
          throw new BadRequestError(`Question ${index + 1}: rating_min must be < rating_max.`);
        }
      } else if (q.rating_min !== undefined || q.rating_max !== undefined) {
        throw new BadRequestError(`Question ${index + 1}: rating_min/max only allowed for RATING.`);
      }
    });
  }

  validateSharePayload(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestError("userIds must be a non-empty array of positive integers.");
    }
  }

  validateAnswers(answers) {
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new BadRequestError("Answers must be a non-empty array.");
    }
  }
}

module.exports = SurveyValidator;
