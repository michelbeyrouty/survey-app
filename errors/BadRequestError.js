const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message, code = 'BAD_REQUEST') {
    super({
      message,
      code,
      statusCode: 400
    });
  }
}

module.exports = BadRequestError;
