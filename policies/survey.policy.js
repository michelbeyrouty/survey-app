const UnauthorizedError = require("../errors/UnauthorizedError");
const BadRequestError = require("../errors/BadRequestError");
const { USER_ROLES } = require("../config/constants");

class SurveyPolicy {
  ensureCanView(survey, user) {
    const hasAccess = survey.creator_id == user.id || survey.access_users.some((u) => u.user_id == user.id);

    if (user.role === USER_ROLES.ADMIN && !hasAccess) {
      throw new UnauthorizedError("No access to this survey.");
    }
  }

  ensureIsCreator(survey, userId) {
    if (survey.creator_id != userId) {
      throw new UnauthorizedError("Only the creator can perform this action.");
    }
  }

  ensureHasAccess(survey, userId) {
    if (survey.creator_id == userId) return;

    const hasAccess = survey.access_users.some((u) => u.user_id === userId);
    if (!hasAccess) {
      throw new UnauthorizedError("No access to this survey.");
    }
  }

  ensureCanShareTo(users) {
    if (users.some((u) => u.role !== USER_ROLES.ADMIN)) {
      throw new UnauthorizedError("Can only share with ADMIN users.");
    }
  }

  canListAll(user) {
    return user.role !== USER_ROLES.ADMIN;
  }

  validateQuestionsExist(answers, questions) {
    const ids = new Set(questions.map((q) => q.id));
    if (answers.some((r) => !ids.has(r.question_id))) {
      throw new BadRequestError("One or more question IDs do not exist.");
    }
  }

  validateAnswersMatchQuestions(answers, questions) {
    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.question_id);

      switch (question.type) {
        case "TEXT":
          if (typeof answer.value !== "string") throw new BadRequestError("Expected string answer.");
          break;
        case "RATING":
          if (typeof answer.value !== "number" || answer.value < question.rating_min || answer.value > question.rating_max) {
            throw new BadRequestError("Invalid rating value.");
          }
          break;
        case "BOOLEAN":
          if (typeof answer.value !== "boolean") throw new BadRequestError("Expected boolean answer.");
          break;
      }
    }
  }
}

module.exports = SurveyPolicy;
