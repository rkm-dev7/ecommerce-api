const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { jwtAccessKey, jwtRefreshKey } = require("../secret");
const { setAccesstokenCookie } = require("../helper/cookie");

const handleLogin = async (req, res, next) => {
  try {
    // email, password req.body
    const { email, password } = req.body;
    // isExist
    const user = await User.findOne({ email });

    if (!user) {
      throw createError(
        404,
        "User does not exist with this email. Please register first."
      );
    }
    // compare the password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw createError(401, "Email/password did not match.");
    }
    // isBaned
    if (user.isBaned) {
      throw createError(403, "You are Banned. Please contact authority");
    }

    // token, cookie
    const accessToken = createJSONWebToken({ user }, jwtAccessKey, "5m");
    setAccesstokenCookie(res, accessToken);
    const refreshToken = createJSONWebToken({ user }, jwtRefreshKey, "7d");
    setRefreshtokenCookie(res, refreshToken);

    // Create without the "password" field
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    // success response
    return successResponse(res, {
      statusCode: 200,
      message: "User logged in successfully",
      payload: { userWithoutPassword },
    });
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    //clear cookie
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    // success response
    return successResponse(res, {
      statusCode: 200,
      message: "User logged out successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    // varify old refresh token
    const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);
    if (!decodedToken) {
      throw createError(401, "Invalid refresh token. Please login again.");
    }

    const accessToken = createJSONWebToken(
      decodedToken.user,
      jwtAccessKey,
      "5m"
    );
    setAccesstokenCookie(res, accessToken);
    successResponse(res, {
      statusCode: 200,
      message: "new access token is generated",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleProtectedRoute = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    const decodedToken = jwt.verify(accessToken, jwtAccessKey);
    if (!decodedToken) {
      throw createError(404, "Invalid access token. Please login again.");
    }
    successResponse(res, {
      statusCode: 200,
      message: "Protected resources accessed successfully.",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleProtectedRoute,
};
