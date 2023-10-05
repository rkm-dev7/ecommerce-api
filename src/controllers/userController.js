// Import necessary modules and packages
const fs = require("fs").promises; // Import fs.promises for promise-based file system operations
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const findWithId = require("../services/findItem");
const deleteImage = require("../helper/deleteImage");
const { jwtActivationKey, clientURL } = require("../secret");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const emailWithNodeMail = require("../helper/email");

// Retrieve users
const getUsers = async (req, res, next) => {
  try {
    // Extract query parameters from the request or use default values if not provided
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    // Check if page or limit values are invalid and throw an error if they are
    if (page <= 0 || limit <= 0)
      throw createError(400, "Invalid page or limit values");

    // Create a regular expression for searching users based on the 'search' query parameter
    const searchRegExp = new RegExp(".*" + search + ".*", "i");

    // Define a filter to find users that match the search criteria and are not admins
    const filter = {
      isAdmin: { $ne: true },
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
    const totalCount = await User.find(filter).countDocuments();

    // Send a response with the retrieved users and pagination information
    return successResponse(res, {
      statusCode: 200,
      message: "Users were returned successfully",
      payload: {
        users,
        pagination: {
          totalPage: Math.ceil(totalCount / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(totalCount / limit) ? page + 1 : null,
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
    // if (!req.file) {
    //   throw createError(404, "No image uploaded");
    // }
    const image = req.file;
    const imageBufferString = image.buffer.toString("base64");

    const userExists = await User.exists({ email: email });
    if (userExists) {
      throw createError(409, "User this email allready exists. Plese sign in.");
    }

    // create jwt
    const token = createJSONWebToken(
      { name, email, password, phone, address, image: imageBufferString },
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
  } catch (error) {
    next(error);
  }
};

const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);
    const userImagePath = user.image;
    deleteImage(userImagePath);

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

// Export the getUsers function to make it accessible to other parts of the application
module.exports = {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
};