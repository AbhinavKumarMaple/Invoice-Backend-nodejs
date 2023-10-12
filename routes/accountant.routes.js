const express = require("express");
const router = express.Router();
const {
  accountantAuthenticate,
  employeeAuthenticate,
} = require("../middleware"); // Replace with your authentication middleware
const { accountant } = require("../controller");

var multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

// Create Accountant
router.post("/register", accountant.createAccountant);

// Route for uploading an image for a specific accountant
router.post(
  "/upload-image",
  accountantAuthenticate.verifyToken,
  upload.single("image"), // Use 'image' as the field name for the uploaded file
  accountant.addImageToAccountant
);

// router.delete(
//   '/remove-image/:id',
//   accountantAuthenticate.verifyToken,
//   accountant.removeImageFromAccountant
// );

// login Accountant
router.post("/login", accountant.loginAccountant);
// Update Accountant
router.put(
  "/update",
  accountantAuthenticate.verifyToken,
  accountant.updateAccountant
);

router.get(
  "/getlogo",
  accountantAuthenticate.verifyToken,
  accountant.getAccountantLogos
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
  employeeAuthenticate.verifyToken,
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

// get invite link
router.post(
  "/invite",
  accountantAuthenticate.verifyToken,
  accountant.generateInviteLink
);

// // Get All
// router.get("/", accountantAuthenticate.verifyToken, getAllAccountants);

module.exports = router;
