const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String },
  contactNumber: Number,
  address: {
    address: String,
    streetLane: String,
    postalCode: { type: String, match: /^[0-9a-zA-Z]+$/ }, // Alphanumeric postal code
  },
  address2:String,
  banks: [
    {
      bankName: { type: String, required: true },
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      sortCode: { type: String, required: true },
    },
  ],
  creator: String,
  accountantId: String,
});

module.exports = mongoose.model("Customer", customerSchema);
