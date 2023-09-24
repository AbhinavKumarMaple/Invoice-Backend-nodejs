const GeneratedInvoice = require("../models/GeneratedInvoice");

// Generate Invoice (associated with an Employee)
const generateInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      date,
      dueDate,
      customerName,
      netAmount,
      vatRate,
      vatAmount,
      totalGross,
      bankAccount,
      note,
      createdBy,
      accountantId,
      banks,
      customerAddress,
      accountantAddress,
      logo,
      vatRegNo,
      crn,
    } = req.body;

    // Create a new generated invoice instance
    const generatedInvoice = new GeneratedInvoice({
      invoiceNumber,
      date,
      dueDate,
      customerName,
      netAmount,
      vatRate,
      vatAmount,
      totalGross,
      bankAccount,
      note,
      createdBy,
      accountantId,
      banks,
      customerAddress,
      accountantAddress,
      logo,
      vatRegNo,
      crn,
    });

    // Save the generated invoice to the database
    await generatedInvoice.save();

    res
      .status(201)
      .json({ message: "Generated invoice created successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not generate invoice." });
  }
};

// Update Generated Invoice
const updateGeneratedInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const updateData = req.body;

    // Update the generated invoice data based on the provided ID
    const updatedGeneratedInvoice = await GeneratedInvoice.findByIdAndUpdate(
      invoiceId,
      updateData,
      { new: true } // Return the updated generated invoice
    );

    if (!updatedGeneratedInvoice) {
      return res.status(404).json({ message: "Generated invoice not found." });
    }

    res.status(200).json(updatedGeneratedInvoice);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update generated invoice." });
  }
};

// Delete Generated Invoice
const deleteGeneratedInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Delete the generated invoice based on the provided ID
    const deletedGeneratedInvoice = await GeneratedInvoice.findByIdAndRemove(
      invoiceId
    );

    if (!deletedGeneratedInvoice) {
      return res.status(404).json({ message: "Generated invoice not found." });
    }

    res
      .status(200)
      .json({ message: "Generated invoice deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not delete generated invoice." });
  }
};

// Get Generated Invoice by Employee ID
const getGeneratedInvoiceByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.employee_id;

    // Find all generated invoices associated with the provided employee_id
    const generatedInvoices = await GeneratedInvoice.find({
      createdBy: employeeId,
    });

    res.status(200).json(generatedInvoices);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Server error. Could not get generated invoices for employee.",
      });
  }
};

// Get Generated Invoice by Accountant ID
const getGeneratedInvoiceByAccountantId = async (req, res) => {
  try {
    const accountantId = req.params.accountant_id;

    // Find all generated invoices associated with the provided accountant_id
    const generatedInvoices = await GeneratedInvoice.find({ accountantId });

    res.status(200).json(generatedInvoices);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "Server error. Could not get generated invoices for accountant.",
      });
  }
};

module.exports = {
  generateInvoice,
  updateGeneratedInvoice,
  deleteGeneratedInvoice,
  getGeneratedInvoiceByEmployeeId,
  getGeneratedInvoiceByAccountantId,
};
