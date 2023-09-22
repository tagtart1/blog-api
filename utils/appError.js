class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.messages = Array.isArray(message) ? message : [message];
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
  }
}

module.exports = AppError;
