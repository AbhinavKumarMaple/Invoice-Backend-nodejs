const mongoose = require("mongoose");

const serviceDescriptionSchema = new mongoose.Schema({
  employeeId: String, // You specified int, but Mongoose uses Number
  description: String,
  created: Date,
  accountantId: String,
});

module.exports = mongoose.model("ServiceDescription", serviceDescriptionSchema);
