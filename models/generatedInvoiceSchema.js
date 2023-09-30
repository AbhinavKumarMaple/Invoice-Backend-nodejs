const mongoose = require("mongoose");

const generatedInvoiceSchema = new mongoose.Schema({
  id: String, // Consider using UUID here

  invoiceNumber: Number,
  date: Date,
  dueDate: Date,
  customerName: String,
  netAmount: Number,
  vatRate: Number,
  vatAmount: Number,
  totalGross: Number,
  bankAccount: String,
  note: String,
  createdBy: { type: String, required: false }, // Assuming user can be either customer or employee
  accountantId: { type: String, required: false },
  banks: [
    {
      bankName: String,
      accountName: String,
      accountNumber: String,
      sortCode: String,
    },
  ],
  customerAddress: {
    address: String,
    landmark: String,
    street: String,
    postalCode: String,
  },
  accountantAddress: {
    streetName: String,
    landMark: String,
    buildingNumber: String,
    postalCode: String,
  }, // [street name, landmark, building name/number, postal code]
  logo: String, // Assuming logo is a string (link to the logo)
  vatRegNo: Number,
  crn: Number,
  customerName: String, // You've mentioned 'customer name' twice; you may want to remove one of them.
});

module.exports = mongoose.model("GeneratedInvoice", generatedInvoiceSchema);
