const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const xss = require("xss-clean");
const { rateLimit } = require("express-rate-limit");
const userRouter = require("./routers/userRouter");
const { seedUser } = require("./controllers/seedController");
const { errorResponse } = require("./controllers/responseController");
const authRouter = require("./routers/authRouter");

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 20, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message:
    "Too many requests created from this IP, please try again after a minute",
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(rateLimiter);
app.use(morgan("dev"));
app.use(xss());

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/seed", seedUser);

app.get("/", (req, res) => {
  res.status(200).send("Wellcome to Server");
});

// Client Error Handling
app.use((req, res, next) => {
  next(createError(404, "route not found!"));
});

// Server Error Handling
app.use((err, req, res, next) => {
  return errorResponse(res, {
    statusCode: err.status,
    message: err.message,
  });
});

module.exports = { app };
