const express = require("express");
const {
  handleGetUsers,
  handleGetUserById,
  handleDeleteUserById,
  handleProcessRegister,
  handleActivateUserAccount,
  handleUpdateUserById,
  handleBanUserById,
  handleUnbanUserById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
} = require("../controllers/userController");
const upload = require("../middlewares/uploadFile");
const {
  validateUserRegistration,
  validateUserPasswordUpdate,
  validateUserPasswordForget,
  validateUserResetPassword,
} = require("../validators/auth");
const { handleValidationErrors } = require("../validators");
const { isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");
const userRouter = express.Router();

userRouter.post(
  "/process-register",
  upload.single("image"),
  isLoggedOut,
  validateUserRegistration,
  handleValidationErrors,
  handleProcessRegister
);
userRouter.post("/activate", isLoggedOut, handleActivateUserAccount);
userRouter.get("/", isLoggedIn, isAdmin, handleGetUsers);
userRouter.get("/:id([0-9a-fA-F]{24})", isLoggedIn, handleGetUserById);
userRouter.put(
  "/reset-password",
  validateUserResetPassword,
  handleValidationErrors,
  handleResetPassword
);
userRouter.put(
  "/:id([0-9a-fA-F]{24})",
  upload.single("image"),
  isLoggedIn,
  handleUpdateUserById
);
userRouter.delete("/:id([0-9a-fA-F]{24})", isLoggedIn, handleDeleteUserById);
userRouter.put(
  "/ban-user/:id([0-9a-fA-F]{24})",
  isLoggedIn,
  isAdmin,
  handleBanUserById
);
userRouter.put(
  "/unban-user/:id([0-9a-fA-F]{24})",
  isLoggedIn,
  isAdmin,
  handleUnbanUserById
);
userRouter.put(
  "/update-password/:id",
  validateUserPasswordUpdate,
  handleValidationErrors,
  isLoggedIn,
  handleUpdatePassword
);
userRouter.post(
  "/forgate-password",
  validateUserPasswordForget,
  handleValidationErrors,
  handleForgetPassword
);

module.exports = userRouter;
