const { validationResult } = require("express-validator");
const { errorResponse } = require("../controllers/responseController");
const handleValidationErrors = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array().map((error) => error.msg);
      return errorResponse(res, { statusCode: 422, message: errorMsg[0] });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
module.exports = { handleValidationErrors };
