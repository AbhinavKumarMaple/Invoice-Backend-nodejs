const mongoose = require("mongoose");

const serviceDescriptionSchema = new mongoose.Schema({
  id: String, // Consider using UUID here
  employeeId: Number, // You specified int, but Mongoose uses Number
  description: String,
  created: Date,
  accountant: { type: mongoose.Schema.Types.ObjectId, ref: "Accountant" },
});

module.exports = mongoose.model("ServiceDescription", serviceDescriptionSchema);
