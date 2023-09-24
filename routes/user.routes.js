const { userController } = require("../controller");
const { userAuthenticate } = require("../middleware");
const { adminAuthenticate } = require("../middleware");

const routes = require("express").Router();

//register vendorShop User
routes.post("/admin/register", userController.registerAdminUser);
routes.put(
  "/admin/:id",
  // userAuthenticate.verifyToken,
  userController.updateAdminUser
);
routes.post(
  "/admin/vendor_shop",
  adminAuthenticate.verifyToken,
  userController.createVendorShop
);

routes.post("/admin/login", userController.adminlogin);

routes.get(
  "/shopuser/:id",
  userAuthenticate.verifyToken,
  userController.getVendorShopEmployee
);
routes.get(
  "/shopusers",
  adminAuthenticate.verifyToken,
  userController.getAllUsersWithVendorShopRole
);

routes.get("/shops", userController.getAllVendorShops);
routes.post("/login", userController.loginVendorShopEmployee);
routes.post("/register", userController.registerVendorShopEmployee);
// routes.get("/ven", userController.getAllVendorShops);
routes.post(
  "/registerCustomer",
  userAuthenticate.verifyToken,
  userController.registerCustomer
);
routes.get(
  "/customers",
  userAuthenticate.verifyToken,
  userController.getCustomerShopsByVendorShopRoleId
);

// routes.get("/:id", userAuthenticate.verifyToken, userController.getUser);

routes.put(
  "/:id",
  userAuthenticate.verifyToken,
  userController.updateVendorShopEmployee
);
routes.get("/demo/api/", userController.demoFunc);
module.exports = routes;
