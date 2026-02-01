const { SURVEY_QUERIES } = require("./queries");

class QuestionService {
  constructor(db) {
    this.db = db;
  }

  async addQuestions(surveyId, questions) {
    await this.db.run("BEGIN");

    try {
      for (const q of questions) {
        await this.db.run(SURVEY_QUERIES.CREATE_QUESTION, [surveyId, q.text, q.type, q.rating_min ?? null, q.rating_max ?? null]);
      }
      await this.db.run("COMMIT");
    } catch (e) {
      await this.db.run("ROLLBACK");
      throw e;
    }
  }

  async getBySurveyId(surveyId) {
    return this.db.query(SURVEY_QUERIES.GET_QUESTIONS_BY_SURVEY_ID, [surveyId]);
  }
}

module.exports = QuestionService;
