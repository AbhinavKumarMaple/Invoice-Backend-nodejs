const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware"); // Replace with your authentication middleware
const {
  getAllServiceDescriptionsByEmployeeId,
  createServiceDescription,
  updateServiceDescription,
  deleteServiceDescription,
} = require("../controllers/serviceDescriptionController");

const {
  getAllVatRatesByEmployeeId,
  createVatRate,
  updateVatRate,
  deleteVatRate,
} = require("../controllers/vatRateController");

// Service Description routes
router.get(
  "/service-descriptions/:employee_id",
  authenticate.verifyToken, // Replace with your authentication middleware
  getAllServiceDescriptionsByEmployeeId
);
router.post(
  "/service-descriptions",
  authenticate.verifyToken,
  createServiceDescription
);
router.put(
  "/service-descriptions/:id",
  authenticate.verifyToken,
  updateServiceDescription
);
router.delete(
  "/service-descriptions/:id",
  authenticate.verifyToken,
  deleteServiceDescription
);

// VAT Rate routes
router.get(
  "/vat-rates/:employee_id",
  authenticate.verifyToken, // Replace with your authentication middleware
  getAllVatRatesByEmployeeId
);
router.post("/vat-rates", authenticate.verifyToken, createVatRate);
router.put("/vat-rates/:id", authenticate.verifyToken, updateVatRate);
router.delete("/vat-rates/:id", authenticate.verifyToken, deleteVatRate);

module.exports = router;
