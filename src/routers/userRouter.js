const express = require("express");
const {
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
  processRegister
);
userRouter.post("/activate", isLoggedOut, activateUserAccount);
userRouter.get("/", isLoggedIn, isAdmin, getUsers);
userRouter.get("/:id", isLoggedIn, getUserById);
userRouter.put(
  "/reset-password",
  validateUserResetPassword,
  handleValidationErrors,
  handelResetPassword
);
userRouter.put("/:id", upload.single("image"), isLoggedIn, updateUserById);
userRouter.delete("/:id", isLoggedIn, deleteUserById);
userRouter.put("/ban-user/:id", isLoggedIn, isAdmin, handelBanUserById);
userRouter.put("/unban-user/:id", isLoggedIn, isAdmin, handelUnbanUserById);
userRouter.put(
  "/update-password/:id",
  validateUserPasswordUpdate,
  handleValidationErrors,
  isLoggedIn,
  handelUpdatePassword
);
userRouter.post(
  "/forgate-password",
  validateUserPasswordForget,
  handleValidationErrors,
  handelForgetPassword
);

module.exports = userRouter;
