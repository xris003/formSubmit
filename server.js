const mongoose = require("mongoose");
const dotenv = require("dotenv");

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}... `);
});
