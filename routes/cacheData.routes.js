// const express = require("express");
// const router = express.Router();
// const { accountantAuthenticate } = require("../middleware"); // Replace with your authentication middleware
// const { vatRate } = require("../controllers/serviceDescriptionController");

// // // Service Description routes
// // router.get(
// //   "/service-descriptions/:employee_id",
// //   authenticate.verifyToken, // Replace with your authentication middleware
// //   getAllServiceDescriptionsByEmployeeId
// // );
// // router.post(
// //   "/service-descriptions",
// //   authenticate.verifyToken,
// //   createServiceDescription
// // );
// // router.put(
// //   "/service-descriptions/:id",
// //   authenticate.verifyToken,
// //   updateServiceDescription
// // );
// // router.delete(
// //   "/service-descriptions/:id",
// //   authenticate.verifyToken,
// //   deleteServiceDescription
// // );

// // VAT Rate routes
// router.get(
//   "/vat-rates/:employee_id",
//   authenticate.verifyToken, // Replace with your authentication middleware
//   vatRate.getAllVatRatesByEmployeeId
// );
// router.post("/vat-rates", authenticate.verifyToken, vatRate.createVatRate);
// router.put("/vat-rates/:id", authenticate.verifyToken, vatRate.updateVatRate);
// router.delete(
//   "/vat-rates/:id",
//   authenticate.verifyToken,
//   vatRate.deleteVatRate
// );

// // module.exports = router;
