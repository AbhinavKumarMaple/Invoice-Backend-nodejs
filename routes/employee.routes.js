const express = require("express");
const router = express.Router();
const {
  employeeAuthenticate,
  accountantAuthenticate,
} = require("../middleware"); // Replace with your authentication middleware
const { employee } = require("../controller");

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
router.post(
  "/register",
  employeeAuthenticate.verifyToken,
  upload.single("image"),
  employee.createEmployee
);

// Route for uploading an image for a specific accountant
router.post(
  "/upload-image",
  employeeAuthenticate.verifyToken,
  upload.single("image"), // Use 'image' as the field name for the uploaded file
  employee.addImageToEmployee
);

router.delete(
  "/remove-image/:id",
  employeeAuthenticate.verifyToken,
  employee.removeImageFromAccountant
);

// login Accountant
router.post("/login", employee.loginEmployee);
// Update Accountant
router.put(
  "/update/:id",
  employeeAuthenticate.verifyToken,
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
  employeeAuthenticate.verifyToken,
  employee.addBankToEmployee
);

// Get refresh token
router.delete(
  "/removebank/:bankId",
  employeeAuthenticate.verifyToken,
  employee.removeBankByIdFromEmployee
);

// Get refresh token
router.put(
  "/editbank/:bankId",
  employeeAuthenticate.verifyToken,
  employee.editBankByIdForEmployee
);

module.exports = router;
