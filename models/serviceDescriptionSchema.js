const mongoose = require("mongoose");

const serviceDescriptionSchema = new mongoose.Schema({
  employeeId: String, // You specified int, but Mongoose uses Number
  description: { type: String, unique: true },
  created: Date,
  accountantId: String,
});

module.exports = mongoose.model("ServiceDescription", serviceDescriptionSchema);
