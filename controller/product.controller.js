const connection = require("../db/db");

const createBrand = (req, res) => {
  const { brand_name } = req.body;
  const added_by = req.user.id;
  
  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Create the brand and link it to the vendor_shop_role
    const createBrandQuery =
      "INSERT INTO brands (brand_name, added_by) VALUES (?, ?)";
    const createBrandValues = [brand_name, vendor_shop_role_id];

    connection.query(
      createBrandQuery,
      createBrandValues,
      (err, brandResult) => {
        if (err) {
          console.error("Error creating brand:", err);
          return res.status(500).json({ error: "Error creating brand" });
        }

        const brandId = brandResult.insertId;

        res.status(201).json({
          message: "Brand created successfully",
          brandId: brandId,
        });
      }
    );
  });
};
const updateBrand = (req, res) => {
  const { brand_name } = req.body;
  const brand_id = req.params.id;
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Check if the brand_id exists and is associated with the vendor_shop_role_id
    const findBrandQuery = "SELECT * FROM brands WHERE id = ? AND added_by = ?";
    const findBrandValues = [brand_id, vendor_shop_role_id];

    connection.query(findBrandQuery, findBrandValues, (err, brandResult) => {
      if (err) {
        console.error("Error finding brand:", err);
        return res.status(500).json({ error: "Error finding brand" });
      }

      if (brandResult.length === 0) {
        // Brand not found or not associated with the user
        return res.status(404).json({ message: "Brand Not Found" });
      }

      // Update the brand_name
      const updateBrandQuery = "UPDATE brands SET brand_name = ? WHERE id = ?";
      const updateBrandValues = [brand_name, brand_id];

      connection.query(updateBrandQuery, updateBrandValues, (err) => {
        if (err) {
          console.error("Error updating brand:", err);
          return res.status(500).json({ error: "Error updating brand" });
        }

        res.status(200).json({
          message: "Brand updated successfully",
          brandId: brand_id,
        });
      });
    });
  });
};
const deleteBrand = (req, res) => {
  const brandId = req.params.id; // The ID of the brand to be deleted
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Check if the brand to be deleted is associated with the vendor shop role of the authenticated user
    const checkBrandOwnershipQuery =
      "SELECT id FROM brands WHERE id = ? AND added_by = ?";
    connection.query(
      checkBrandOwnershipQuery,
      [brandId, vendor_shop_role_id],
      (err, brandResult) => {
        if (err) {
          console.error("Error checking brand ownership:", err);
          return res
            .status(500)
            .json({ error: "Error checking brand ownership" });
        }

        if (brandResult.length === 0) {
          // The brand does not belong to the vendor shop role of the authenticated user
          return res
            .status(403)
            .json({ message: "You are not authorized to delete this brand" });
        }

        // Delete the brand
        const deleteBrandQuery = "DELETE FROM brands WHERE id = ?";
        connection.query(deleteBrandQuery, [brandId], (err) => {
          if (err) {
            console.error("Error deleting brand:", err);
            return res.status(500).json({ error: "Error deleting brand" });
          }

          res.status(200).json({
            message: "Brand deleted successfully",
          });
        });
      }
    );
  });
};

const getBrandByUser = (req, res) => {
  const brandId = req.params.id;
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Fetch the brand with the given id linked to the vendor_shop_role
    const getBrandQuery = "SELECT * FROM brands WHERE id = ? AND added_by = ?";
    connection.query(
      getBrandQuery,
      [brandId, vendor_shop_role_id],
      (err, brandResult) => {
        if (err) {
          console.error("Error fetching brand:", err);
          return res.status(500).json({ error: "Error fetching brand" });
        }

        if (brandResult.length === 0) {
          // Brand not found for the user
          return res.status(404).json({ message: "Brand Not Found" });
        }

        res.status(200).json(brandResult[0]);
      }
    );
  });
};

const getBrandsByUser = (req, res) => {
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Fetch all brands linked to the vendor_shop_role
    const getBrandsQuery = "SELECT * FROM brands WHERE added_by = ?";
    connection.query(
      getBrandsQuery,
      [vendor_shop_role_id],
      (err, brandsResult) => {
        if (err) {
          console.error("Error fetching brands:", err);
          return res.status(500).json({ error: "Error fetching brands" });
        }

        res.status(200).json(brandsResult);
      }
    );
  });
};
const createUnit = (req, res) => {
  const { unit_name } = req.body;
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Create the unit and link it to the vendor_shop_role
    const createUnitQuery =
      "INSERT INTO units (unit_name, added_by) VALUES (?, ?)";
    const createUnitValues = [unit_name, vendor_shop_role_id];

    connection.query(createUnitQuery, createUnitValues, (err, unitResult) => {
      if (err) {
        console.error("Error creating unit:", err);
        return res.status(500).json({ error: "Error creating unit" });
      }

      const unitId = unitResult.insertId;

      res.status(201).json({
        message: "Unit created successfully",
        unitId: unitId,
      });
    });
  });
};

