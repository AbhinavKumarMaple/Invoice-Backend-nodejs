const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: Number, unique: true },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
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
  employeeName: String,
});

module.exports = mongoose.model("Invoice", invoiceSchema);
