const express = require("express");
const router = express.Router();
const { serviceDescription } = require("../controller"); // Import your controller methods
const { employeeAuthenticate } = require("../middleware"); // Replace with your authentication middleware

// Create a new service description
router.post(
  "/",
  employeeAuthenticate.verifyToken, // Add your authentication middleware here
  serviceDescription.createServiceDescription
);

// Get all service descriptions
router.get(
  "/",
  employeeAuthenticate.verifyToken, // Add your authentication middleware here
  serviceDescription.getAllServiceDescriptionsByEmployeeId
);

// // Get service description by ID
// router.get(
//   "/:id",
//   employeeAuthenticate.verifyToken, // Add your authentication middleware here
//   serviceDescription.getServiceDescriptionById
// );

// Update service description by ID
router.put(
  "/:id",
  employeeAuthenticate.verifyToken, // Add your authentication middleware here
  serviceDescription.updateServiceDescription
);

// Delete service description by ID
router.delete(
  "/:id",
  employeeAuthenticate.verifyToken, // Add your authentication middleware here
  serviceDescription.deleteServiceDescription
);

module.exports = router;
