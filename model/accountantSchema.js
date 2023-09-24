const mongoose = require("mongoose");

const accountantSchema = new mongoose.Schema({
  name: String,
  id: String, // Consider using UUID here
  businessName: String,
  contactNumber: Number,
  address: {
    streetName: String,
    landmark: String,
    buildingNameNumber: String,
    postalCode: String,
  },
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
  logo: [String, String], // Assuming logo links are strings
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("Accountant", accountantSchema);
