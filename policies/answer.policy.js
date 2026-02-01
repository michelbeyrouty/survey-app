const BadRequestError = require("../errors/BadRequestError");

class AnswerPolicy {
  validateQuestionsExist(answers, questions) {
    const questionIds = new Set(questions.map((q) => q.id));

    if (answers.some((a) => !questionIds.has(a.question_id))) {
      throw new BadRequestError("One or more question IDs do not exist.");
    }
  }

  validateAnswersMatchQuestions(answers, questions) {
    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.question_id);

      switch (question.type) {
        case "TEXT":
          if (typeof answer.value !== "string") {
            throw new BadRequestError("Expected string answer.");
          }
          break;

        case "RATING":
          if (typeof answer.value !== "number" || answer.value < question.rating_min || answer.value > question.rating_max) {
            throw new BadRequestError("Invalid rating value.");
          }
          break;

        case "BOOLEAN":
          if (typeof answer.value !== "boolean") {
            throw new BadRequestError("Expected boolean answer.");
          }
          break;

        default:
          throw new BadRequestError("Unsupported question type.");
      }
    }
  }
}

module.exports = AnswerPolicy;
