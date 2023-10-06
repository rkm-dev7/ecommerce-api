// Registration validation
const { body } = require("express-validator");
const validateUserRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty. Enter your full name.")
    .isLength({ min: 3, max: 31 })
    .withMessage("Name must be between 3 and 31 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email address.")
    .isEmail()
    .withMessage("Please enter a valid email."),

  body("password")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Password is required. Enter your password.")
    .isLength({ min: 8 })
    .withMessage("The password must be at least 8 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,10}$/)
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required. Enter your address")
    .isLength({ min: 3 })
    .withMessage("Address should be at least 3 characters long"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required. Enter your phone number.")
    .matches(/^(?:\+88|88)?(01[3-9]\d{8})$/)
    .withMessage((value, { req }) => `${value} is not a valid phone number!`),

  body("image")
    .custom((value, { req }) => {
      if (!req.file || !req.file.buffer) {
        throw new Error("User image is required.");
      }
      return true;
    })
    .withMessage("User image is required"),
];

const validateUserLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email address.")
    .isEmail()
    .withMessage("Please enter a valid email."),

  body("password")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Password is required. Enter your password.")
    .isLength({ min: 8 })
    .withMessage("The password must be at least 8 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,10}$/)
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
];

const validateUserPasswordUpdate = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email address.")
    .isEmail()
    .withMessage("Please enter a valid email."),

  body("oldPassword")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Old password is required. Enter your password.")
    .isLength({ min: 8 })
    .withMessage("Old password must be at least 8 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,10}$/)
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),

  body("newPassword")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("New password is required. Enter your password.")
    .isLength({ min: 8 })
    .withMessage("New passwordmust be at least 8 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,10}$/)
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password did not Match");
    }
    return true;
  }),
];
module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserPasswordUpdate,
};
