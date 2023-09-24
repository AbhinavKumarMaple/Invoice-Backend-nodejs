const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../db/db");

// Function to register an admin user
const registerAdminUser = (req, res) => {
  const {
    Address1,
    Address2,
    Pincode,
    Number,
    PAN,
    Password,
    Email,
    StateName,
    UserName,
  } = req.body;

          // Hash the password
          const hashedPassword = getHashedPassword(Password);         
};

// Function to hash the password
const getHashedPassword = (password) => {
  const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUND));
  return bcrypt.hashSync(password, salt);
};

// Function to update admin user data
const updateAdminUser = (req, res) => {
  const {
    UserId,
    Address1,
    Address2,
    Pincode,
    Number,
    PAN,
    Password,
    Email,
    StateName,
    UserName,
  } = req.body;
          const hashedPassword = getHashedPassword(Password);
};

// Function to handle user login
const adminlogin = (req, res) => {
  const { Email, Password } = req.body;
  console.log(Email);

  try {
    // SQL query to fetch user by email
    const userQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(userQuery, [Email], (err, userResult) => {
      // Wrap Email inside an array
      if (err) {
        console.error("Error fetching user:", err);
        res.status(400).json({
          message: "Something Went Wrong! 1",
        });
      } else if (userResult.length === 0) {
        // User does not exist in the database
        res.status(400).json({
          message: "User Does Not Exist",
        });
      } else {
        const userExist = userResult[0];
        const userRole = userExist.roles_type_id; // Fetch the user's roles_type_id directly from the users table

        const isValid = comparePassword(Password, userExist.user_password);
        if (!isValid) {
          // Invalid password
          res.status(400).json({
            message: "Invalid Password or Email!",
          });
        } else {
          // Generate access and refresh tokens
          const accessToken = getJwtAccessToken({
            id: userExist.id,
            email: userExist.email,
            user_type: userRole,
          });
          const refreshToken = getJwtRefreshToken({
            id: userExist.id,
            email: userExist.email,
            user_type: userRole,
          });
          // Send tokens and user info as a response
          res.status(200).json({
            accessToken,
            refreshToken,
          });
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      message: "Something Went Wrong! 2",
    });
  }
};

// Function to generate JWT access token
function getJwtAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_TIME,
  });
}

// Function to generate JWT refresh token
const getJwtRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.REFRESH_TOKEN_TIME,
  });
};

// Function to compare password with hashed password
const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

