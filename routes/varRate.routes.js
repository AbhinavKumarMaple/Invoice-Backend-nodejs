const express = require("express");
const router = express.Router();
const { vatRate } = require("../controller"); // Import your controller methods
const { employeeAuthenticate } = require("../middleware"); // Replace with your authentication middleware

// Get all VAT rates by Employee ID or Accountant ID
router.get(
  "/",
  employeeAuthenticate.verifyToken, // Add your authentication middleware here
  vatRate.getAllVatRatesByEmployeeId
);

// Create a new VAT rate
router.post(
  "/",
  employeeAuthenticate.verifyToken, // Add your authentication middleware here
  vatRate.createVatRate
);

// Update VAT rate by ID
router.put(
  "/:id",
  employeeAuthenticate.verifyToken, // Add your authentication middleware here
  vatRate.updateVatRate
);

// Delete VAT rate by ID
router.delete(
  "/:id",
  employeeAuthenticate.verifyToken, // Add your authentication middleware here
  vatRate.deleteVatRate
);

module.exports = router;
