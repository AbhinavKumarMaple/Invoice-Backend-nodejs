const mongoose = require("mongoose");

const vatRateSchema = new mongoose.Schema({
  id: String, // Consider using UUID here
  employeeId: Number, // You specified int, but Mongoose uses Number
  vatRate: Number,
  created: Date,
  accountant: { type: mongoose.Schema.Types.ObjectId, ref: "Accountant" },
});

module.exports = mongoose.model("VatRate", vatRateSchema);