const getUnitsByUser = (req, res) => {
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Fetch all units linked to the vendor_shop_role
    const getUnitsQuery = "SELECT * FROM units WHERE added_by = ?";
    connection.query(
      getUnitsQuery,
      [vendor_shop_role_id],
      (err, unitsResult) => {
        if (err) {
          console.error("Error fetching units:", err);
          return res.status(500).json({ error: "Error fetching units" });
        }

        res.status(200).json(unitsResult);
      }
    );
  });
};
const deleteUnit = (req, res) => {
  const unitId = req.params.id; // The ID of the unit to be deleted
  const user_id = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Check if the unit with the given ID is associated with the vendor_shop_role_id
    const findUnitQuery = "SELECT id FROM units WHERE id = ? AND added_by = ?";
    connection.query(
      findUnitQuery,
      [unitId, vendor_shop_role_id],
      (err, unitResult) => {
        if (err) {
          console.error("Error finding unit:", err);
          return res.status(500).json({ error: "Error finding unit" });
        }

        if (unitResult.length === 0) {
          // Unit not found or not associated with the vendor shop role
          return res.status(404).json({ message: "Unit Not Found" });
        }

        // Delete the unit
        const deleteUnitQuery = "DELETE FROM units WHERE id = ?";
        connection.query(deleteUnitQuery, [unitId], (err) => {
          if (err) {
            console.error("Error deleting unit:", err);
            return res.status(500).json({ error: "Error deleting unit" });
          }

          res.status(200).json({
            message: "Unit deleted successfully",
            unitId: unitId,
          });
        });
      }
    );
  });
};
const updateUnit = (req, res) => {
  const unitId = req.params.id;
  const { unit_name } = req.body;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Update the unit entry based on the provided unit ID and vendor shop role
    const updateUnitQuery =
      "UPDATE units SET unit_name=? WHERE id=? AND added_by=?";
    const updateUnitValues = [unit_name, unitId, vendor_shop_role_id];

    connection.query(updateUnitQuery, updateUnitValues, (err, result) => {
      if (err) {
        console.error("Error updating unit:", err);
        return res.status(500).json({ error: "Error updating unit" });
      }

      if (result.affectedRows === 0) {
        // Unit with the provided ID and vendor shop role not found
        return res.status(404).json({ message: "Unit Not Found" });
      }

      res.status(200).json({
        message: "Unit updated successfully",
        unitId: unitId,
      });
    });
  });
};

const getUnitByUser = (req, res) => {
  const unitId = req.params.id;
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Fetch the unit with the given id linked to the vendor_shop_role
    const getUnitQuery = "SELECT * FROM units WHERE id = ? AND added_by = ?";
    connection.query(
      getUnitQuery,
      [unitId, vendor_shop_role_id],
      (err, unitResult) => {
        if (err) {
          console.error("Error fetching unit:", err);
          return res.status(500).json({ error: "Error fetching unit" });
        }

        if (unitResult.length === 0) {
          // Unit not found for the user
          return res.status(404).json({ message: "Unit Not Found" });
        }

        res.status(200).json(unitResult[0]);
      }
    );
  });
};

const createHSN = (req, res) => {
  const { code, gst_rate, cgst_rate, sgst_rate, igst_rate } = req.body;
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Create the HSN and link it to the vendor_shop_role
    const createHSNQuery =
      "INSERT INTO hsn (code, gst_rate, cgst_rate, sgst_rate, igst_rate, added_by) VALUES (?, ?, ?, ?, ?, ?)";
    const createHSNValues = [
      code,
      gst_rate,
      cgst_rate,
      sgst_rate,
      igst_rate,
      vendor_shop_role_id,
    ];

    connection.query(createHSNQuery, createHSNValues, (err, hsnResult) => {
      if (err) {
        console.error("Error creating HSN:", err);
        return res.status(500).json({ error: "Error creating HSN" });
      }

      const hsnId = hsnResult.insertId;

      res.status(201).json({
        message: "HSN created successfully",
        hsnId: hsnId,
      });
    });
  });
};
const getHSNsByUser = (req, res) => {
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Fetch all HSNs linked to the vendor_shop_role
    const getHSNsQuery = "SELECT * FROM hsn WHERE added_by = ?";
    connection.query(getHSNsQuery, [vendor_shop_role_id], (err, hsnResult) => {
      if (err) {
        console.error("Error fetching HSNs:", err);
        return res.status(500).json({ error: "Error fetching HSNs" });
      }

      res.status(200).json(hsnResult);
    });
  });
};