const createVendorShop = (req, res) => {
  const {
    business_name,
    gstin,
    address_1,
    address_2,
    pincode,
    state_name,
    phone_number,
  } = req.body;

  // Find the owner email from the JWT token
  const ownerEmail = req.user.email;

  // Find the ownerId by querying the users table using the ownerEmail
  const findOwnerQuery = "SELECT id FROM users WHERE email = ?";
  connection.query(findOwnerQuery, [ownerEmail], (err, result) => {
    if (err) {
      console.error("Error finding owner:", err);
      return res.status(500).json({ error: "Error finding owner" });
    }

    if (result.length === 0) {
      // Owner with the provided email not found
      return res.status(404).json({ message: "Owner not found" });
    }

    const ownerId = result[0].id;

    // Create the state
    const createStateQuery = "INSERT INTO states (state_name) VALUES (?)";
    const createStateValues = [state_name];

    connection.query(
      createStateQuery,
      createStateValues,
      (err, stateResult) => {
        if (err) {
          console.error("Error creating state:", err);
          return res.status(500).json({ error: "Error creating state" });
        }

        const stateId = stateResult.insertId;

        // Create the address and link it to the state
        const createAddressQuery =
          "INSERT INTO addresses (address_1, address_2, pincode, state_id) VALUES (?, ?, ?, ?)";
        const createAddressValues = [address_1, address_2, pincode, stateId];

        connection.query(
          createAddressQuery,
          createAddressValues,
          (err, addressResult) => {
            if (err) {
              console.error("Error creating address:", err);
              return res.status(500).json({ error: "Error creating address" });
            }

            const addressId = addressResult.insertId;

            // Create the vendor shop record and link it to the address
            const createVendorShopQuery =
              "INSERT INTO vendor_shops (owner_id, business_name, gstin, phone_number, address_id) VALUES (?, ?, ?, ?, ?)";
            const createVendorShopValues = [
              ownerId,
              business_name,
              gstin,
              phone_number,
              addressId,
            ];

            connection.query(
              createVendorShopQuery,
              createVendorShopValues,
              (err, vendorShopResult) => {
                if (err) {
                  console.error("Error creating vendor shop:", err);
                  return res
                    .status(500)
                    .json({ error: "Error creating vendor shop" });
                }

                const vendorShopId = vendorShopResult.insertId;

                // Fetch the roles_type_id for the vendor shop role from the roles table
                const findRoleQuery =
                  "SELECT id FROM roles WHERE role_name = ?";
                const findRoleValues = ["admin"];
                connection.query(
                  findRoleQuery,
                  findRoleValues,
                  (err, roleResult) => {
                    if (err) {
                      console.error("Error finding vendor shop role:", err);
                      return res
                        .status(500)
                        .json({ error: "Error finding vendor shop role" });
                    }

                    if (roleResult.length === 0) {
                      // Role not found for vendor shop
                      return res
                        .status(404)
                        .json({ message: "Role Not Found" });
                    }

                    const roleId = roleResult[0].id;

                    // Create the record in the vendor_shops_roles table
                    const createVendorShopRoleQuery =
                      "INSERT INTO vendor_shops_roles (user_id, vendor_shop_id, roles_type_id) VALUES (?, ?, ?)";
                    const createVendorShopRoleValues = [
                      ownerId,
                      vendorShopId,
                      roleId,
                    ];
                    connection.query(
                      createVendorShopRoleQuery,
                      createVendorShopRoleValues,
                      (err, vendorShopRoleResult) => {
                        if (err) {
                          console.error(
                            "Error creating vendor shop role:",
                            err
                          );
                          return res
                            .status(500)
                            .json({ error: "Error creating vendor shop role" });
                        }

                        res.status(201).json({
                          message: "Vendor shop created successfully",
                          vendorShopId: vendorShopId,
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

const registerVendorShopEmployee = (req, res) => {
  const {
    vendorshop_id,
    role,
    Address1,
    Address2,
    pincode,
    phone_no,
    pan,
    password,
    email,
    state_name,
    user_name,
  } = req.body;

  // Step 1: Find the role_id for the given role name
  const findRoleQuery = "SELECT id FROM roles WHERE id = ?";
  const findRoleValues = [role];

  connection.query(findRoleQuery, findRoleValues, (err, roleResult) => {
    if (err) {
      console.error("Error finding role:", err);
      res.status(500).json({
        error: "Error finding role",
      });
    } else if (roleResult.length === 0) {
      // Role does not exist in the database
      res.status(400).json({
        message: "Role Does Not Exist",
      });
    } else {
      const roleId = role;

      // Step 2: Create states
      const stateQuery = "INSERT INTO states (state_name) VALUES (?)";
      const stateValues = [state_name];

      connection.query(stateQuery, stateValues, (err, stateResult) => {
        if (err) {
          console.error("Error creating state:", err);
          res.status(500).json({
            error: "Error creating state",
          });
        } else {
          const stateId = stateResult.insertId;

          // Step 3: Create the address and link it to the state
          const addressQuery =
            "INSERT INTO addresses (address_1, address_2, pincode, state_id) VALUES (?, ?, ?, ?)";
          const addressValues = [Address1, Address2, pincode, stateId];

          connection.query(
            addressQuery,
            addressValues,
            (err, addressResult) => {
              if (err) {
                console.error("Error creating address:", err);
                res.status(500).json({
                  error: "Error creating address",
                });
              } else {
                const addressId = addressResult.insertId;

                // Step 4: Hash the password
                const hashedPassword = getHashedPassword(password);

                // Step 5: Create the user and link it to the address
                const userQuery =
                  "INSERT INTO users (email, user_name, pan, phone_no, user_password, address_id, roles_type_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
                const userValues = [
                  email,
                  user_name,
                  pan,
                  phone_no,
                  hashedPassword,
                  addressId,
                  roleId,
                ];

                connection.query(userQuery, userValues, (err, userResult) => {
                  if (err) {
                    console.error("Error creating user:", err);
                    res.status(500).json({
                      error: "Error creating user",
                    });
                  } else {
                    const userId = userResult.insertId;

                    // Step 6: Create the vendor shop role and link required tables
                    const vendorShopRoleQuery =
                      "INSERT INTO vendor_shops_roles (user_id, vendor_shop_id, roles_type_id) VALUES (?, ?, ?)";
                    const vendorShopRoleValues = [
                      userId,
                      vendorshop_id,
                      roleId,
                    ];

                    connection.query(
                      vendorShopRoleQuery,
                      vendorShopRoleValues,
                      (err, vendorShopRoleResult) => {
                        if (err) {
                          console.error(
                            "Error creating vendor shop role:",
                            err
                          );
                          res.status(500).json({
                            error: "Error creating vendor shop role",
                          });
                        } else {
                          res.status(200).json({
                            message:
                              "Vendor shop employee registered successfully",
                            vendorShopRoleId: vendorShopRoleResult.insertId,
                          });
                        }
                      }
                    );
                  }
                });
              }
            }
          );
        }
      });
    }
  });
};

const getVendorShopEmployee = (req, res) => {
  const { id: vendorShopRoleId } = req.params;

  // Step 1: Find the user_id, vendor_shop_id, and roles_type_id for the given vendorShopRoleId
  const vendorShopRoleQuery =
    "SELECT user_id, vendor_shop_id, roles_type_id FROM vendor_shops_roles WHERE id = ?";
  const vendorShopRoleValues = [vendorShopRoleId];
  console.log(vendorShopRoleQuery);
  connection.query(
    vendorShopRoleQuery,
    vendorShopRoleValues,
    (err, vendorShopRoleResult) => {
      if (err) {
        console.error("Error finding vendor shop role:", err);
        res.status(500).json({
          error: "Error finding vendor shop role",
        });
      } else if (vendorShopRoleResult.length === 0) {
        res.status(404).json({
          message: "Vendor shop role not found.",
        });
      } else {
        const { user_id, vendor_shop_id, roles_type_id } =
          vendorShopRoleResult[0];

        // Step 2: Get user information from the users table
        const userQuery = "SELECT * FROM users WHERE id = ?";
        const userValues = [user_id];

        connection.query(userQuery, userValues, (err, userResult) => {
          if (err) {
            console.error("Error fetching user details:", err);
            res.status(500).json({
              error: "Error fetching user details",
            });
          } else if (userResult.length === 0) {
            res.status(404).json({
              message: "User not found.",
            });
          } else {
            const user = userResult[0];

            // Step 3: Get the role name from the roles table
            const roleQuery = "SELECT role_name FROM roles WHERE id = ?";
            const roleValues = [roles_type_id];

            connection.query(roleQuery, roleValues, (err, roleResult) => {
              if (err) {
                console.error("Error fetching role details:", err);
                res.status(500).json({
                  error: "Error fetching role details",
                });
              } else if (roleResult.length === 0) {
                res.status(404).json({
                  message: "Role not found.",
                });
              } else {
                const role = roleResult[0].role_name;

                // Step 4: Get the vendor shop details
                const vendorShopQuery =
                  "SELECT * FROM vendor_shops WHERE id = ?";
                const vendorShopValues = [vendor_shop_id];

                connection.query(
                  vendorShopQuery,
                  vendorShopValues,
                  (err, vendorShopResult) => {
                    if (err) {
                      console.error("Error fetching vendor shop details:", err);
                      res.status(500).json({
                        error: "Error fetching vendor shop details",
                      });
                    } else if (vendorShopResult.length === 0) {
                      res.status(404).json({
                        message: "Vendor shop not found.",
                      });
                    } else {
                      const vendorShop = vendorShopResult[0];

                      // Combine all information and send it in the response
                      res.status(200).json({
                        vendorShopRoleId,
                        user,
                        role,
                        vendorShop,
                      });
                    }
                  }
                );
              }
            });
          }
        });
      }
    }
  );
};

const loginVendorShopEmployee = (req, res) => {
  const { email, password } = req.body;

  try {
    // SQL query to fetch vendor shop employee by email
    const sql =
      "SELECT u.*, vsr.id as vendor_shop_role_id FROM users u LEFT JOIN vendor_shops_roles vsr ON u.id = vsr.user_id WHERE email = ?";
    // Assuming role_type_id for VendorShopEmployee is 2, change it if needed
    connection.query(sql, [email], (err, result) => {
      if (err) {
        console.error("Error fetching vendor shop employee:", err);
        res.status(400).json({
          message: "Something went wrong",
        });
      } else if (result.length === 0) {
        // Vendor shop employee does not exist in the database
        res.status(400).json({
          message: "Vendor Shop Employee Does Not Exist",
        });
      } else {
        const employee = result[0];
        const isValid = comparePassword(password, employee.user_password);
        if (!isValid) {
          // Invalid password
          res.status(400).json({
            message: "Invalid Password or Email!",
          });
        } else {
          // Generate access and refresh tokens
          const accessToken = getJwtAccessToken({
            id: employee.id,
            email: employee.email,
            user_type: employee.roles_type_id,
            vendor_shop_role_id: employee.vendor_shop_role_id,
          });
          const refreshToken = getJwtRefreshToken({
            id: employee.id,
            email: employee.email,
            user_type: employee.roles_type_id,
            vendor_shop_role_id: employee.vendor_shop_role_id,
          });
          // Send tokens and vendor_shop_role_id as a response
          res.status(200).json({
            accessToken,
            refreshToken,
          });
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const updateVendorShopEmployee = (req, res) => {
  const userId = req.params.id;
  const {
    email,
    user_name,
    pan,
    phone_no,
    password,
    roles_type_id,
    state_name,
    address_1,
    address_2,
    pincode,
    vendorshop_id,
  } = req.body;

  // Step 0: Validate required fields and data types
  if (
    !email ||
    !user_name ||
    !pan ||
    !phone_no ||
    !password ||
    !roles_type_id ||
    !state_name ||
    !address_1 ||
    !pincode ||
    !vendorshop_id ||
    typeof email !== "string" ||
    typeof user_name !== "string" ||
    typeof pan !== "string" ||
    typeof phone_no !== "string" ||
    typeof password !== "string" ||
    typeof roles_type_id !== "number" ||
    typeof state_name !== "string" ||
    typeof address_1 !== "string" ||
    typeof pincode !== "string" ||
    typeof vendorshop_id !== "number"
  ) {
    res.status(400).json({
      error: "All required fields must be provided with valid data types",
    });
    return;
  }

  // Check if the user exists
  const findUserQuery = "SELECT * FROM users WHERE id = ?";
  connection.query(findUserQuery, userId, (err, userResult) => {
    if (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({
        error: "Error fetching user",
      });
    } else if (userResult.length === 0) {
      // User does not exist
      res.status(404).json({
        message: "User Not Found",
      });
    } else {
      // Check if the vendor shop role exists for this user
      const findVendorShopRoleQuery =
        "SELECT * FROM vendor_shops_roles WHERE user_id = ?";
      connection.query(findVendorShopRoleQuery, userId, (err, roleResult) => {
        if (err) {
          console.error("Error fetching vendor shop role:", err);
          res.status(500).json({
            error: "Error fetching vendor shop role",
          });
        } else if (roleResult.length === 0) {
          // Vendor shop role not found for this user
          res.status(404).json({
            message: "Vendor Shop Role Not Found",
          });
        } else {
          // Check if the provided vendorshop_id exists
          const findVendorShopQuery = "SELECT * FROM vendor_shops WHERE id = ?";
          connection.query(
            findVendorShopQuery,
            vendorshop_id,
            (err, vendorShopResult) => {
              if (err) {
                console.error("Error fetching vendor shop:", err);
                res.status(500).json({
                  error: "Error fetching vendor shop",
                });
              } else if (vendorShopResult.length === 0) {
                // Vendor shop not found
                res.status(404).json({
                  message: "Vendor Shop Not Found",
                });
              } else {
                // Proceed with the updates

                // Step 1: Update the user table
                const updateUserQuery =
                  "UPDATE users SET email=?, user_name=?, pan=?, phone_no=?, user_password=?, roles_type_id=? WHERE id=?";
                const hashedPassword = getHashedPassword(password);
                const userValues = [
                  email,
                  user_name,
                  pan,
                  phone_no,
                  hashedPassword,
                  roles_type_id,
                  userId,
                ];

                connection.query(
                  updateUserQuery,
                  userValues,
                  (err, userResult) => {
                    if (err) {
                      console.error("Error updating user:", err);
                      res.status(500).json({
                        error: "Error updating user",
                      });
                    } else {
                      // Step 2: Get the address_id from the user table
                      const getAddressIdQuery =
                        "SELECT address_id FROM users WHERE id = ?";
                      connection.query(
                        getAddressIdQuery,
                        userId,
                        (err, addressResult) => {
                          if (err) {
                            console.error("Error getting address id:", err);
                            res.status(500).json({
                              error: "Error getting address id",
                            });
                          } else if (addressResult.length === 0) {
                            // Address not found for the user
                            res.status(404).json({
                              message: "Address Not Found",
                            });
                          } else {
                            const existingAddressId =
                              addressResult[0].address_id;

                            // Step 3: Update the address table
                            const updateAddressQuery =
                              "UPDATE addresses SET address_1=?, address_2=?, pincode=? WHERE id=?";
                            const addressValues = [
                              address_1,
                              address_2,
                              pincode,
                              existingAddressId,
                            ];

                            connection.query(
                              updateAddressQuery,
                              addressValues,
                              (err, addressResult) => {
                                if (err) {
                                  console.error("Error updating address:", err);
                                  res.status(500).json({
                                    error: "Error updating address",
                                  });
                                } else {
                                  // Step 4: Update the state table using the state_id from the addresses table
                                  const updateStateQuery =
                                    "UPDATE states SET state_name=? WHERE id=(SELECT state_id FROM addresses WHERE id=?)";
                                  const stateValues = [
                                    state_name,
                                    existingAddressId,
                                  ];

                                  connection.query(
                                    updateStateQuery,
                                    stateValues,
                                    (err, stateResult) => {
                                      if (err) {
                                        console.error(
                                          "Error updating state:",
                                          err
                                        );
                                        res.status(500).json({
                                          error: "Error updating state",
                                        });
                                      } else {
                                        // Step 5: Find the vendorshop_role_id for the given user_id
                                        const findVendorShopRoleIdQuery =
                                          "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
                                        connection.query(
                                          findVendorShopRoleIdQuery,
                                          userId,
                                          (err, vendorShopRoleResult) => {
                                            if (err) {
                                              console.error(
                                                "Error finding vendor shop role:",
                                                err
                                              );
                                              res.status(500).json({
                                                error:
                                                  "Error finding vendor shop role",
                                              });
                                            } else if (
                                              vendorShopRoleResult.length === 0
                                            ) {
                                              // Vendor shop role not found
                                              res.status(404).json({
                                                message:
                                                  "Vendor Shop Role Not Found",
                                              });
                                            } else {
                                              const vendorShopRoleId =
                                                vendorShopRoleResult[0].id;

                                              // Step 6: Update the vendor_shop_id in the vendor_shops_roles table
                                              const updateVendorShopIdQuery =
                                                "UPDATE vendor_shops_roles SET vendor_shop_id=? WHERE id=?";
                                              const vendorShopIdValue = [
                                                vendorshop_id,
                                                vendorShopRoleId,
                                              ];

                                              connection.query(
                                                updateVendorShopIdQuery,
                                                vendorShopIdValue,
                                                (
                                                  err,
                                                  vendorShopRoleUpdateResult
                                                ) => {
                                                  if (err) {
                                                    console.error(
                                                      "Error updating vendor shop role:",
                                                      err
                                                    );
                                                    res.status(500).json({
                                                      error:
                                                        "Error updating vendor shop role",
                                                    });
                                                  } else {
                                                    res.status(200).json({
                                                      message:
                                                        "Vendor Shop Employee Updated Successfully",
                                                    });
                                                  }
                                                }
                                              );
                                            }
                                          }
                                        );
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      });
    }
  });
};

const getUserInfo = (req, res) => {
  const userId = req.params.id;

  // Step 1: Fetch user information
  const getUserQuery =
    "SELECT u.id, u.email, u.user_name, u.pan, u.phone_no, u.created_at, u.updated_at, r.role_name, a.address_1, a.address_2, a.pincode, s.state_name, vs.business_name, vs.gstin, vs.phone_number FROM users u JOIN roles r ON u.roles_type_id = r.id JOIN addresses a ON u.address_id = a.id JOIN states s ON a.state_id = s.id JOIN vendor_shops_roles vsr ON u.id = vsr.user_id JOIN vendor_shops vs ON vsr.vendor_shop_id = vs.id WHERE u.id = ?";

  connection.query(getUserQuery, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user information:", err);
      res.status(500).json({
        error: "Error fetching user information",
      });
    } else if (result.length === 0) {
      // User not found
      res.status(404).json({
        message: "User Not Found",
      });
    } else {
      const userInfo = result[0];

      // Create a formatted response object
      const formattedResponse = {
        id: userInfo.id,
        email: userInfo.email,
        user_name: userInfo.user_name,
        pan: userInfo.pan,
        phone_no: userInfo.phone_no,
        created_at: userInfo.created_at,
        updated_at: userInfo.updated_at,
        role_name: userInfo.role_name,
        address: {
          address_1: userInfo.address_1,
          address_2: userInfo.address_2,
          pincode: userInfo.pincode,
          state_name: userInfo.state_name,
        },
        vendor_shop: {
          business_name: userInfo.business_name,
          gstin: userInfo.gstin,
          phone_number: userInfo.phone_number,
        },
      };

      res.status(200).json(formattedResponse);
    }
  });
};
const getAllUsersWithVendorShopRole = (req, res) => {
  const query =
    "SELECT u.id, u.email, u.user_name, u.pan, u.phone_no, u.created_at, u.updated_at, r.role_name, a.address_1, a.address_2, a.pincode, s.state_name, vs.business_name, vs.gstin, vs.phone_number " +
    "FROM users u " +
    "JOIN roles r ON u.roles_type_id = r.id " +
    "JOIN addresses a ON u.address_id = a.id " +
    "JOIN states s ON a.state_id = s.id " +
    "JOIN vendor_shops_roles vsr ON u.id = vsr.user_id " +
    "JOIN vendor_shops vs ON vsr.vendor_shop_id = vs.id";

  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching user information:", err);
      res.status(500).json({
        error: "Error fetching user information",
      });
    } else {
      res.status(200).json(result);
    }
  });
};
const getAllVendorShops = (req, res) => {
  const query = "SELECT id, business_name FROM vendor_shops";

  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching vendor shop information:", err);
      res.status(500).json({
        error: "Error fetching vendor shop information",
      });
    } else {
      res.status(200).json(result);
    }
  });
};

const registerCustomer = (req, res) => {
  const {
    customer_name,
    pan,
    phone_no,
    gstin,
    shop_name,
    address_1,
    address_2,
    pincode,
    state_name,
  } = req.body;

  // Step 0: Validate required fields and data types
  if (
    !customer_name ||
    !phone_no ||
    !shop_name ||
    !address_1 ||
    !pincode ||
    !state_name ||
    typeof customer_name !== "string" ||
    typeof phone_no !== "string" ||
    typeof shop_name !== "string" ||
    typeof address_1 !== "string" ||
    typeof pincode !== "string" ||
    typeof state_name !== "string" ||
    (gstin && typeof gstin !== "string") ||
    (pan && typeof pan !== "string")
  ) {
    res.status(400).json({
      error: "All required fields must be provided with valid data types",
    });
    return;
  }

  // Step 1: Check if the vendor shop role exists for the given ID
  const vendorShopRoleId = req.user.vendor_shop_role_id; // Assuming this value is available in the req.user object
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE id = ?";
  connection.query(
    findVendorShopRoleQuery,
    vendorShopRoleId,
    (err, vendorShopRoleResult) => {
      if (err) {
        console.error("Error checking vendor shop role:", err);
        res.status(500).json({
          error: "Error checking vendor shop role",
        });
      } else if (vendorShopRoleResult.length === 0) {
        res.status(404).json({
          message: "Vendor Shop Role Not Found",
        });
      } else {
        // Step 2: Add state info in the states table
        const insertStateQuery = "INSERT INTO states (state_name) VALUES (?)";
        const stateValues = [state_name];

        connection.query(insertStateQuery, stateValues, (err, stateResult) => {
          if (err) {
            console.error("Error adding state:", err);
            res.status(500).json({
              error: "Error adding state",
            });
          } else {
            const stateId = stateResult.insertId;

            // Step 3: Insert the address into the addresses table with the state_id
            const insertAddressQuery =
              "INSERT INTO addresses (address_1, address_2, pincode, state_id) VALUES (?, ?, ?, ?)";
            const addressValues = [address_1, address_2, pincode, stateId];

            connection.query(
              insertAddressQuery,
              addressValues,
              (err, addressResult) => {
                if (err) {
                  console.error("Error adding address:", err);
                  res.status(500).json({
                    error: "Error adding address",
                  });
                } else {
                  const addressId = addressResult.insertId;

                  // Step 4: Insert the customer into the customers table
                  const insertCustomerQuery =
                    "INSERT INTO customers (customer_name, pan) VALUES (?, ?)";
                  const customerValues = [customer_name, pan];

                  connection.query(
                    insertCustomerQuery,
                    customerValues,
                    (err, customerResult) => {
                      if (err) {
                        console.error("Error adding customer:", err);
                        res.status(500).json({
                          error: "Error adding customer",
                        });
                      } else {
                        const customerId = customerResult.insertId;

                        // Step 5: Insert the customer shop into the customer_shops table
                        const insertCustomerShopQuery =
                          "INSERT INTO customer_shops (customer_id, phone_no, gstin, shop_name, address_id, added_by, verified) VALUES (?, ?, ?, ?, ?, ?, ?)";
                        const addedBy = vendorShopRoleId;
                        const verified = 0; // Default value for the verified field is 0 (pending)
                        const customerShopValues = [
                          customerId,
                          phone_no,
                          gstin,
                          shop_name,
                          addressId,
                          addedBy,
                          verified,
                        ];

                        connection.query(
                          insertCustomerShopQuery,
                          customerShopValues,
                          (err, customerShopResult) => {
                            if (err) {
                              console.error("Error adding customer shop:", err);
                              res.status(500).json({
                                error: "Error adding customer shop",
                              });
                            } else {
                              res.status(200).json({
                                message: "Customer registered successfully",
                                customerId: customerId,
                                customerShopId: customerShopResult.insertId,
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    }
  );
};
const getCustomerShopsByVendorShopRoleId = (req, res) => {
  const vendorShopRoleId = req.user.vendor_shop_role_id;

  const getCustomerShopsQuery =
    "SELECT cs.id AS customer_shop_id, c.customer_name, cs.shop_name FROM customer_shops cs JOIN customers c ON cs.customer_id = c.id WHERE cs.added_by = ?";

  connection.query(getCustomerShopsQuery, vendorShopRoleId, (err, results) => {
    if (err) {
      console.error("Error fetching customer shops:", err);
      res.status(500).json({
        error: "Error fetching customer shops",
      });
    } else {
      res.status(200).json({
        customerShops: results,
      });
    }
  });
};

const demoFunc = (req, res) => {
  res.status(200).json({
    dome: "Got it",
  });
};

module.exports = {
  registerAdminUser,
  updateAdminUser,
  createVendorShop,
  adminlogin,
  registerVendorShopEmployee,
  loginVendorShopEmployee,
  getVendorShopEmployee,
  updateVendorShopEmployee,
  getUserInfo,
  getAllUsersWithVendorShopRole,
  getAllVendorShops,
  registerCustomer,
  getCustomerShopsByVendorShopRoleId,
  demoFunc,
};
