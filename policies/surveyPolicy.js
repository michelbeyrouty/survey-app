const UnauthorizedError = require("../errors/UnauthorizedError");
const { USER_ROLES } = require("../config/constants");

class SurveyPolicy {
  ensureIsCreator(survey, userId) {
    if (survey.creator_id != userId) {
      throw new UnauthorizedError("Only the creator can perform this action.");
    }
  }

  ensureCanShareTo(users) {
    if (users.some((u) => u.role !== USER_ROLES.ADMIN)) {
      throw new UnauthorizedError("Can only share with ADMIN users.");
    }
  }

  ensureCanView(survey, user) {
    if (user.role === USER_ROLES.ADMIN) return;

    const hasAccess = survey.creator_id === user.id || survey.access_users.some((u) => u.user_id === user.id);

    if (!hasAccess) {
      throw new UnauthorizedError("No access to this survey.");
    }
  }

  canListAll(user) {
    return user.role !== USER_ROLES.ADMIN;
  }
}

module.exports = SurveyPolicy;