const getHSNByUser = (req, res) => {
  const hsnId = req.params.id;
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Fetch the HSN with the given id linked to the vendor_shop_role
    const getHSNQuery = "SELECT * FROM hsn WHERE id = ? AND added_by = ?";
    connection.query(
      getHSNQuery,
      [hsnId, vendor_shop_role_id],
      (err, hsnResult) => {
        if (err) {
          console.error("Error fetching HSN:", err);
          return res.status(500).json({ error: "Error fetching HSN" });
        }

        if (hsnResult.length === 0) {
          // HSN not found for the user
          return res.status(404).json({ message: "HSN Not Found" });
        }

        res.status(200).json(hsnResult[0]);
      }
    );
  });
};
const updateHSN = (req, res) => {
  const hsnId = req.params.id;
  const { code, gst_rate, cgst_rate, sgst_rate, igst_rate } = req.body;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Update the HSN entry based on the provided HSN ID and vendor shop role
    const updateHSNQuery =
      "UPDATE hsn SET code=?, gst_rate=?, cgst_rate=?, sgst_rate=?, igst_rate=? WHERE id=? AND added_by=?";
    const updateHSNValues = [
      code,
      gst_rate,
      cgst_rate,
      sgst_rate,
      igst_rate,
      hsnId,
      vendor_shop_role_id,
    ];

    connection.query(updateHSNQuery, updateHSNValues, (err, result) => {
      if (err) {
        console.error("Error updating HSN:", err);
        return res.status(500).json({ error: "Error updating HSN" });
      }

      if (result.affectedRows === 0) {
        // HSN with the provided ID and vendor shop role not found
        return res.status(404).json({ message: "HSN Not Found" });
      }

      res.status(200).json({
        message: "HSN updated successfully",
        hsnId: hsnId,
      });
    });
  });
};
const deleteHSN = (req, res) => {
  const hsnId = req.params.id;
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Check if the HSN with the given ID is associated with the vendor shop role of the authenticated user
    const findHSNQuery = "SELECT * FROM hsn WHERE id = ? AND added_by = ?";
    connection.query(
      findHSNQuery,
      [hsnId, vendor_shop_role_id],
      (err, hsnResult) => {
        if (err) {
          console.error("Error finding HSN:", err);
          return res.status(500).json({ error: "Error finding HSN" });
        }

        if (hsnResult.length === 0) {
          // HSN not found or not associated with the user
          return res.status(404).json({ message: "HSN Not Found" });
        }

        // Delete the HSN from the database
        const deleteHSNQuery = "DELETE FROM hsn WHERE id = ?";
        connection.query(deleteHSNQuery, [hsnId], (err) => {
          if (err) {
            console.error("Error deleting HSN:", err);
            return res.status(500).json({ error: "Error deleting HSN" });
          }

          res.status(200).json({
            message: "HSN deleted successfully",
            hsnId: hsnId,
          });
        });
      }
    );
  });
};

const createProduct = (req, res) => {
  const { product_name, brand_id, hsn_id } = req.body;
  const added_by = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [added_by], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Create the product and link it to the vendor_shop_role
    const createProductQuery =
      "INSERT INTO products (product_name, brand_id, hsn_id, added_by) VALUES (?, ?, ?, ?)";
    const createProductValues = [
      product_name,
      brand_id,
      hsn_id,
      vendor_shop_role_id,
    ];

    connection.query(
      createProductQuery,
      createProductValues,
      (err, productResult) => {
        if (err) {
          console.error("Error creating product:", err);
          return res.status(500).json({ error: "Error creating product" });
        }

        const productId = productResult.insertId;

        res.status(201).json({
          message: "Product created successfully",
          productId: productId,
        });
      }
    );
  });
};
const getProducts = (req, res) => {
  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Get all products associated with the vendor_shop_role_id
    const getProductsQuery = "SELECT * FROM products WHERE added_by = ?";
    connection.query(
      getProductsQuery,
      [vendor_shop_role_id],
      (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          return res.status(500).json({ error: "Error fetching products" });
        }

        res.status(200).json(products);
      }
    );
  });
};
const getProduct = (req, res) => {
  const productId = req.params.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Get the product associated with the given product ID and vendor_shop_role_id
    const getProductQuery =
      "SELECT * FROM products WHERE id = ? AND added_by = ?";
    connection.query(
      getProductQuery,
      [productId, vendor_shop_role_id],
      (err, product) => {
        if (err) {
          console.error("Error fetching product:", err);
          return res.status(500).json({ error: "Error fetching product" });
        }

        if (product.length === 0) {
          // Product with the provided ID and vendor shop role not found
          return res.status(404).json({ message: "Product Not Found" });
        }

        res.status(200).json(product[0]);
      }
    );
  });
};
const updateProduct = (req, res) => {
  const productId = req.params.id;
  const { product_name, brand_id, hsn_id } = req.body;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Update the product entry based on the provided product ID and vendor shop role
    const updateProductQuery =
      "UPDATE products SET product_name=?, brand_id=?, hsn_id=? WHERE id=? AND added_by=?";
    const updateProductValues = [
      product_name,
      brand_id,
      hsn_id,
      productId,
      vendor_shop_role_id,
    ];

    connection.query(updateProductQuery, updateProductValues, (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).json({ error: "Error updating product" });
      }

      if (result.affectedRows === 0) {
        // Product with the provided ID and vendor shop role not found
        return res.status(404).json({ message: "Product Not Found" });
      }

      res.status(200).json({
        message: "Product updated successfully",
        productId: productId,
      });
    });
  });
};
const deleteProduct = (req, res) => {
  const productId = req.params.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Check if the product can be deleted by verifying the vendor shop role
    const deleteProductQuery =
      "DELETE FROM products WHERE id = ? AND added_by = ?";
    connection.query(
      deleteProductQuery,
      [productId, vendor_shop_role_id],
      (err, result) => {
        if (err) {
          console.error("Error deleting product:", err);
          return res.status(500).json({ error: "Error deleting product" });
        }

        if (result.affectedRows === 0) {
          // Product with the provided ID and vendor shop role not found
          return res.status(404).json({ message: "Product Not Found" });
        }

        res.status(200).json({
          message: "Product deleted successfully",
          productId: productId,
        });
      }
    );
  });
};

