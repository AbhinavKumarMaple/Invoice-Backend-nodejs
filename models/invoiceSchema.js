const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  id: String, // Consider using UUID here
  invoiceNumber: Number,
  date: Date,
  customerName: String,
  serviceDescription: String,
  netAmount: Number,
  vatRate: Number,
  vatAmount: Number,
  totalGross: Number,
  paymentMethod: String, // You can use an enum if you have predefined values
  bankAccount: String,
  paymentStatus: String, // You can use an enum if you have predefined values
  note: String,
  createdBy: { type: String, ref: "User", require: true }, // Assuming user can be either customer or employee
  accountantId: { type: String, ref: "Accountant", require: true },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
