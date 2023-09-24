const { productController } = require("../controller");
const { adminAuthenticate } = require("../middleware");
const { userAuthenticate } = require("../middleware");

const routes = require("express").Router();

// HSN routes
routes.get(
  "/hsn",
  adminAuthenticate.verifyToken,
  productController.getHSNsByUser
);
routes.get(
  "/hsn/:id",
  adminAuthenticate.verifyToken,
  productController.getHSNByUser
);
routes.put(
  "/hsn/:id",
  adminAuthenticate.verifyToken,
  productController.updateHSN
);

routes.post("/hsn", adminAuthenticate.verifyToken, productController.createHSN);
routes.delete(
  "/hsn/:id",
  adminAuthenticate.verifyToken,
  productController.deleteHSN
);
// // Unit routes
routes.get(
  "/units",
  adminAuthenticate.verifyToken,
  productController.getUnitsByUser
);

routes.get(
  "/units/:id",
  adminAuthenticate.verifyToken,
  productController.getUnitByUser
);

routes.post(
  "/units",
  adminAuthenticate.verifyToken,
  productController.createUnit
);

routes.put(
  "/units/:id",
  adminAuthenticate.verifyToken,
  productController.updateUnit
);
routes.delete(
  "/units/:id",
  adminAuthenticate.verifyToken,
  productController.deleteUnit
);

// // Brand routes
routes.get(
  "/brands/all",
  adminAuthenticate.verifyToken,
  productController.getBrandsByUser
);
routes.get(
  "/brands/:id",
  adminAuthenticate.verifyToken,
  productController.getBrandByUser
);
routes.post(
  "/brands",
  adminAuthenticate.verifyToken,
  productController.createBrand
);
routes.put(
  "/brands/:id",
  adminAuthenticate.verifyToken,
  productController.updateBrand
);
routes.delete(
  "/brands/:id",
  adminAuthenticate.verifyToken,
  productController.deleteBrand
);

// // Variant routes
routes.post(
  "/variants",
  adminAuthenticate.verifyToken,
  productController.createVariant
);
routes.get(
  "/variants",
  adminAuthenticate.verifyToken,
  productController.getVariants
);
routes.get(
  "/variants/:id",
  adminAuthenticate.verifyToken,
  productController.getVariant
);
routes.put(
  "/variants/:id",
  adminAuthenticate.verifyToken,
  productController.updateVariant
);
routes.delete(
  "/variants/:id",
  adminAuthenticate.verifyToken,
  productController.deleteVariant
);

// // Variant orders
routes.post(
  "/order",
  userAuthenticate.verifyToken,
  productController.createOrder
);
routes.delete(
  "/order/:id",
  userAuthenticate.verifyToken,
  productController.deleteOrder
);
routes.get(
  "/order/:id",
  userAuthenticate.verifyToken,
  productController.getOrder
);

// // allownace routes
routes.post(
  "/allowance",
  adminAuthenticate.verifyToken,
  productController.createAllowance
);

routes.get(
  "/allowance/:id",
  userAuthenticate.verifyToken,
  productController.getAllowance
);
routes.put(
  "/allowance/:id",
  adminAuthenticate.verifyToken,
  productController.updateAllowance
);
routes.delete(
  "/allowance/:id",
  userAuthenticate.verifyToken,
  productController.deleteAllowance
);
//get All Transection
routes.get(
  "/transactions/all",
  userAuthenticate.verifyToken,
  productController.getAllTransactionsByUser
);
// // Product routes
routes.post(
  "/create",
  adminAuthenticate.verifyToken,
  productController.createProduct
);
routes.get("/", userAuthenticate.verifyToken, productController.getProducts);
routes.get("/:id", userAuthenticate.verifyToken, productController.getProduct);
routes.put(
  "/:id",
  adminAuthenticate.verifyToken,
  productController.updateProduct
);
routes.delete(
  "/:id",
  adminAuthenticate.verifyToken,
  productController.deleteProduct
);
module.exports = routes;