const createVariant = (req, res) => {
  const {
    product_id,
    unit_id,
    variant_name,
    price,
    quantity,
    order_quantity,
    mrp,
  } = req.body;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const added_by = result[0].id;

    // Create the variant and link it to the vendor_shop_role
    const createVariantQuery =
      "INSERT INTO variants (product_id, unit_id, variant_name, price, quantity, added_by, order_quantity, mrp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const createVariantValues = [
      product_id,
      unit_id,
      variant_name,
      price,
      quantity,
      added_by,
      order_quantity,
      mrp,
    ];

    connection.query(
      createVariantQuery,
      createVariantValues,
      (err, variantResult) => {
        if (err) {
          console.error("Error creating variant:", err);
          return res.status(500).json({ error: "Error creating variant" });
        }

        const variantId = variantResult.insertId;

        // Create the variant stock and link it to the variant
        const createVariantStockQuery =
          "INSERT INTO variant_stock (variant_id, incoming_quantity, outgoing_quantity, current_stock, added_by) VALUES (?, ?, ?, ?, ?)";
        const createVariantStockValues = [
          variantId,
          quantity,
          0,
          quantity,
          added_by,
        ];

        connection.query(
          createVariantStockQuery,
          createVariantStockValues,
          (err, stockResult) => {
            if (err) {
              console.error("Error creating variant stock:", err);
              return res
                .status(500)
                .json({ error: "Error creating variant stock" });
            }

            res.status(201).json({
              message: "Variant created successfully",
              variantId: variantId,
            });
          }
        );
      }
    );
  });
};
const getVariants = (req, res) => {
  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const added_by = result[0].id;

    // Get all variants associated with the vendor_shop_role_id
    const getVariantsQuery = "SELECT * FROM variants WHERE added_by = ?";
    connection.query(getVariantsQuery, [added_by], (err, variants) => {
      if (err) {
        console.error("Error fetching variants:", err);
        return res.status(500).json({ error: "Error fetching variants" });
      }

      res.status(200).json(variants);
    });
  });
};

const getVariant = (req, res) => {
  const variantId = req.params.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const added_by = result[0].id;

    // Get the variant associated with the vendor_shop_role_id and variantId
    const getVariantQuery =
      "SELECT * FROM variants WHERE id = ? AND added_by = ?";
    connection.query(getVariantQuery, [variantId, added_by], (err, variant) => {
      if (err) {
        console.error("Error fetching variant:", err);
        return res.status(500).json({ error: "Error fetching variant" });
      }

      if (variant.length === 0) {
        // Variant not found for the user
        return res.status(404).json({ message: "Variant Not Found" });
      }

      res.status(200).json(variant[0]);
    });
  });
};
const deleteVariant = (req, res) => {
  const variantId = req.params.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const added_by = result[0].id;

    // Delete the variant associated with the vendor_shop_role_id and variantId
    const deleteVariantQuery = "DELETE FROM variants WHERE id=? AND added_by=?";
    const deleteVariantValues = [variantId, added_by];

    connection.query(
      deleteVariantQuery,
      deleteVariantValues,
      (err, variantResult) => {
        if (err) {
          console.error("Error deleting variant:", err);
          return res.status(500).json({ error: "Error deleting variant" });
        }

        if (variantResult.affectedRows === 0) {
          // Variant not found or not owned by the user
          return res.status(404).json({ message: "Variant Not Found" });
        }

        // Also delete the variant stock associated with the variant
        const deleteVariantStockQuery =
          "DELETE FROM variant_stock WHERE variant_id=?";
        connection.query(
          deleteVariantStockQuery,
          [variantId],
          (err, stockResult) => {
            if (err) {
              console.error("Error deleting variant stock:", err);
              return res
                .status(500)
                .json({ error: "Error deleting variant stock" });
            }

            res.status(200).json({
              message: "Variant deleted successfully",
              variantId: variantId,
            });
          }
        );
      }
    );
  });
};
const updateVariant = (req, res) => {
  const variantId = req.params.id;
  const {
    product_id,
    unit_id,
    variant_name,
    price,
    quantity,
    order_quantity,
    mrp,
    incoming_quantity,
    outgoing_quantity,
    current_stock,
  } = req.body;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [req.user.id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const added_by = result[0].id;

    // Update the variant associated with the vendor_shop_role_id and variantId
    const updateVariantQuery =
      "UPDATE variants SET product_id=?, unit_id=?, variant_name=?, price=?, quantity=?, order_quantity=?, mrp=? WHERE id=? AND added_by=?";
    const updateVariantValues = [
      product_id,
      unit_id,
      variant_name,
      price,
      quantity,
      order_quantity,
      mrp,
      variantId,
      added_by,
    ];

    connection.query(
      updateVariantQuery,
      updateVariantValues,
      (err, variantResult) => {
        if (err) {
          console.error("Error updating variant:", err);
          return res.status(500).json({ error: "Error updating variant" });
        }

        if (variantResult.affectedRows === 0) {
          // Variant not found or not owned by the user
          return res.status(404).json({ message: "Variant Not Found" });
        }

        // Update the variant stock associated with the variant
        const updateVariantStockQuery =
          "UPDATE variant_stock SET incoming_quantity=?, outgoing_quantity=?, current_stock=? WHERE variant_id=? AND added_by=?";
        const incoming =
          incoming_quantity !== undefined ? incoming_quantity : quantity;
        const outgoing =
          outgoing_quantity !== undefined ? outgoing_quantity : 0;
        const current =
          current_stock !== undefined
            ? current_stock
            : incoming_quantity !== undefined && outgoing_quantity !== undefined
            ? incoming_quantity - outgoing_quantity
            : quantity;

        const updateVariantStockValues = [
          incoming,
          outgoing,
          current,
          variantId,
          added_by,
        ];

        connection.query(
          updateVariantStockQuery,
          updateVariantStockValues,
          (err, stockResult) => {
            if (err) {
              console.error("Error updating variant stock:", err);
              return res
                .status(500)
                .json({ error: "Error updating variant stock" });
            }

            res.status(200).json({
              message: "Variant updated successfully",
              variantId: variantId,
            });
          }
        );
      }
    );
  });
};

