const Invoice = require("../models/invoiceSchema");

// Create Invoice (associated with an Employee)
const createInvoice = async (req, res) => {
  createdBy = req.user?.employeeId;
  accountantId = req.user.accountantId;
  if (!createdBy) {
    createdBy = accountantId;
  }
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
    const invoiceId = req.params.invoiceId;
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
const updateInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const updateData = req.body;

    // Find the invoice by ID
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found. first" });
    }
    console.log(invoice.createdBy);
    // Check if the invoice was created by the employee, accountant, or if the user is an admin
    if (
      invoice.createdBy === req.user.employeeId ||
      invoice.createdBy === req.user.accountantId ||
      (invoice.accountantId === req.user.accountantId &&
        req.user.isAccountant === true)
    ) {
      // Update the invoice data based on the provided ID and updateData
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        updateData,
        { new: true }
      );

      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found." });
      }

      return res.status(200).json(updatedInvoice);
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized: You cannot update this invoice." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update the invoice." });
  }
};

// Get Invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const employeeId = req.user?.employeeId;
    const accountantId = req.user?.accountantId;
    // Find the invoice based on the provided ID
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    // Check if the user is authorized to access this invoice
    if (
      invoice.createdBy === employeeId ||
      (invoice.createdBy === accountantId && req.user?.isAccountant == true)
    ) {
      res.status(200).json(invoice);
    } else {
      res
        .status(403)
        .json({ message: "Unauthorized: You cannot access this invoice." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not get invoice by ID." });
  }
};

const getAllInvoicesForEmployee = async (req, res) => {
  try {
    let employeeId = req.user?.employeeId;

    if (req.user?.isAccountant == true) {
      employeeId = req.user?.accountantId;
    }

    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 20; // Get the limit (number of records per page) from query parameters, default to 10 if not provided

    // Calculate the skip value based on the page number and limit
    const skip = (page - 1) * limit;

    // Find invoices associated with the provided employee_id with pagination
    const invoices = await Invoice.find({ createdBy: employeeId })
      .skip(skip) // Skip the specified number of records
      .limit(limit); // Limit the number of records returned

    res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not get invoices for employee.",
    });
  }
};

const getAllInvoicesForAccountant = async (req, res) => {
  try {
    const accountantId = req.user.accountantId;
    const isAccountant = req.user.isAccountant;

    if (!isAccountant) {
      return res.status(403).json({
        message: "Unauthorized: You are not allowed to access this resource.",
      });
    }

    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 20; // Get the limit (number of records per page) from query parameters, default to 10 if not provided

    // Calculate the skip value based on the page number and limit
    const skip = (page - 1) * limit;

    // Find invoices associated with the provided accountant_id with pagination
    const invoices = await Invoice.find({ accountantId: accountantId })
      .skip(skip) // Skip the specified number of records
      .limit(limit); // Limit the number of records returned

    res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not get invoices for accountant.",
    });
  }
};

// // Get All Invoices by Employee ID
const getInvoicesByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.employeeId; // Assuming you pass the employee ID as a parameter
    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Get the limit (number of records per page) from query parameters, default to 10 if not provided

    // Calculate the skip value based on the page number and limit
    const skip = (page - 1) * limit;

    // Query the database to find invoices associated with the employee with pagination
    const invoices = await Invoice.find({ createdBy: employeeId })
      .skip(skip) // Skip the specified number of records
      .limit(limit); // Limit the number of records returned

    if (
      invoices.some(
        (invoice) =>
          invoice.createdBy === req.user.employeeId ||
          invoice.createdBy === req.user.accountantId ||
          (invoice.accountantId === req.user.accountantId &&
            req.user.isAccountant === true)
      )
    ) {
      res.status(200).json(invoices);
    } else {
      res
        .status(403)
        .json({ message: "Unauthorized: You cannot access these invoices." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not fetch invoices." });
  }
};

// // Get All Invoices by Accountant ID
// const getAllInvoicesByAccountantId = async (req, res) => {
//   try {
//     const accountantId = req.user.accountantId; // Assuming you pass the accountant ID as a parameter

//     // Query the database to find all invoices associated with the accountant
//     const invoices = await Invoice.find({ accountantId: accountantId });

//     res.status(200).json(invoices);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Server error. Could not fetch invoices." });
//   }
// };

module.exports = {
  createInvoice,
  deleteInvoice,
  updateInvoiceById,
  getInvoiceById,
  getAllInvoicesForEmployee,
  getAllInvoicesForAccountant,
  getInvoicesByEmployeeId,
  //   getAllInvoicesByAccountantId,
};
