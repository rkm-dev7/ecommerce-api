const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { jwtAccessKey, jwtRefreshKey } = require("../secret");

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
    const accessToken = createJSONWebToken({ user }, jwtAccessKey, "1m");
    res.cookie("accessToken", accessToken, {
      maxAge: 1 * 60 * 1000, // 60 minutes
      httpOnly: true,
      secure: true,
      sameSite: "None", // Use "None" to allow cross-site cookies
    });
    const refreshToken = createJSONWebToken({ user }, jwtRefreshKey, "7d");
    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: true,
      sameSite: "None", // Use "None" to allow cross-site cookies
    });

    // Create without the "password" field
    const userWithoutPassword = await User.findOne({ email }).select(
      "-password"
    );
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
    console.log(decodedToken.user);
    const accessToken = createJSONWebToken(
      decodedToken.user,
      jwtAccessKey,
      "1m"
    );
    res.cookie("accessToken", accessToken, {
      maxAge: 1 * 60 * 1000, // 60 minutes
      httpOnly: true,
      secure: true,
      sameSite: "None", // Use "None" to allow cross-site cookies
    });
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
