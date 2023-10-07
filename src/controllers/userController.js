// Import necessary modules and packages
const fs = require("fs").promises; // Import fs.promises for promise-based file system operations
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const findWithId = require("../services/findItem");
const {
  jwtActivationKey,
  clientURL,
  jwtPasswordResetKey,
} = require("../secret");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const emailWithNodeMail = require("../helper/email");
const { MAX_FILE_SIZE } = require("../config");

// Retrieve users
const getUsers = async (req, res, next) => {
  try {
    // Extract query parameters from the request or use default values if not provided
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    // Check if page or limit values are invalid and throw an error if they are
    if (page <= 0 || limit <= 0 || isNaN(page) || isNaN(limit)) {
      throw createError(400, "Invalid page or limit values");
    }

    // Create a regular expression for searching users based on the 'search' query parameter
    const searchRegExp = new RegExp(".*" + search + ".*", "i");

    // Define a filter to find users that match the search criteria and are not admins
    const filter = {
      isAdmin: false,
      $or: [
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };

    // Define options to exclude the 'password' field from the query results
    const options = { password: 0 };

    // Use the User model to find users based on the filter and options, with pagination
    const users = await User.find(filter, options)
      .limit(limit)
      .skip((page - 1) * limit);

    // If no users are found, throw a 404 error
    if (users.length === 0) {
      throw createError(404, "No users found");
    }

    // Count the total number of users that match the filter criteria
    const totalCount = await User.find(filter).countDocuments().exec();
    const totalPage = Math.ceil(totalCount / limit);

    // Send a response with the retrieved users and pagination information
    return successResponse(res, {
      statusCode: 200,
      message: "Users were returned successfully",
      payload: {
        users,
        pagination: {
          totalPage: totalPage,
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= totalPage ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    // Pass any encountered errors to the error handling middleware
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);
    return successResponse(res, {
      statusCode: 200,
      message: "User were returned successfully",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

const processRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const image = req.file;
    const imageBufferString = image.buffer.toString("base64");

    if (!image) {
      throw createError(404, "User image is required.");
    }
    if (image.size > 2 * 1024 * 1024) {
      throw createError(413, "File size exceeds the limit.");
    }

    const userExists = await User.exists({ email: email });
    if (userExists) {
      throw createError(409, "User this email allready exists. Plese sign in.");
    }

    // create jwt
    const token = createJSONWebToken(
      { name, email, password, phone, address },
      jwtActivationKey,
      "10m"
    );

    // prepare email
    const emailData = {
      email,
      subject: "Account activation email",
      html: `
        <h2>Hello, ${name}</h2>
        <p>Please click here to <a href="${clientURL}/api/users/activate/${token}" target="_blank">activate your account</a></p>
      `,
    };
    // send email with nodemailer
    try {
      emailWithNodeMail(emailData);
    } catch (emailError) {
      next(createError(500, "Failed to send varification email"));
      return;
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Please to to your ${email} for completing your registration process`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

const activateUserAccount = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token) throw createError(404, "Token not found");

    // verify a token
    try {
      const decoded = jwt.verify(token, jwtActivationKey);
      if (!decoded) throw createError(401, "User was not able to varified");
      const userExists = await User.exists({ email: decoded.email });
      if (userExists) {
        throw createError(
          409,
          "User with this email already exist. Please sign in."
        );
      }
      const user = await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: "User war registerd successfully",
        payload: { user },
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired!");
      } else if (error.name === "JsonWebTokenError") {
        throw createError(401, "Invalid token!");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    await findWithId(User, userId, options);
    const updateOptions = { new: true, runValidators: true, context: "query" };

    let updateData = {};

    for (let key in req.body) {
      if (["name", "password", "phone", "address"].includes(key)) {
        updateData[key] = req.body[key];
      }
      if (["email"].includes(key)) {
        throw createError(400, "Email can to be updated.");
      }
    }

    const image = req.file;
    if (image && image.size > 2 * 1024 * 1024) {
      throw createError(413, "File size exceeds the limit.");
    }
    if (image) {
      updateData.image = image.buffer.toString("base64");
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      updateData,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(404, "User with this ID does not exist.");
    }

    return successResponse(res, {
      statusCode: 201,
      message: "User was updated successfully",
      payload: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const handelBanUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await findWithId(User, userId);
    const updateOptions = { new: true, runValidators: true, context: "query" };

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { isBaned: true },
      updateOptions
    ).select("-password");

    if (!updateUser) {
      throw createError(400, "User was not banned successfully.");
    }

    // seccess response
    return successResponse(res, {
      statusCode: 201,
      message: "User was banned successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const handelUnbanUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await findWithId(User, userId);

    const unbanndUser = await User.findByIdAndUpdate(
      userId,
      { isBaned: false },
      { new: true, runValidators: true, context: "query" }
    ).select("-password");
    if (!unbanndUser) {
      throw createError(400, "User was not unbannd successfully.");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User was unbannd successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);

    await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "User were deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

const handelUpdatePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id;
    const user = await findWithId(User, userId);

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw createError(400, "Old password is not correct.");
    }
    // const filter = { userId };
    // const updates = { $set: { password: newPassword } };
    // const options = { new: true, runValidators: true, context: "query" };
    // const updateUser = await User.findByIdAndUpdate(filter, updates, options).select("-password");

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true, runValidators: true, context: "query" }
    ).select("-password");

    if (!updateUser) {
      throw createError(400, "User was not updated successfully");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "User updated successfully",
      payload: { updateUser },
    });
  } catch (error) {
    next(error);
  }
};

const handelForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
      throw createError(
        404,
        "Email is incorrect or you have not varified your email address. Please register yourself first."
      );
    }
    const token = createJSONWebToken({ email }, jwtPasswordResetKey, "15m");

    // prepare email
    const emailData = {
      email,
      subject: "Reset password email",
      html: `
            <h2>Hello, ${userData.name}</h2>
            <p>Please click here to <a href="${clientURL}/api/users/reset-password/${token}" target="_blank">reset your password.</a></p>
          `,
    };
    // send email with nodemailer
    try {
      emailWithNodeMail(emailData);
    } catch (emailError) {
      next(createError(500, "Failed to send reset password email"));
      return;
    }

    successResponse(res, {
      statusCode: 200,
      message: `please go your ${email} for reseting the password.`,
      payload: token,
    });
  } catch (error) {
    next(error);
  }
};

const handelResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, jwtPasswordResetKey);
    if (!decoded) {
      throw createError(400, "Invalid or Expire token.");
    }
    const filter = { email: decoded.email };
    const updateData = { password: password };
    const options = { new: true, runValidators: true, context: "query" };
    const updatdUser = await User.findOneAndUpdate(
      filter,
      updateData,
      options
    ).select("-password");

    if (!updatdUser) {
      throw createError(404, "password reset failed.");
    }

    successResponse(res, {
      statusCode: 200,
      message: "Password rest successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
  handelBanUserById,
  handelUnbanUserById,
  handelUpdatePassword,
  handelForgetPassword,
  handelResetPassword,
};
