const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const queryPromise = require("./server");

const app = express();

// 1) MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// console.log(process.env.NODE_ENV);
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, try again later",
});

app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data Santization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use((req, res, next) => {
  console.log("Hello Devs 😊");
  next();
});

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

module.exports = app;
