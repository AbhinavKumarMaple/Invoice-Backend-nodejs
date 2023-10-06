const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  
  
  name: String,
  accountantId: String,
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
  logo: {type:String}, // Assuming logo links are strings
  username: { type: String, unique: true },
  email: { type: String, unique:true },
  password: String,
});

module.exports = mongoose.model("Employee", employeeSchema);
