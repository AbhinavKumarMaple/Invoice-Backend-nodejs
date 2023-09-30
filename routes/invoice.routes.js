const express = require("express");
const router = express.Router();
const {
  accountantAuthenticate, // Import your authentication middleware
  employeeAuthenticate,
} = require("../middleware"); // Replace with your authentication middleware
const { invoice } = require("../controller"); // Import your invoice controller

// Create Invoice
router.post("/create", employeeAuthenticate.verifyToken, invoice.createInvoice);

// Update Invoice
router.put(
  "/:invoiceId",
  employeeAuthenticate.verifyToken,
  invoice.updateInvoiceById
);

// Delete Invoice
router.delete(
  "/:invoiceId",
  employeeAuthenticate.verifyToken,
  invoice.deleteInvoice
);

// Get All Invoices by Employee ID
router.get(
  "/allemployeeinvoice",
  employeeAuthenticate.verifyToken,
  invoice.getAllInvoicesForEmployee
);

// Get All Invoices by Accountant ID
router.get(
  "/allInvoice",
  accountantAuthenticate.verifyToken,
  invoice.getAllInvoicesForAccountant
);

// Get Invoice by ID
// router.get(
//   "/:invoiceId",
//   employeeAuthenticate.verifyToken,
//   invoice.getAllInvoicesByEmployeeId
// );

module.exports = router;
