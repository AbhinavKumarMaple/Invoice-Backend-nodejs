const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  contactNumber: Number,
  address: {
    address: String,
    landmark: String,
    streetLane: String,
    postalCode: String,
  },
  banks: [
    {
      bankName: { type: String, required: true },
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      sortCode: { type: String, required: true },
    },
  ],
  creator: String, // Assuming creator can be either customer or accountant
  accountantId: String,
});

module.exports = mongoose.model("Customer", customerSchema);
