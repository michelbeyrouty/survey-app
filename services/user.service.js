const { USER_QUERIES } = require("./queries");
const NotFoundError = require("../errors/NotFoundError");

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

  async getById(userId) {
    const rows = await this.db.query(USER_QUERIES.GET_USER_BY_ID, [userId]);

    if (rows.length === 0) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    return rows[0];
  }
}

module.exports = UserService;
