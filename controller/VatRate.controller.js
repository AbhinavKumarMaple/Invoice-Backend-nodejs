const VatRate = require("../models/VatRate");

// Get All VAT Rates by Employee ID
const getAllVatRatesByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.employee_id;

    // Find all VAT rates associated with the provided employee_id
    const vatRates = await VatRate.find({ employeeId });

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
    const { employeeId, vatRate, created, accountant } = req.body;

    // Create a new VAT rate instance
    const newVatRate = new VatRate({
      employeeId,
      vatRate,
      created,
      accountant,
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
