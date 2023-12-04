const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();

// 1) MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

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

app.post("/submit-form", async (req, res) => {
  try {
    // Extract data from the form
    const { name, email, message } = req.body;

    // Save data to the database
    const connection = await pool.getConnection();
    const result = await connection.query(
      "INSERT INTO your_table (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );
    connection.release();

    // Send data to the email address
    // Use nodemailer or any other email sending service

    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = app;
