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
  employeeAuthenticate.verifyToken,
  employee.getEmployeeById
);

// Get Accountant by ID
router.get(
  "/employeeinfo",
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
router.get("/refresh-token", employee.refreshToken);

router.get(
  "/bank",
  employeeAuthenticate.verifyToken,
  employee.getAllBanksForAccountant
);

// Get refresh token
router.post(
  "/addbank",
  accountantAuthenticate.verifyToken,
  employee.addBankToEmployee
);

// Get refresh token
router.delete(
  "/removebank/:bankId",
  accountantAuthenticate.verifyToken,
  employee.removeBankByIdFromEmployee
);

// Get refresh token
router.put(
  "/editbank/:bankId",
  accountantAuthenticate.verifyToken,
  employee.editBankByIdForEmployee
);

module.exports = router;
