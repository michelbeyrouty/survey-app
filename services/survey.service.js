const { SURVEY_QUERIES } = require("./queries");

class SurveyService {
  constructor(db) {
    this.db = db;
  }

  async listForUser(userId) {
    const rows = await this.db.query(SURVEY_QUERIES.LIST_SURVEYS_FOR_USER, [userId]);

    return rows.map((row) => ({
      ...row,
      access_users: JSON.parse(row.access_users),
      questions: JSON.parse(row.questions),
    }));
  }

  async list() {
    const rows = await this.db.query(SURVEY_QUERIES.LIST_SURVEYS, []);

    return rows.map((row) => ({
      ...row,
      questions: JSON.parse(row.questions),
    }));
  }

  async create(userId, title, questions) {
    await this.db.run("BEGIN");

    try {
      await this.db.run(SURVEY_QUERIES.CREATE_SURVEY, [title, userId]);

      const [{ id: surveyId }] = await this.db.query("SELECT last_insert_rowid() AS id");
      await this.db.run(SURVEY_QUERIES.GRANT_SURVEY_ACCESS, [surveyId, userId]);

      for (const q of questions) {
        await this.db.run(SURVEY_QUERIES.CREATE_QUESTION, [surveyId, q.text, q.type, q.rating_min || null, q.rating_max || null]);
      }

      await this.db.run("COMMIT");
    } catch (err) {
      await this.db.run("ROLLBACK");
      throw err;
    }
  }
}

module.exports = SurveyService;
