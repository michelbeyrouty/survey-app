const BadRequestError = require("../errors/BadRequestError");

class SurveyController {
  constructor(surveyService) {
    this.surveyService = surveyService;

    this.list = this.list.bind(this);
  }

  async list(req, res) {
    const surveys = await this.surveyService.list();

    return res.json({
      success: true,
      surveys,
    });
  }
}

module.exports = SurveyController;