// const createOrder = (req, res) => {
//   const { customer_id, order_items } = req.body;
//   const user_id = req.user.id;

//   // Find the vendor_shop_role_id and vendor_shop_id for the given user_id
//   const findVendorShopQuery =
//     "SELECT vsr.id as vendor_shop_role_id, vs.id as vendor_shop_id " +
//     "FROM vendor_shops_roles vsr " +
//     "JOIN vendor_shops vs ON vsr.vendor_shop_id = vs.id " +
//     "WHERE vsr.user_id = ?";

//   connection.query(findVendorShopQuery, [user_id], (err, result) => {
//     if (err) {
//       console.error("Error finding vendor shop:", err);
//       return res.status(500).json({ error: "Error finding vendor shop" });
//     }

//     if (result.length === 0) {
//       // Vendor shop not found for the user
//       return res.status(404).json({ message: "Vendor Shop Not Found" });
//     }

//     const { vendor_shop_role_id, vendor_shop_id } = result[0];

//     // Create the order and link it to the vendor_shop_id and customer_id
//     const createOrderQuery =
//       "INSERT INTO orders (vendor_shop_id, added_by, customer_shops) VALUES (?, ?, ?)";
//     const createOrderValues = [
//       vendor_shop_id,
//       vendor_shop_role_id,
//       customer_id,
//     ];

//     connection.query(
//       createOrderQuery,
//       createOrderValues,
//       (err, orderResult) => {
//         if (err) {
//           console.error("Error creating order:", err);
//           return res.status(500).json({ error: "Error creating order" });
//         }

//         const orderId = orderResult.insertId;

//         // Create the order items and link them to the order
//         const createOrderItemsQuery =
//           "INSERT INTO order_items (order_id, product_name, variant_price, gst_price, selling_price, max_retail_price, quantity) VALUES ?";
//         const orderItemsValues = order_items.map((item) => [
//           orderId,
//           item.product_name,
//           item.variant_price,
//           item.gst_price,
//           item.selling_price,
//           item.max_retail_price,
//           item.quantity,
//         ]);

//         connection.query(createOrderItemsQuery, [orderItemsValues], (err) => {
//           if (err) {
//             console.error("Error creating order items:", err);
//             return res
//               .status(500)
//               .json({ error: "Error creating order items" });
//           }

//           // Get the customer name associated with the customer_id
//           const getCustomerNameQuery =
//             "SELECT customer_name FROM customers WHERE id = ?";
//           connection.query(
//             getCustomerNameQuery,
//             [customer_id],
//             (err, customerResult) => {
//               if (err) {
//                 console.error("Error fetching customer name:", err);
//                 return res
//                   .status(500)
//                   .json({ error: "Error fetching customer name" });
//               }

//               if (customerResult.length === 0) {
//                 // Customer not found with the provided customer_id
//                 return res.status(404).json({ message: "Customer Not Found" });
//               }

//               const customer_name = customerResult[0].customer_name;

