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

                -- Only include surveys user can access (creator OR explicit access)
                WHERE EXISTS (
                  SELECT 1
                  FROM survey_access sa
                  WHERE sa.survey_id = s.id
                    AND sa.user_id = ?
                )
                OR s.creator_id = ?

                ORDER BY s.id;`,
};

module.exports = {
  SURVEY_QUERIES,
};
