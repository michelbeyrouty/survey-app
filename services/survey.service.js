const { SURVEY_QUERIES } = require("./queries");
const NotFoundError = require("../errors/NotFoundError");

class SurveyService {
  constructor(db) {
    this.db = db;
  }

  async create(userId, title) {
    await this.db.run("BEGIN");

    try {
      await this.db.run(SURVEY_QUERIES.CREATE_SURVEY, [title, userId]);

      const [{ id }] = await this.db.query("SELECT last_insert_rowid() AS id");

      await this.db.run(SURVEY_QUERIES.GRANT_SURVEY_ACCESS, [id, userId]);

      await this.db.run("COMMIT");

      return id;
    } catch (err) {
      await this.db.run("ROLLBACK");
      throw err;
    }
  }

  async getById(surveyId, userId) {
    const rows = await this.db.query(SURVEY_QUERIES.GET_SURVEY_BY_ID, [surveyId, userId, userId]);

    if (!rows.length) {
      throw new NotFoundError(`Survey ${surveyId} not found`);
    }

    return {
      ...rows[0],
      questions: JSON.parse(rows[0].questions),
      access_users: JSON.parse(rows[0].access_users),
    };
  }

  async list() {
    const rows = await this.db.query(SURVEY_QUERIES.LIST_SURVEYS);

    return rows.map((r) => ({
      ...r,
      questions: JSON.parse(r.questions),
    }));
  }

  async listForUser(userId) {
    const rows = await this.db.query(SURVEY_QUERIES.LIST_SURVEYS_FOR_USER, [userId, userId]);

    return rows.map((r) => ({
      ...r,
      questions: JSON.parse(r.questions),
      access_users: JSON.parse(r.access_users),
    }));
  }

  async shareAccess(surveyId, userIds) {
    await this.db.run("BEGIN");

    try {
      for (const userId of userIds) {
        await this.db.run(SURVEY_QUERIES.SHARE_SURVEY_ACCESS, [surveyId, userId]);
      }
      await this.db.run("COMMIT");
    } catch (e) {
      await this.db.run("ROLLBACK");
      throw e;
    }
  }
}

module.exports = SurveyService;
