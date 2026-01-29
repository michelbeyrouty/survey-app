const AppError = require("../errors/AppError");

class SurveyService {
  constructor(db) {
    this.db = db;
  }

  async list() {
    const rows = await this.db.query(`
      SELECT
        s.id,
        s.title,
        s.creator_id,
        s.created_at,
        u.name AS creator_name,

        -- Access users
        COALESCE((
          SELECT json_group_array(
            json_object(
              'user_id', sa.user_id,
              'user_name', au.name
            )
          )
          FROM survey_access sa
          JOIN users au ON sa.user_id = au.id
          WHERE sa.survey_id = s.id
        ), '[]') AS access_users,

        -- Questions
        COALESCE((
          SELECT json_group_array(
            json_object(
              'id', q.id,
              'survey_id', q.survey_id,
              'text', q.text,
              'type', q.type,
              'rating_min', q.rating_min,
              'rating_max', q.rating_max
            )
          )
          FROM questions q
          WHERE q.survey_id = s.id
        ), '[]') AS questions

      FROM surveys s
      LEFT JOIN users u ON s.creator_id = u.id
      ORDER BY s.id;
    `);

    try {
      return rows.map((row) => ({
        ...row,
        access_users: JSON.parse(row.access_users),
        questions: JSON.parse(row.questions),
      }));
    } catch {
      throw new AppError("Failed to parse survey data");
    }
  }
}

module.exports = SurveyService;