//               // Fetch all the order items associated with the order_id
//               const getOrderItemsQuery =
//                 "SELECT * FROM order_items WHERE order_id = ?";
//               connection.query(
//                 getOrderItemsQuery,
//                 [orderId],
//                 (err, itemsResult) => {
//                   if (err) {
//                     console.error("Error fetching order items:", err);
//                     return res
//                       .status(500)
//                       .json({ error: "Error fetching order items" });
//                   }

//                   res.status(201).json({
//                     message: "Order created successfully",
//                     orderId: orderId,
//                     customer_name: customer_name,
//                     items: itemsResult,
//                   });
//                 }
//               );
//             }
//           );
//         });
//       }
//     );
//   });
// };
const createOrder = (req, res) => {
  const { customer_id, order_items } = req.body;
  const user_id = req.user.id;

  // Step 1: Fetch the allowance percentage from the price_allowance table
  const getAllowanceQuery =
    "SELECT allowance FROM price_allowance WHERE added_by = (SELECT vendor_shop_id FROM vendor_shops_roles WHERE user_id = ?)";
  connection.query(getAllowanceQuery, [user_id], (err, allowanceResult) => {
    if (err) {
      console.error("Error fetching allowance:", err);
      return res.status(500).json({ error: "Error fetching allowance" });
    }

    if (allowanceResult.length === 0) {
      // Allowance not found for the user
      return res.status(404).json({ message: "Allowance Not Found" });
    }

    const allowancePercentage = allowanceResult[0].allowance;

    // Step 2: Verify the selling price of each order item
    for (const item of order_items) {
      const variantPrice = item.variant_price;
      const minAllowedPrice =
        variantPrice - (variantPrice * allowancePercentage) / 100;
      const maxAllowedPrice =
        variantPrice + (variantPrice * allowancePercentage) / 100;
      const sellingPrice = item.selling_price;

      if (sellingPrice < minAllowedPrice || sellingPrice > maxAllowedPrice) {
        return res
          .status(400)
          .json({ message: "Selling price not within allowed range" });
      }
    }

    // Step 3: Find the vendor_shop_role_id and vendor_shop_id for the given user_id
    const findVendorShopQuery =
      "SELECT vsr.id as vendor_shop_role_id, vs.id as vendor_shop_id " +
      "FROM vendor_shops_roles vsr " +
      "JOIN vendor_shops vs ON vsr.vendor_shop_id = vs.id " +
      "WHERE vsr.user_id = ?";

    connection.query(findVendorShopQuery, [user_id], (err, result) => {
      if (err) {
        console.error("Error finding vendor shop:", err);
        return res.status(500).json({ error: "Error finding vendor shop" });
      }

      if (result.length === 0) {
        // Vendor shop not found for the user
        return res.status(404).json({ message: "Vendor Shop Not Found" });
      }

      const { vendor_shop_role_id, vendor_shop_id } = result[0];

      // Step 4: Create the order and link it to the vendor_shop_id and customer_shops
      const createOrderQuery =
        "INSERT INTO orders (vendor_shop_id, added_by, customer_shops) VALUES (?, ?, ?)";
      const createOrderValues = [
        vendor_shop_id,
        vendor_shop_role_id,
        customer_id,
      ];

      connection.query(
        createOrderQuery,
        createOrderValues,
        (err, orderResult) => {
          if (err) {
            console.error("Error creating order:", err);
            return res.status(500).json({ error: "Error creating order" });
          }

          const orderId = orderResult.insertId;

          // Step 5: Create the order items and link them to the order
          const createOrderItemsQuery =
            "INSERT INTO order_items (order_id, product_name, variant_price, gst_price, selling_price, max_retail_price, quantity) VALUES ?";
          const orderItemsValues = order_items.map((item) => [
            orderId,
            item.product_name,
            item.variant_price,
            item.gst_price,
            item.selling_price,
            item.max_retail_price,
            item.quantity,
          ]);

          connection.query(createOrderItemsQuery, [orderItemsValues], (err) => {
            if (err) {
              console.error("Error creating order items:", err);
              return res
                .status(500)
                .json({ error: "Error creating order items" });
            }

            // Step 6: Calculate the total amount for the transaction
            const totalAmount = order_items.reduce(
              (total, item) => total + item.selling_price,
              0
            );

            // Step 7: Add a transaction record to the transactions table
            const createTransactionQuery =
              "INSERT INTO transactions (order_id, amount) VALUES (?, ?)";
            const createTransactionValues = [orderId, totalAmount];

            connection.query(
              createTransactionQuery,
              createTransactionValues,
              (err) => {
                if (err) {
                  console.error("Error creating transaction:", err);
                  return res
                    .status(500)
                    .json({ error: "Error creating transaction" });
                }

                // Step 8: Return the transaction id
                res.status(201).json({
                  message: "Order created successfully",
                  orderId: orderId,
                  transactionId: createTransactionValues.insertId,
                });
              }
            );
          });
        }
      );
    });
  });
};

