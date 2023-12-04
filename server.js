const mysql2 = require("mysql2");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const pool = mysql2.createPool({
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}... `);
  pool.connect((err) => {
    if (err) throw err;
    console.log("DATABASE CONNECTED");
  });
});

module.exports = pool;
