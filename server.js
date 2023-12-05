const mysql2 = require("mysql2");
// const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// dotenv.config({ path: "./config.env" });

const app = require("./app");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}... `);
});

const pool = mysql2.createConnection({
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "07026305657",
  database: "formsubmit_db",
});

pool.connect((err) => {
  if (err) {
    console.log("Unable to Connect to DB");
  }
  console.log("DATABASE CONNECTED");
});

function queryPromise(sql, values = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

app.post("/submit-form", async (req, res) => {
  try {
    // Extract data from the form
    const { name, email, subject, phone, message } = req.body;

    // Save data to the database
    const newinfo = [name, email, subject, phone, message];
    const SQL =
      "INSERT INTO submitform (name_col, email_col, subject_col, phone_col, msg_col) VALUES (?, ?, ?, ?, ?)";

    const result = await queryPromise(SQL, newinfo);
    res.json({ id: result.insertId, name, email, subject, phone, message });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});
