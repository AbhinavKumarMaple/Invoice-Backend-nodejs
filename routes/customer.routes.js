const express = require("express");
const router = express.Router();
const { employeeAuthenticate } = require("../middleware");
const { customer } = require("../controller");

// Create Customer
router.post(
  "/create",
  employeeAuthenticate.verifyToken,
  customer.createCustomer
);

// Update Customer
router.put(
  "/update/:customerId",
  employeeAuthenticate.verifyToken,
  customer.updateCustomer
);

// Update Customer
router.put(
  "/add-bank/:customerId",
  employeeAuthenticate.verifyToken,
  customer.addBankToCustomer
);

// Update Customer
router.delete(
  "/remove-bank/",
  employeeAuthenticate.verifyToken,
  customer.removeBankFromCustomer
);

// Update Customer
router.put(
  "/edit-bank/",
  employeeAuthenticate.verifyToken,
  customer.editBankForCustomer
);

// Delete Customer
router.delete(
  "/delete/:id",
  employeeAuthenticate.verifyToken,
  customer.deleteCustomer
);

// Get Customer by ID
router.get(
  "/get/:customerId",
  employeeAuthenticate.verifyToken,
  customer.getCustomerById
);

// Get All Customers based on Accountant ID
router.get(
  "/getall",
  employeeAuthenticate.verifyToken,
  customer.getAllCustomers
);

module.exports = router;
