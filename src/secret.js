require("dotenv").config();
const serverPort = process.env.SERVER_PORT || 5000;
const defaultImagePath =
  process.env.DEFAULT_USER_IMAGE_PATH || "public/images/users/profile.png";
const mongodbURL =
  process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/ecommerceMernDB";
const jwtActivationKey =
  process.env.JWT_ACTIVATION_KEY ||
  "fdsallo$fsd%dsfll8437kjhwelwh98yu43kjsd$kjhh5_dsfj245";
const jwtAccessKey =
  process.env.JWT_ACCESS_KEY || "fdsaFDSASFADHkjhh5_dsfjHH245";
const jwtPasswordResetKey =
  process.env.JWT_PASSWORD_RESET_KEY || "SFADjhh5_dsfj245";
const jwtRefreshKey = process.env.JWT_REFRESH_KEY || "SFADjhasdfgh5_dsfj245";

const smtpUsername = process.env.SMTP_USERNAME || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";
const clientURL = process.env.CLIENT_URL || "";

module.exports = {
  serverPort,
  mongodbURL,
  defaultImagePath,
  jwtActivationKey,
  smtpUsername,
  smtpPassword,
  clientURL,
  jwtAccessKey,
  jwtPasswordResetKey,
  jwtRefreshKey,
};
