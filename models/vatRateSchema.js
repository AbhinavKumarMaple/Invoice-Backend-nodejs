const mongoose = require("mongoose");

const vatRateSchema = new mongoose.Schema({
  employeeId: Number, // You specified int, but Mongoose uses Number
  vatRate: { type: Number, unique: true },
  created: Date,
  accountantId: { type: mongoose.Schema.Types.ObjectId, ref: "Accountant" },
});

module.exports = mongoose.model("VatRate", vatRateSchema);
