const BadRequestError = require("../errors/BadRequestError");

class SurveyValidator {
  static QUESTION_TYPES = ["TEXT", "MULTIPLE_CHOICE", "RATING", "BOOLEAN"];

  validateSurvey(survey) {
    if (!survey) {
      throw new BadRequestError("Survey data is required.");
    }

    const { title, questions } = survey;

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
      if (!q.text || typeof q.text !== "string" || !q.text.trim()) {
        throw new BadRequestError(`Question ${index + 1}: 'text' must be a non-empty string.`);
      }

      if (!q.type || !this.QUESTION_TYPES.includes(q.type)) {
        throw new BadRequestError(`Question ${index + 1}: 'type' must be one of: ${this.QUESTION_TYPES.join(", ")}.`);
      }

      if (q.type === "RATING") {
        if (typeof q.rating_min !== "number" || typeof q.rating_max !== "number") {
          throw new BadRequestError(`Question ${index + 1}: RATING type requires 'rating_min' and 'rating_max'.`);
        }

        if (q.rating_min >= q.rating_max) {
          throw new BadRequestError(`Question ${index + 1}: 'rating_min' must be less than 'rating_max'.`);
        }
      }

      if (q.rating_min !== undefined || q.rating_max !== undefined) {
        throw new BadRequestError(`Question ${index + 1}: '${q.type}' should not have rating_min/max.`);
      }
    });
  }

  validateResponses(responses) {
    if (!Array.isArray(responses) || responses.length === 0) {
      throw new BadRequestError("Responses must be a non-empty array.");
    }
  }

  validateResponsesMatchQuestions(responses, questions) {
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
  }

  validateQuestionsExist(responses, questions) {
    const questionIds = new Set(questions.map((q) => q.id));

    if (responses.some((r) => !questionIds.has(r.question_id))) {
      throw new BadRequestError(`One or more question IDs do not exist in survey ${surveyId}.`);
    }
  }
}

module.exports = SurveyValidator;
