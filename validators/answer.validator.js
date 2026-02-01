const UnauthorizedError = require("../errors/UnauthorizedError");
const { USER_ROLES } = require("../config/constants");

class SurveyPolicy {
  ensureIsCreator(survey, userId) {
    if (survey.creator_id !== userId) {
      throw new UnauthorizedError("Only the creator can perform this action.");
    }
  }

  ensureHasAccess(survey, userId) {
    if (survey.creator_id === userId) return;

    const hasAccess = survey.access_users.some((u) => u.user_id === userId);

    if (!hasAccess) {
      throw new UnauthorizedError("No access to this survey.");
    }
  }

  ensureCanView(survey, user) {
    if (user.role === USER_ROLES.ADMIN) return;

    this.ensureHasAccess(survey, user.id);
  }

  ensureCanShareTo(users) {
    if (users.some((u) => u.role !== USER_ROLES.ADMIN)) {
      throw new UnauthorizedError("Can only share surveys with ADMIN users.");
    }
  }

  canListAll(user) {
    return user.role === USER_ROLES.ADMIN;
  }
}

module.exports = SurveyPolicy;
