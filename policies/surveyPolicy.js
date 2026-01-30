const UnauthorizedError = require("../errors/UnauthorizedError");
const { USER_ROLES } = require("../config/constants");

class SurveyPolicy {
  ensureIsCreator(survey, userId) {
    if (survey.creator_id !== userId) {
      throw new UnauthorizedError("Only the creator of the survey can perform this action.");
    }
  }

  ensureCanShare(users) {
    if (users.some((u) => u.role !== USER_ROLES.ADMIN)) {
      throw new UnauthorizedError("You can only share surveys with ADMIN users.");
    }
  }

  ensureCanView(survey, user) {
    if (user.role !== USER_ROLES.ADMIN) return;

    const hasAccess = survey.creator_id === user.id || survey.access_users.some((u) => u.user_id === user.id);

    if (!hasAccess) {
      throw new UnauthorizedError("You do not have access to this survey.");
    }
  }

  canListAll(user) {
    if (user.role !== USER_ROLES.ADMIN) {
      throw new UnauthorizedError("Only ADMIN users can list all surveys.");
    }
  }
}

module.exports = SurveyPolicy;
