const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: String,
  contactNumber: Number,
  username: String,
  email: { type: String, unique: true },
  password: String,
  accountantId: String,
});

module.exports = mongoose.model("Employee", employeeSchema);
