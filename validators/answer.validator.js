const BadRequestError = require("../errors/BadRequestError");

class AnswerValidator {
  validateSubmit({ answers }) {
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new BadRequestError("Answers must be a non-empty array.");
    }

    answers.forEach((a, index) => {
      if (!Number.isInteger(a.question_id)) {
        throw new BadRequestError(`Answer ${index + 1}: question_id must be an integer.`);
      }

      if (a.value === undefined || a.value === null) {
        throw new BadRequestError(`Answer ${index + 1}: value is required.`);
      }
    });
  }
}

module.exports = AnswerValidator;
