const mysql2 = require("mysql2");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const sendEmail = require("./email");

dotenv.config({ path: "./config.env" });

const app = require("./app");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}... `);
});

const pool = mysql2.createConnection({
  host: process.env.HOST,
  port: process.env.DB_PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

console.log(process.env.HOST);

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

app.get("/", (req, res) => {
  const enq = "SELECT * FROM formsubmit_db.submitform";
  pool.query(enq, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/submit-form", async (req, res) => {
  try {
    // Extract data from the form
    const { name, email, subject, phone, message } = req.body;

    // Save data to the database
    const newinfo = [name, email, subject, phone, message];
    const SQL =
      "INSERT INTO submitform (name_col, email_col, subject_col, phone_col, msg_col) VALUES (?, ?, ?, ?, ?)";

    const result = await queryPromise(SQL, newinfo);

    await sendEmail({
      email: newinfo.email,
      subject: "New Enquiry Details",
      message: `New enquiry details:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nPhone: ${phone}\nMessage: ${message}`,
    });

    res.json({ id: result.insertId, name, email, subject, phone, message });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// const message = req.body;

// try {
//   await sendEmail({
//     email: req.body.email,
//     subject: "New Enquiry Details",
//     message,
//   });

//   res.status(200).json({
//     status: "success",
//     message: "Token sent to email!",
//   });
// } catch (err) {
//   error: err;
// }

// const nodemailer = require("nodemailer");

// // ... (your existing code)

// // Create a Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   host: "your-smtp-host",
//   port: 587, // Use the appropriate port for your email service provider
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: "your-email@example.com", // Your email address
//     pass: "your-email-password", // Your email password or app-specific password
//   },
// });

// // ... (your existing code)

// app.post("/submit-form", async (req, res) => {
//   try {
//     // Extract data from the form
//     const { name, email, subject, phone, message } = req.body;

//     // Save data to the database
//     const newinfo = [name, email, subject, phone, message];
//     const SQL =
//       "INSERT INTO submitform (name_col, email_col, subject_col, phone_col, msg_col) VALUES (?, ?, ?, ?, ?)";

//     const result = await queryPromise(SQL, newinfo);

//     // Send email
//     const mailOptions = {
//       from: "your-email@example.com", // sender address
//       to: "recipient@example.com", // list of receivers
//       subject: "New Form Submission", // Subject line
//       html: `
//         <p>Name: ${name}</p>
//         <p>Email: ${email}</p>
//         <p>Subject: ${subject}</p>
//         <p>Phone: ${phone}</p>
//         <p>Message: ${message}</p>
//       `, // HTML body
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         return console.log(error);
//       }
//       console.log("Email sent: " + info.response);
//     });

//     res.json({
//       id: result.insertId,
//       name,
//       email,
//       subject,
//       phone,
//       message,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Internal server error." });
//   }
// });
