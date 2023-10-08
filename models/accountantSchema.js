const mongoose = require("mongoose");

const accountantSchema = new mongoose.Schema({
  name: String,
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
  logo: [
    {
      data: Buffer,
      contentType: String
    }],
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  img:[
	{
		data: Buffer,
		contentType: String
	}],
});

module.exports = mongoose.model("Accountant", accountantSchema);
