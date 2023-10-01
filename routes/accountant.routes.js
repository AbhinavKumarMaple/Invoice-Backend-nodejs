const express = require("express");
const router = express.Router();
const { accountantAuthenticate } = require("../middleware"); // Replace with your authentication middleware
const { accountant } = require("../controller");

// Create Accountant
router.post("/register", accountant.createAccountant);

// login Accountant
router.post("/login", accountant.loginAccountant);
// Update Accountant
router.put(
  "/update",
  accountantAuthenticate.verifyToken,
  accountant.updateAccountant
);

// Delete Accountant
router.delete(
  "/delete",
  accountantAuthenticate.verifyToken,
  accountant.deleteAccountant
);

// Get Accountant by ID
router.get(
  "/myinfo",
  accountantAuthenticate.verifyToken,
  accountant.getAccountantById
);

// Get refresh token
router.get(
  "/refresh-token",

  accountant.refreshToken
);

// Get refresh token
router.post(
  "/addbank",
  accountantAuthenticate.verifyToken,
  accountant.addBankToAccountant
);

// Get refresh token
router.delete(
  "/removebank/:bankId",
  accountantAuthenticate.verifyToken,
  accountant.removeBankByIdFromAccountant
);

// Get refresh token
router.put(
  "/editbank/:bankId",
  accountantAuthenticate.verifyToken,
  accountant.editBankByIdForAccountant
);

// // Get All
// router.get("/", accountantAuthenticate.verifyToken, getAllAccountants);

module.exports = router;
