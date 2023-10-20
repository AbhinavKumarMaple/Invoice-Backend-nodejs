const mongoose = require("mongoose");

const accountantSchema = new mongoose.Schema({
  name: String,
  businessName: String,
  contactNumber: Number,
  address: {
    streetName: String,
    buildingNameNumber: String,
    postalCode: String,
  },
  address2:String
  ,
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
      contentType: String
    }],
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("Accountant", accountantSchema);
