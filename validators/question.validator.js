const BadRequestError = require("../errors/BadRequestError");

class QuestionValidator {
  static TYPES = ["TEXT", "MULTIPLE_CHOICE", "RATING", "BOOLEAN"];

  validateQuestions(questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestError("Questions must be a non-empty array.");
    }

    questions.forEach((q, index) => this.validateQuestion(q, index));
  }

  validateQuestion(q, index = 0) {
    if (!q.text || typeof q.text !== "string") {
      throw new BadRequestError(`Question ${index + 1}: invalid text.`);
    }

    if (!QuestionValidator.TYPES.includes(q.type)) {
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
  }
}

module.exports = QuestionValidator;
