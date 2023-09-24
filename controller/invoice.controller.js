const Invoice = require("../models/Invoice");

// Create Invoice (associated with an Employee)
const createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      date,
      customerName,
      serviceDescription,
      netAmount,
      vatRate,
      vatAmount,
      totalGross,
      paymentMethod,
      bankAccount,
      paymentStatus,
      note,
      createdBy,
      accountantId,
    } = req.body;

    // Create a new invoice instance
    const invoice = new Invoice({
      invoiceNumber,
      date,
      customerName,
      serviceDescription,
      netAmount,
      vatRate,
      vatAmount,
      totalGross,
      paymentMethod,
      bankAccount,
      paymentStatus,
      note,
      createdBy,
      accountantId,
    });

    // Save the invoice to the database
    await invoice.save();

    res.status(201).json({ message: "Invoice created successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not create invoice." });
  }
};

// Delete Invoice (associated with an Employee)
const deleteInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Delete the invoice based on the provided ID
    const deletedInvoice = await Invoice.findByIdAndRemove(invoiceId);

    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    res.status(200).json({ message: "Invoice deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not delete invoice." });
  }
};

// Update Invoice (associated with an Employee)
const updateInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const updateData = req.body;

    // Update the invoice data based on the provided ID
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      updateData,
      { new: true } // Return the updated invoice
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update invoice." });
  }
};

// Get Invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Find the invoice based on the provided ID
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not get invoice by ID." });
  }
};

// Get All Invoices for an Employee (based on employee_id)
const getAllInvoicesForEmployee = async (req, res) => {
  try {
    const employeeId = req.params.employee_id;

    // Find all invoices associated with the provided employee_id
    const invoices = await Invoice.find({ createdBy: employeeId });

    res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not get invoices for employee." });
  }
};

// Get All Invoices for an Accountant (based on accountant_id)
const getAllInvoicesForAccountant = async (req, res) => {
  try {
    const accountantId = req.params.accountant_id;

    // Find all invoices associated with the provided accountant_id
    const invoices = await Invoice.find({ accountantId });

    res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Server error. Could not get invoices for accountant.",
      });
  }
};

module.exports = {
  createInvoice,
  deleteInvoice,
  updateInvoice,
  getInvoiceById,
  getAllInvoicesForEmployee,
  getAllInvoicesForAccountant,
};
