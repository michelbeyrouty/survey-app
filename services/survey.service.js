const AppError = require("../errors/AppError");
const { SURVEY_QUERIES } = require("./queries");

class SurveyService {
  constructor(db) {
    this.db = db;
  }

  async list() {
    const rows = await this.db.query(SURVEY_QUERIES.LIST_SURVEYS);

    return rows.map((row) => ({
      ...row,
      access_users: JSON.parse(row.access_users),
      questions: JSON.parse(row.questions),
    }));
  }
}

module.exports = SurveyService;
