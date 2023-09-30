const express = require("express");
const router = express.Router();
const {
  employeeAuthenticate,
  accountantAuthenticate,
} = require("../middleware"); // Replace with your authentication middleware
const { customer } = require("../controller"); // Replace with your customer controller

// Create Customer
router.post(
  "/create",
  accountantAuthenticate.verifyToken,
  customer.createCustomer
);

// Update Customer
router.put(
  "/update/:customerId",
  accountantAuthenticate.verifyToken,
  customer.updateCustomer
);

// Update Customer
router.put(
  "/add-bank/:customerId",
  accountantAuthenticate.verifyToken,
  customer.addBankToCustomer
);

// Update Customer
router.delete(
  "/remove-bank/",
  accountantAuthenticate.verifyToken,
  customer.removeBankFromCustomer
);

// Update Customer
router.put(
  "/edit-bank/",
  accountantAuthenticate.verifyToken,
  customer.editBankForCustomer
);

// Delete Customer
router.delete(
  "/delete/:customerId",
  accountantAuthenticate.verifyToken,
  customer.deleteCustomer
);

// Get Customer by ID
router.get(
  "/get/:customerId",
  accountantAuthenticate.verifyToken,
  customer.getCustomerById
);

// Get All Customers based on Accountant ID
router.get(
  "/getall",
  employeeAuthenticate.verifyToken,
  customer.getAllCustomers
);

module.exports = router;
