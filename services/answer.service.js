const { SURVEY_QUERIES } = require("./queries");

class AnswerService {
  constructor(db) {
    this.db = db;
  }

  async addAnswers(userId, answers) {
    await this.db.run("BEGIN");

    try {
      for (const a of answers) {
        await this.db.run(SURVEY_QUERIES.CREATE_ANSWER, [a.question_id, userId, String(a.value)]);
      }
      await this.db.run("COMMIT");
    } catch (e) {
      await this.db.run("ROLLBACK");
      throw e;
    }
  }

  async getBySurveyAndUser(surveyId, userId) {
    return this.db.query(SURVEY_QUERIES.GET_ANSWERS_BY_SURVEY_ID_AND_USER_ID, [surveyId, userId]);
  }

  async getAllByUserId(userId) {
    return this.db.query(SURVEY_QUERIES.GET_ALL_ANSWERS_BY_USER_ID, [userId]);
  }

  async getAggregatedResults(surveyId) {
    return this.db.query(SURVEY_QUERIES.GET_AGGREGATED_SURVEY_STATS, [surveyId]);
  }
}

module.exports = AnswerService;
