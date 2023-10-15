const Employee = require("../models/employeeSchema");
const Accountant = require("../models/accountantSchema");
const invoiceSchema = require("../models/invoiceSchema");
const Invoice = require("../models/invoiceSchema");

// Create Invoice (associated with an Employee)
const createInvoice = async (req, res) => {
  let createdBy = req.user.employeeId;
  let accountantId = req.user.accountantId;
  let employeeName = "";
  if (req.user.isAccountant) {
    createdBy = accountantId;
    employeeName = await Accountant.findById(createdBy);
  } else {
    employeeName = await Employee.findById(createdBy);
  }
  try {
    const {
      date,
      customerName,
      serviceDescription,
      netAmount,
      vatRate,
      vatAmount,
      createdFor,
      totalGross,
      bankAccount,
      paymentStatus,
      note,
    } = req.body;

    const parsedDate = new Date(date);

    const lastInvoiceNumber = await Invoice.findOne({
      createdBy: createdBy, // Replace 'createdByID' with the actual ID you want to search for
    }).sort({ invoiceNumber: -1 });
    let invoiceNumber = 0;
    if (!lastInvoiceNumber) {
      invoiceNumber = 1;
    } else {
      invoiceNumber = lastInvoiceNumber.invoiceNumber + 1;
    }
    // Create a new invoice instance
    const invoice = new Invoice({
      invoiceNumber,
      date: parsedDate,
      customerName,
      serviceDescription,
      netAmount,
      vatRate,
      vatAmount,
      totalGross,
      bankAccount,
      paymentStatus,
      note,
      createdBy,
      createdFor,
      accountantId,
      employeeName: employeeName.username,
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
    const invoiceId = req.params.invoiceid;
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
    let employeeId = req.user.employeeId;
    let username = req.query.username;
    if (req.user.isAccountant == true) {
      employeeId = req.user.accountantId;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Determine the start and end dates to filter by
    let startDate, endDate;

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
    } else {
      startDate = new Date(); // Set to current date if not provided
    }

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate);
    } else {
      endDate = new Date(); // Set to current date if not provided
    }

    // Calculate the end of the day for the end date
    endDate.setHours(23, 59, 59, 999);

    const filter = {
      createdBy: employeeId,
      date: { $gte: startDate, $lte: endDate },
    };
    if (username) {
      filter.username = username;
    }

    const invoices = await Invoice.find(filter).skip(skip).limit(limit);

    const totalInvoices = await Invoice.countDocuments(filter);
    const totalPages = Math.ceil(totalInvoices / limit);

    res.status(200).json({
      invoices,
      currentPage: page,
      totalPages,
      totalInvoices,
    });
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Define the filter object based on accountantId and username (if provided)
    const filter = {
      accountantId: accountantId,
    };

    // Retrieve the date range from the request query parameters
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // If both start and end dates are provided, set up the date filter
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Retrieve the username from the query parameters, if provided
    const username = req.query.username;
    if (username) {
      filter.username = username;
    }

    // Find invoices associated with the provided filter and pagination
    const invoices = await Invoice.find(filter).skip(skip).limit(limit);

    // Calculate the total number of invoices for pagination information
    const totalInvoices = await Invoice.countDocuments(filter);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalInvoices / limit);

    res.status(200).json({
      invoices,
      currentPage: page,
      totalPages,
      totalInvoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not get invoices for accountant.",
    });
  }
};

const getInvoicesByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.employeeid; // Extract the employee ID from the request parameters
    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Get the limit (number of records per page) from query parameters, default to 10 if not provided

    // Calculate the skip value based on the page number and limit
    const skip = (page - 1) * limit;

    // Retrieve the date range from the request query parameters
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Define the filter object based on createdBy (employeeId) and username (if provided)
    const filter = {
      createdBy: employeeId,
    };

    // Set up the date filter based on the provided date range or today's date
    if (startDate && endDate) {
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Retrieve the username from the query parameters, if provided
    const username = req.query.username;
    if (username) {
      filter.username = username;
    }

    // Query the database to find invoices associated with the employee, date range, and pagination
    const invoices = await Invoice.find(filter)
      .skip(skip) // Skip the specified number of records
      .limit(limit); // Limit the number of records returned

    // Check if the requesting user has permission to access these invoices
    if (
      invoices.some(
        (invoice) =>
          invoice.accountantId === req.user?.accountantId &&
          req.user?.isAccountant === true
      )
    ) {
      // Send the list of invoices in the response
      res.status(200).json(invoices);
    } else {
      // Return a 403 Forbidden status if the user doesn't have permission
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
