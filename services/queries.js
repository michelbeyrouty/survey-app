const SURVEY_QUERIES = {
  LIST_SURVEYS: `
                SELECT
                  s.id,
                  s.title,
                  s.creator_id,
                  s.created_at,
                  u.name AS creator_name,

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
                ORDER BY s.id;`,

  LIST_SURVEYS_FOR_USER: `
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

                -- Only include surveys user can access
                WHERE EXISTS (
                  SELECT 1
                  FROM survey_access sa
                  WHERE sa.survey_id = s.id
                    AND sa.user_id = ?
                )
                OR s.creator_id = ?

                ORDER BY s.id;`,

  CREATE_SURVEY: `
                INSERT INTO surveys (title, creator_id)
                VALUES (?, ?);
  `,

  GET_SURVEY_BY_ID: `
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
                JOIN users u ON s.creator_id = u.id
                WHERE s.id = ?
                LIMIT 1;
  `,

  GRANT_SURVEY_ACCESS: `
                INSERT INTO survey_access (survey_id, user_id)
                VALUES (?, ?);
  `,

  SHARE_SURVEY_ACCESS: `
                INSERT OR IGNORE INTO survey_access (survey_id, user_id)
                VALUES (?, ?);
  `,
};

const QUESTION_QUERIES = {
  CREATE_QUESTION: `
                INSERT INTO questions (
                  survey_id,
                  text,
                  type,
                  rating_min,
                  rating_max
                )
                VALUES (?, ?, ?, ?, ?);
  `,

  GET_QUESTIONS_BY_SURVEY_ID: `
                SELECT id, type, rating_min, rating_max
                FROM questions
                WHERE survey_id = ?;
  `,
};

const ANSWER_QUERIES = {
  CREATE_ANSWER: `
                INSERT INTO answers (question_id, user_id, value)
                VALUES (?, ?, ?);
  `,

  GET_ANSWERS_BY_SURVEY_ID_AND_USER_ID: `
                SELECT
                  a.id AS answer_id,
                  q.id AS question_id,
                  q.text,
                  q.type,
                  a.value
                FROM questions q
                LEFT JOIN answers a
                  ON a.question_id = q.id
                WHERE q.survey_id = ?
                  AND a.user_id = ?
                ORDER BY q.id;
  `,

  GET_ALL_ANSWERS_BY_USER_ID: `
                SELECT
                  s.id AS survey_id,
                  s.title AS survey_title,
                  json_group_array(
                    json_object(
                      'answer_id', a.id,
                      'question_id', q.id,
                      'text', q.text,
                      'type', q.type,
                      'value', a.value
                    )
                  ) AS answers
                FROM answers a
                JOIN questions q ON a.question_id = q.id
                JOIN surveys s ON q.survey_id = s.id
                WHERE a.user_id = ?
                GROUP BY s.id
                ORDER BY s.id;
  `,

  GET_AGGREGATED_SURVEY_STATS: `
                WITH question_stats AS (
                  SELECT
                    q.id AS question_id,
                    q.survey_id,
                    q.text,
                    q.type,
                    COUNT(a.id) AS total_responses,
                    AVG(CASE WHEN q.type = 'RATING' THEN CAST(a.value AS INTEGER) ELSE NULL END) AS average_rating,
                    SUM(CASE WHEN q.type = 'BOOLEAN' AND a.value = 'true' THEN 1 ELSE 0 END) AS true_count,
                    SUM(CASE WHEN q.type = 'BOOLEAN' AND a.value = 'false' THEN 1 ELSE 0 END) AS false_count
                  FROM questions q
                  LEFT JOIN answers a ON a.question_id = q.id
                  GROUP BY q.id
                )

                SELECT
                  s.id AS survey_id,
                  s.title AS survey_title,
                  COALESCE(
                    json_group_array(
                      json_object(
                        'question_id', qs.question_id,
                        'text', qs.text,
                        'type', qs.type,
                        'total_responses', qs.total_responses,
                        'average_rating', qs.average_rating,
                        'true_count', qs.true_count,
                        'false_count', qs.false_count
                      )
                    ),
                    '[]'
                  ) AS questions
                FROM surveys s
                LEFT JOIN question_stats qs ON qs.survey_id = s.id
                GROUP BY s.id;
  `,
};

const USER_QUERIES = {
  GET_USERS_BY_IDS: `
                SELECT id, name, role
                FROM users
                WHERE id IN (%IDS%);
  `,

  GET_USER_BY_ID: `
                SELECT id, name, role
                FROM users
                WHERE id = ?;
  `,
};

module.exports = {
  SURVEY_QUERIES,
  QUESTION_QUERIES,
  ANSWER_QUERIES,
  USER_QUERIES,
};