const getOrder = (req, res) => {
  const order_id = req.params.id;
  const user_id = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Fetch the order details along with the customer name and check if the user is allowed to access it
    const getOrderQuery =
      "SELECT o.id as order_id, o.order_status, o.added_by, o.customer_shops, c.customer_name " +
      "FROM orders o " +
      "JOIN customers c ON o.customer_shops = c.id " +
      "WHERE o.id = ?";

    connection.query(getOrderQuery, [order_id], (err, orderResult) => {
      if (err) {
        console.error("Error fetching order:", err);
        return res.status(500).json({ error: "Error fetching order" });
      }

      if (orderResult.length === 0) {
        // Order not found with the provided order_id
        return res.status(404).json({ message: "Order Not Found" });
      }

      const order = orderResult[0];

      // Check if the user is allowed to access the order details
      if (
        order.added_by !== vendor_shop_role_id &&
        order.customer_shops !== vendor_shop_role_id
      ) {
        return res.status(403).json({
          message: "Forbidden: You are not allowed to access this order",
        });
      }

      // Fetch all the order items associated with the order_id
      const getOrderItemsQuery = "SELECT * FROM order_items WHERE order_id = ?";
      connection.query(getOrderItemsQuery, [order_id], (err, itemsResult) => {
        if (err) {
          console.error("Error fetching order items:", err);
          return res.status(500).json({ error: "Error fetching order items" });
        }

        res.status(200).json({
          order: order,
          items: itemsResult,
        });
      });
    });
  });
};
const deleteOrder = (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [userId], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Find the order with the specified orderId and check if the user has the permission to delete it
    const findOrderQuery = "SELECT * FROM orders WHERE id = ? AND added_by = ?";
    connection.query(
      findOrderQuery,
      [orderId, vendor_shop_role_id],
      (err, orderResult) => {
        if (err) {
          console.error("Error fetching order:", err);
          return res.status(500).json({ error: "Error fetching order" });
        }

        if (orderResult.length === 0) {
          // Order not found or user does not have permission to delete it
          return res.status(404).json({ message: "Order Not Found" });
        }

        // Delete the related records in the transactions table first
        const deleteTransactionsQuery =
          "DELETE FROM transactions WHERE order_id = ?";
        connection.query(deleteTransactionsQuery, [orderId], (err) => {
          if (err) {
            console.error("Error deleting transactions:", err);
            return res
              .status(500)
              .json({ error: "Error deleting transactions" });
          }

          // Now that the transactions are deleted, we can safely delete the order
          const deleteOrderQuery = "DELETE FROM orders WHERE id = ?";
          connection.query(deleteOrderQuery, [orderId], (err) => {
            if (err) {
              console.error("Error deleting order:", err);
              return res.status(500).json({ error: "Error deleting order" });
            }

            res.status(200).json({ message: "Order deleted successfully" });
          });
        });
      }
    );
  });
};

const createAllowance = (req, res) => {
  const { allowance } = req.body;
  const user_id = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const added_by = result[0].id;

    // Create the allowance and link it to the vendor_shop_role
    const createAllowanceQuery =
      "INSERT INTO price_allowance (allowance, added_by) VALUES (?, ?)";
    const createAllowanceValues = [allowance, added_by];

    connection.query(
      createAllowanceQuery,
      createAllowanceValues,
      (err, result) => {
        if (err) {
          console.error("Error creating allowance:", err);
          return res.status(500).json({ error: "Error creating allowance" });
        }

        const allowanceId = result.insertId;

        res.status(201).json({
          message: "Price allowance created successfully",
          allowanceId: allowanceId,
        });
      }
    );
  });
};
const updateAllowance = (req, res) => {
  const { allowance } = req.body;
  const allowanceId = req.params.id; // The ID of the price allowance to update
  const user_id = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const added_by = result[0].id;

    // Update the allowance only if the user added it
    const updateAllowanceQuery =
      "UPDATE price_allowance SET allowance = ? WHERE id = ? AND added_by = ?";
    const updateAllowanceValues = [allowance, allowanceId, added_by];

    connection.query(
      updateAllowanceQuery,
      updateAllowanceValues,
      (err, result) => {
        if (err) {
          console.error("Error updating allowance:", err);
          return res.status(500).json({ error: "Error updating allowance" });
        }

        if (result.affectedRows === 0) {
          // The allowance was not found or the user did not add it
          return res.status(404).json({ message: "Allowance Not Found" });
        }

        res
          .status(200)
          .json({ message: "Price allowance updated successfully" });
      }
    );
  });
};
const getAllowance = (req, res) => {
  const allowanceId = req.params.id; // The ID of the price allowance to fetch
  const user_id = req.user.id;

  // Step 1: Find the vendor_shop_id from vendor_shops_roles using the added_by field in price_allowance table
  const findVendorShopIdQuery =
    "SELECT vendor_shop_id FROM vendor_shops_roles WHERE id = (SELECT added_by FROM price_allowance WHERE id = ?)";

  connection.query(findVendorShopIdQuery, [allowanceId], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop:", err);
      return res.status(500).json({ error: "Error finding vendor shop" });
    }

    if (result.length === 0) {
      // Vendor shop not found for the allowance
      return res.status(404).json({ message: "Vendor Shop Not Found" });
    }

    const priceAllowanceVendorShopId = result[0].vendor_shop_id;

    // Step 2: Find the vendor_shop_id from vendor_shops_roles using the user_id
    const findUserVendorShopIdQuery =
      "SELECT vendor_shop_id FROM vendor_shops_roles WHERE user_id = ?";

    connection.query(findUserVendorShopIdQuery, [user_id], (err, result) => {
      if (err) {
        console.error("Error finding vendor shop:", err);
        return res.status(500).json({ error: "Error finding vendor shop" });
      }

      if (result.length === 0) {
        // Vendor shop not found for the user
        return res.status(404).json({ message: "Vendor Shop Not Found" });
      }

      const userVendorShopId = result[0].vendor_shop_id;

      // Step 3: Compare the two vendor_shop_ids to verify if the user has access to the allowance
      if (priceAllowanceVendorShopId !== userVendorShopId) {
        return res.status(403).json({ message: "Access Forbidden" });
      }

      // Fetch the allowance only if the user added it and the vendor_shop_id matches
      const getAllowanceQuery =
        "SELECT * FROM price_allowance WHERE id = ? AND added_by = ? ";
      const getAllowanceValues = [allowanceId, userVendorShopId];

      connection.query(getAllowanceQuery, getAllowanceValues, (err, result) => {
        if (err) {
          console.error("Error fetching allowance:", err);
          return res.status(500).json({ error: "Error fetching allowance" });
        }

        if (result.length === 0) {
          // The allowance was not found or the user did not add it
          return res.status(404).json({ message: "Allowance Not Found" });
        }

        const allowance = result[0];
        res.status(200).json(allowance);
      });
    });
  });
};

