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
  "/accountant-refresh-token",

  accountant.refreshToken
);

// // Get All
// router.get("/", accountantAuthenticate.verifyToken, getAllAccountants);

module.exports = router;
