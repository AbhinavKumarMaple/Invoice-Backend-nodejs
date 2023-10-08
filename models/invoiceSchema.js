const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: Number },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  customerName: String,
  serviceDescription: [{ type: String }],
  netAmount: Number,
  vatRate: Number,
  vatAmount: Number,
  totalGross: Number,
  paymentMethod: String, 
  bankAccount: String,
  paymentStatus: String, 
  note: String,
  createdBy: { type: String, require: true }, 
  createdFor: { type: String, require: true },
  accountantId: { type: String, ref: "Accountant", require: true },
  employeeName: String,
});

module.exports = mongoose.model("Invoice", invoiceSchema);
