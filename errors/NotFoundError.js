const AppError = require("./AppError");

class NotFoundError extends AppError {
  constructor(message, code = "NOT_FOUND") {
    super({
      message,
      code,
      statusCode: 404,
    });
  }
}

module.exports = NotFoundError;
