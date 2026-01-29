const USER_ROLES = {
  ADMIN: "ADMIN",
  ANSWERER: "ANSWERER",
};

const QUESTION_TYPES = {
  TEXT: "TEXT",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  RATING: "RATING",
  BOOLEAN: "BOOLEAN",
};

const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || "localhost",
};

module.exports = {
  USER_ROLES,
  QUESTION_TYPES,
  SERVER_CONFIG,
};
