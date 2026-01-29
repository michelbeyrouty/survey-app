const AppError = require("./AppError");

class UnauthorizedError extends AppError {
  constructor(message, code = "UnauthorizedError") {
    super({
      message,
      code,
      statusCode: 404,
    });
  }
}

module.exports = UnauthorizedError;
