const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  id: String, // Consider using UUID here
  contactNumber: Number,
  address: {
    address: String,
    landmark: String,
    streetLane: String,
    postalCode: String,
  },
  banks: [
    {
      bankName: String,
      accountName: String,
      accountNumber: String,
      sortCode: String,
    },
  ],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }, // Assuming creator can be either customer or accountant
  accountant: { type: mongoose.Schema.Types.ObjectId, ref: "Accountant" },
});

module.exports = mongoose.model("Customer", customerSchema);
