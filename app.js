const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const { json } = require("express/lib/response");
const exp = require("constants");
const toursRouter = require("./routes/tourRoutes");
const usersRouter = require("./routes/userRoutes");
const reviewsRouter = require("./routes/reviewsRoutes");
const AppError = require("./utils/appErrors");
const globalErrorHandler = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const path = require("path");
const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 1000 * 60 * 60,
  message:
    "welcome from limiter MW it's to many request ,, try again after one hour ..",
});

//setting up pug engine:
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//Global MWs
//1)set sucurity http headers
app.use(helmet());
//2)rate limittig
app.use("/api", limiter);
app.use(morgan("dev"));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//Routes:
app.get("/", (req, res) => {
  res.status(200).render("base");
});

app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/reviews", reviewsRouter);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server...`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
