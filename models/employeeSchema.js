const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  accountantId: String,
  businessName: String,
  contactNumber: Number,
  address: {
    streetName: String,
    buildingNameNumber: String,
    postalCode: { type: String, match: /^[0-9a-zA-Z]+$/ }, // Alphanumeric postal code
  },
  address2:String,
  vatNumber: Number,
  crnNumber: Number,
  banks: [
    {
      bankName: String,
      accountName: String,
      accountNumber: String,
      sortCode: String,
    },
  ],
  logo: [
    {
      data: Buffer,
      contentType: String,
    },
  ],
  username: { type: String },
  email: { type: String, unique: true },
  password: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model("Employee", employeeSchema);
