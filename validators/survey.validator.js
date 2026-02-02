const BadRequestError = require("../errors/BadRequestError");

class SurveyValidator {
  validateCreate({ title }) {
    this.validateTitle(title);
  }

  validateTitle(title) {
    if (!title || typeof title !== "string" || !title.trim()) {
      throw new BadRequestError("Title must be a non-empty string.");
    }
  }

  validateSharePayload({ userIds }) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestError("userIds must be a non-empty array.");
    }

    if (userIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new BadRequestError("userIds must be positive integers.");
    }
  }
}

module.exports = SurveyValidator;
