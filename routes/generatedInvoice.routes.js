const express = require("express");
const router = express.Router();
const {
  accountantAuthenticate,
  employeeAuthenticate,
} = require("../middleware"); // Replace with your authentication middleware
const { generateInvoice } = require("../controller");

var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'upload');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now());
    },
  });

var upload = multer({ storage: storage });

// Generate Invoice
router.post(
  "/create",
  employeeAuthenticate.verifyToken,
  upload.single('image'),
  generateInvoice.generateInvoice
);

// Route for uploading an image for a specific accountant
router.post(
  '/update-image',
  employeeAuthenticate.verifyToken,
  upload.single('image'), // Use 'image' as the field name for the uploaded file
  generateInvoice.updateLogoInGeneratedInvoice
);




// Update Generated Invoice
router.put(
  "/:id",
  employeeAuthenticate.verifyToken,
  generateInvoice.updateGeneratedInvoice
);

// Delete Generated Invoice
router.delete(
  "/:id",
  employeeAuthenticate.verifyToken,
  generateInvoice.deleteGeneratedInvoice
);

// Get All Generated Invoice by Employee
router.get(
  "/",
  employeeAuthenticate.verifyToken,
  generateInvoice.getGeneratedInvoiceByEmployee
);

// Get Generated Invoice by Employee ID
router.get(
  "/employee/:employeeid",
  accountantAuthenticate.verifyToken,
  generateInvoice.getAllGeneratedInvoiceByEmployeeId
);

// Get Generated Invoice by Accountant ID
// router.get(
//   "/accountant/:accountant_id",
//   accountantAuthenticate.verifyToken,
//   generateInvoice.getGeneratedInvoiceByAccountantId
// );

module.exports = router;
