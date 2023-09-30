const express = require("express");
const router = express.Router();
const {
  employeeAuthenticate,
  accountantAuthenticate,
} = require("../middleware"); // Replace with your authentication middleware
const { employee } = require("../controller");

// Create Accountant
router.post(
  "/register",
  accountantAuthenticate.verifyToken,
  employee.createEmployee
);

// login Accountant
router.post("/login", employee.loginEmployee);
// Update Accountant
router.put(
  "/update",
  employeeAuthenticate.verifyToken,
  employee.updateEmployee
);

// Delete Accountant
router.delete(
  "/delete",
  employeeAuthenticate.verifyToken,
  employee.deleteEmployee
);

// Get Accountant by ID
router.get(
  "/myinfo",
  employeeAuthenticate.verifyToken,
  employee.getEmployeeById
);

// // Get All
router.get(
  "/",
  accountantAuthenticate.verifyToken,
  employee.getAllEmployeesByAccountantId
);

// Get refresh token
router.get(
  "/refresh-token",

  employee.refreshToken
);

module.exports = router;
