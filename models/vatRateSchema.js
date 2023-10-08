const mongoose = require("mongoose");

const vatRateSchema = new mongoose.Schema({
  employeeId: String, 
  vatRate: Number,
  created: Date,
  accountantId: { type: mongoose.Schema.Types.ObjectId, ref: "Accountant" },
});

module.exports = mongoose.model("VatRate", vatRateSchema);
