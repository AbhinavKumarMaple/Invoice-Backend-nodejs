const mongoose = require("mongoose");

const vatRateSchema = new mongoose.Schema({
  employeeId: String, // You specified int, but Mongoose uses Number
  vatRate: Number,
  created: Date,
  accountantId: { type: mongoose.Schema.Types.ObjectId, ref: "Accountant" },
});

module.exports = mongoose.model("VatRate", vatRateSchema);
