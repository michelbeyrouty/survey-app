const BadRequestError = require("../errors/BadRequestError");
const { USER_ROLES } = require("../config/constants");

class SurveyController {
  constructor(surveyService) {
    this.surveyService = surveyService;

    this.list = this.list.bind(this);
  }

  async list(req, res) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let surveys = await this.surveyService.list();

    if (userRole === USER_ROLES.ADMIN) {
      surveys = await this.surveyService.listForUser(userId);
    }

    return res.json({
      success: true,
      surveys,
    });
  }
}

module.exports = SurveyController;
