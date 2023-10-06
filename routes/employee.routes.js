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
  "/update/:id",
  accountantAuthenticate.verifyToken,
  employee.updateEmployee
);

// Delete Accountant
router.delete(
  "/delete/:id",
  accountantAuthenticate.verifyToken,
  employee.deleteEmployee
);

// Get Accountant by ID
router.get(
  "/myinfo/:id",
  accountantAuthenticate.verifyToken,
  employee.getEmployeeById
);

// // Get All
router.get(
  "/",
  accountantAuthenticate.verifyToken,
  employee.getAllEmployeesByAccountantId
);

// Get refresh token
router.get("/refresh-token", employee.refreshToken);

//get a employee by id
router.get(
  "/employeeinfo",
  employeeAuthenticate.verifyToken,
  employee.getEmployeeById
);
router.get(
  "/bank",
  employeeAuthenticate.verifyToken,
  employee.getAllBanksForAccountant
);

module.exports = router;
