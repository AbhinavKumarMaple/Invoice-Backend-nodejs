const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: String,
  id: String, // Consider using UUID here
  contactNumber: Number,
  username: String,
  email: { type: String, unique: true },
  password: String,
  accountant: { type: mongoose.Schema.Types.ObjectId, ref: "Accountant" },
});

module.exports = mongoose.model("Employee", employeeSchema);
