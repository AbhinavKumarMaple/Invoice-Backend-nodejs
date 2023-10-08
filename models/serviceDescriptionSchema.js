const mongoose = require("mongoose");

const serviceDescriptionSchema = new mongoose.Schema({
  employeeId: String, 
  description: String,
  created: Date,
  accountantId: String,
});

module.exports = mongoose.model("ServiceDescription", serviceDescriptionSchema);