const deleteAllowance = (req, res) => {
  const allowanceId = req.params.id; // The ID of the price allowance to delete
  const user_id = req.user.id;

  // Find the vendor_shop_role_id and vendor_shop_id for the given user_id
  const findVendorShopQuery =
    "SELECT vsr.id as vendor_shop_role_id, vs.id as vendor_shop_id " +
    "FROM vendor_shops_roles vsr " +
    "JOIN vendor_shops vs ON vsr.vendor_shop_id = vs.id " +
    "WHERE vsr.user_id = ?";

  connection.query(findVendorShopQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop:", err);
      return res.status(500).json({ error: "Error finding vendor shop" });
    }

    if (result.length === 0) {
      // Vendor shop not found for the user
      return res.status(404).json({ message: "Vendor Shop Not Found" });
    }

    const { vendor_shop_role_id, vendor_shop_id } = result[0];

    // Delete the allowance only if the user added it
    const deleteAllowanceQuery =
      "DELETE FROM price_allowance WHERE id = ? AND added_by = ?";
    const deleteAllowanceValues = [allowanceId, vendor_shop_role_id];

    connection.query(
      deleteAllowanceQuery,
      deleteAllowanceValues,
      (err, result) => {
        if (err) {
          console.error("Error deleting allowance:", err);
          return res.status(500).json({ error: "Error deleting allowance" });
        }

        if (result.affectedRows === 0) {
          // The allowance was not found or the user did not add it
          return res.status(404).json({ message: "Allowance Not Found" });
        }

        res
          .status(200)
          .json({ message: "Price allowance deleted successfully" });
      }
    );
  });
};
const getAllTransactionsByUser = (req, res) => {
  const user_id = req.user.id;

  // Find the vendor_shop_role_id for the given user_id
  const findVendorShopRoleQuery =
    "SELECT id FROM vendor_shops_roles WHERE user_id = ?";
  connection.query(findVendorShopRoleQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Error finding vendor shop role:", err);
      return res.status(500).json({ error: "Error finding vendor shop role" });
    }

    if (result.length === 0) {
      // Vendor shop role not found for the user
      return res.status(404).json({ message: "Vendor Shop Role Not Found" });
    }

    const vendor_shop_role_id = result[0].id;

    // Fetch all transactions associated with the vendor_shop_role_id
    const getTransactionsQuery =
      "SELECT * FROM transactions WHERE order_id IN (SELECT id FROM orders WHERE added_by = ?)";
    connection.query(
      getTransactionsQuery,
      [vendor_shop_role_id],
      (err, transactions) => {
        if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Error fetching transactions" });
        }

        if (transactions.length === 0) {
          // No transactions found for the user
          return res.status(404).json({ message: "No Transactions Found" });
        }

        res.status(200).json({
          message: "Transactions fetched successfully",
          transactions: transactions,
        });
      }
    );
  });
};

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandByUser,
  getBrandsByUser,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitsByUser,
  getUnitByUser,
  createHSN,
  updateHSN,
  deleteHSN,
  getHSNsByUser,
  getHSNByUser,
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  getVariants,
  getVariant,
  deleteVariant,
  updateVariant,
  createOrder,
  getOrder,
  deleteOrder,
  createAllowance,
  updateAllowance,
  getAllowance,
  deleteAllowance,
  getAllTransactionsByUser,
};
