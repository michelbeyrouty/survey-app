const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

class Database {
  constructor(filename = "survey.db") {
    this.filename = filename;
    this.dbPromise = null;
  }

  /* =======================
     Connection
  ======================= */

  async getDb() {
    if (!this.dbPromise) {
      this.dbPromise = open({
        filename: this.filename,
        driver: sqlite3.Database,
      });

      const db = await this.dbPromise;
      await db.exec("PRAGMA foreign_keys = ON;");
    }

    return this.dbPromise;
  }

  async exec(sql) {
    const db = await this.getDb();
    return db.exec(sql);
  }

  async query(sql, params = []) {
    const db = await this.getDb();
    return db.all(sql, params);
  }

  async close() {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      await db.close();
      this.dbPromise = null;
    }
  }

  /* =======================
     Initialization
  ======================= */

  async init() {
    try {
      // Users
      await this.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('ADMIN', 'ANSWERER'))
        );
      `);

      // Surveys
      await this.exec(`
        CREATE TABLE IF NOT EXISTS surveys (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          creator_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (creator_id) REFERENCES users(id)
        );
      `);

      // Survey Access (many-to-many)
      await this.exec(`
        CREATE TABLE IF NOT EXISTS survey_access (
          survey_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (survey_id, user_id),
          FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Questions
      await this.exec(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY,
          survey_id INTEGER NOT NULL,
          text TEXT NOT NULL,
          type TEXT NOT NULL CHECK (
            type IN ('TEXT', 'MULTIPLE_CHOICE', 'RATING', 'BOOLEAN')
          ),
          rating_min INTEGER,
          rating_max INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
          CHECK (
            (type = 'RATING' AND rating_min IS NOT NULL AND rating_max IS NOT NULL)
            OR
            (type != 'RATING' AND rating_min IS NULL AND rating_max IS NULL)
          )
        );
      `);

      // Answers
      await this.exec(`
        CREATE TABLE IF NOT EXISTS answers (
          id INTEGER PRIMARY KEY,
          question_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE (question_id, user_id)
        );
      `);

      // Seed if empty
      const [{ count }] = await this.query(
        "SELECT COUNT(*) AS count FROM users",
      );

      if (count === 0) {
        await this.seed();
        console.log("Database initialized with sample data");
      } else {
        console.log("Database already initialized");
      }
    } catch (err) {
      console.error("Database initialization failed:", err);
      throw err;
    }
  }

  /* =======================
     Seed Data
  ======================= */

  async seed() {
    await this.exec(`
      INSERT INTO users (name, role) VALUES
        ('Admin User', 'ADMIN'),
        ('Sarah Admin', 'ADMIN'),
        ('John Doe', 'ANSWERER'),
        ('Jane Smith', 'ANSWERER'),
        ('Mike Johnson', 'ANSWERER');
    `);

    await this.exec(`
      INSERT INTO surveys (title, creator_id) VALUES
        ('Customer Satisfaction', 1),
        ('Product Feedback', 1),
        ('Internal Team Review', 1);
    `);

    await this.exec(`
      INSERT INTO survey_access (survey_id, user_id) VALUES
        (1, 1),
        (1, 2),
        (2, 1),
        (2, 2),
        (3, 1);
    `);

    await this.exec(`
      INSERT INTO questions (survey_id, text, type, rating_min, rating_max) VALUES
        (1, 'How satisfied are you with our service?', 'RATING', 1, 5),
        (1, 'Would you recommend us?', 'BOOLEAN', NULL, NULL),
        (1, 'Additional feedback', 'TEXT', NULL, NULL),
        (2, 'Rate the product quality', 'RATING', 1, 10),
        (2, 'What did you like most?', 'TEXT', NULL, NULL),
        (3, 'How effective is our team communication?', 'RATING', 1, 10),
        (3, 'Any suggestions for team improvement?', 'TEXT', NULL, NULL);
    `);

    await this.exec(`
      INSERT INTO answers (question_id, user_id, value) VALUES
        (1, 2, '4'),
        (2, 2, 'true'),
        (3, 2, 'Great service overall'),
        (1, 3, '5'),
        (2, 3, 'true'),
        (4, 2, '8'),
        (5, 2, 'Great design and features');
    `);
  }
}

module.exports = Database;
