const { SURVEY_QUERIES } = require("./queries");
const NotFoundError = require("../errors/NotFoundError");

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

  async getById(surveyId) {
    const rows = await this.db.query(SURVEY_QUERIES.GET_SURVEY_BY_ID, [surveyId]);

    if (rows.length === 0) {
      throw new NotFoundError(`Survey ${surveyId} not found`);
    }

    return {
      ...rows[0],
      questions: JSON.parse(rows[0].questions),
      access_users: JSON.parse(rows[0].access_users),
    };
  }

  async getQuestionsBySurveyId(surveyId) {
    return this.db.query(SURVEY_QUERIES.GET_QUESTIONS_BY_SURVEY_ID, [surveyId]);
  }

  async shareAccess(surveyId, userIds) {
    await this.db.run("BEGIN");

    await Promise.all(userIds.map((userId) => this.db.run(SURVEY_QUERIES.SHARE_SURVEY_ACCESS, [surveyId, userId])));

    await this.db.run("COMMIT");
  }

  async addQuestions(surveyId, questions) {
    await this.db.run("BEGIN");

    try {
      for (const q of questions) {
        await this.db.run(SURVEY_QUERIES.CREATE_QUESTION, [surveyId, q.text, q.type, q.rating_min || null, q.rating_max || null]);
      }

      await this.db.run("COMMIT");
    } catch (err) {
      await this.db.run("ROLLBACK");
      throw err;
    }
  }

  async addAnswers(userId, answers) {
    await this.db.run("BEGIN");

    try {
      for (const a of answers) {
        await this.db.run(SURVEY_QUERIES.CREATE_ANSWERS, [a.question_id, userId, a.value]);
      }

      await this.db.run("COMMIT");
    } catch (err) {
      await this.db.run("ROLLBACK");
      throw err;
    }
  }

  async getAnswersBySurveyIdAndUserId(surveyId, userId) {
    return await this.db.query(SURVEY_QUERIES.GET_ANSWERS_BY_SURVEY_ID_AND_USER_ID, [surveyId, userId]);
  }

  async getAllAnswersByUserId(userId) {
    return await this.db.query(SURVEY_QUERIES.GET_ALL_ANSWERS_BY_USER_ID, [userId]);
  }

  async getAggregatedResults(surveyId) {
    return await this.db.query(SURVEY_QUERIES.GET_AGGREGATED_SURVEY_STATS, [surveyId]);
  }
}

module.exports = SurveyService;
