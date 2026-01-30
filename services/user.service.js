const { USER_QUERIES } = require("./queries");

class UserService {
  constructor(db) {
    this.db = db;
  }

  async getUsersByIds(userIds = []) {
    if (userIds.length === 0) {
      return [];
    }

    const placeholders = userIds.map(() => "?").join(", ");
    const sql = USER_QUERIES.GET_USERS_BY_IDS.replace("%IDS%", placeholders);

    return this.db.query(sql, userIds);
  }
}

module.exports = UserService;
