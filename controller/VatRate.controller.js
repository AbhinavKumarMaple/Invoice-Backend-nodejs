const VatRate = require("../models/vatRateSchema");

// Get All VAT Rates by Employee ID
const getAllVatRatesByEmployeeId = async (req, res) => {
  try {
    console.log(req.user);
    let employeeId = req.user.employeeId;
    if (!employeeId) {
      employeeId = req.user.accountantId;
    }

    if (!employeeId) return res.status(500).json({ message: "require id" });
    // Find all VAT rates associated with the provided employee_id
    const vatRates = await VatRate.find({ employeeId: employeeId });
    console.log(vatRates);
    res.status(200).json(vatRates);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not get VAT rates for employee." });
  }
};

// Create VAT Rate
const createVatRate = async (req, res) => {
  try {
    const { vatRate } = req.body;

    let accountantId = req.user?.accountantId;
    let employeeId = req.user?.employeeId;

    if (!employeeId) {
      employeeId = req.user.accountantId;
    }

    // Check if a VAT rate with the same vatRate and employeeId already exists
    const existingVatRate = await VatRate.findOne({
      vatRate,
      employeeId,
    });

    if (existingVatRate) {
      return res
        .status(200)
        .json({ message: "VAT rate with this rate already exists." });
    }

    // Create a new VAT rate instance
    const newVatRate = new VatRate({
      employeeId,
      vatRate,
      accountantId,
    });

    // Save the VAT rate to the database
    await newVatRate.save();

    res.status(201).json({ message: "VAT rate created successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not create VAT rate." });
  }
};

// Update VAT Rate
const updateVatRate = async (req, res) => {
  try {
    const vatRateId = req.params.id;
    const updateData = req.body;
    let employeeId = req.user?.employeeId;
    let accountantId = req.user?.accountantId;
    let isAccountant = req.user?.isAccountant;
    if (isAccountant === true) {
      employeeId = accountantId;
    }
    let varRate = await VatRate.findById(vatRateId);
    console.log(varRate);
    if (varRate.employeeId != employeeId)
      return res.status(404).json({ message: "not auth." });

    // Update the VAT rate data based on the provided ID
    const updatedVatRate = await VatRate.findByIdAndUpdate(
      vatRateId,
      updateData,
      { new: true } // Return the updated VAT rate
    );

    if (!updatedVatRate) {
      return res.status(404).json({ message: "VAT rate not found." });
    }

    res.status(200).json(updatedVatRate);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update VAT rate." });
  }
};

// Delete VAT Rate
const deleteVatRate = async (req, res) => {
  try {
    const vatRateId = req.params.id;
    let employeeId = req.user.employeeId;
    if (req.user?.isAccountant == true) {
      employeeId = req.user.accountantId;
    }
    let varRate = await VatRate.findById(vatRateId);
    console.log(varRate);
    if (varRate.employeeId != employeeId)
      return res.status(404).json({ message: "not auth." });

    // Delete the VAT rate based on the provided ID
    const deletedVatRate = await VatRate.findByIdAndRemove(vatRateId);

    if (!deletedVatRate) {
      return res.status(404).json({ message: "VAT rate not found." });
    }

    res.status(200).json({ message: "VAT rate deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not delete VAT rate." });
  }
};

module.exports = {
  getAllVatRatesByEmployeeId,
  createVatRate,
  updateVatRate,
  deleteVatRate,
};
