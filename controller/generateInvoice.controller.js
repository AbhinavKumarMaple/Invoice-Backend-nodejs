const GeneratedInvoice = require("../models/generatedInvoiceSchema");
var fs = require("fs");
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
      banks,
      customerAddress,
      accountantAddress,
      vatRegNo,
      crn,
    } = req.body;
    let { employeeId, accountantId } = req.user;
    let createdBy;
    if (req.user?.isAccountant == true) {
      createdBy = accountantId;
    } else {
      createdBy = employeeId;
    }

    if (!req.file || req.file.length === 0) {
      return res.status(400).send("No images uploaded.");
    }

    const image = {
      data: fs.readFileSync(req.file.path), // Use the 'buffer' property to store the file content
      contentType: req.file.mimetype,
    };

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
      logo: image,
      vatRegNo,
      crn,
    });
    fs.unlinkSync(req.file.path);
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
    let invoiceId = req.params.id;
    let employeeId = req.user.employeeId;
    let accountantId = req.user.accountantId;
    if (req.user?.isAccountant == true) {
      employeeId = accountantId;
    }
    const updateData = req.body;
    const GeneratedInvoiceDetails = await GeneratedInvoice.findById(invoiceId);
    if (!GeneratedInvoiceDetails.createdBy == employeeId)
      return res.status(500).json({ message: "not allowed" });
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

// Function to update the logo of a generated invoice
const updateLogoInGeneratedInvoice = async (req, res) => {
  try {
    const { id } = req.body;
    const logo = req.file; // Assuming you are using multer for file upload

    console.log(req.file);

    // Find the generated invoice by ID
    const generatedInvoiceToUpdate = await GeneratedInvoice.findById(id);

    if (!generatedInvoiceToUpdate) {
      return res.status(404).json({ message: "Generated invoice not found." });
    }

    // Read the new logo file and store it in the 'logo' field
    generatedInvoiceToUpdate.logo.data = fs.readFileSync(logo.path);
    generatedInvoiceToUpdate.logo.contentType = logo.mimetype;

    // Save the updated generated invoice
    await generatedInvoiceToUpdate.save();

    // Remove the uploaded file from the temporary storage
    fs.unlinkSync(logo.path);

    res.status(200).json({ message: "Logo updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not update logo." });
  }
};

// Delete Generated Invoice
const deleteGeneratedInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    let { employeeId, accountantId } = req.user;
    if (req.user?.isAccountant == true) {
      employeeId == accountantId;
    }

    //check for valid creator
    const GeneratedInvoiceDetail = await GeneratedInvoice.findById(invoiceId);

    // Delete the generated invoice based on the provided ID
    if (
      GeneratedInvoiceDetail.createdBy == employeeId ||
      (GeneratedInvoiceDetail.createdBy == employeeId &&
        req.user?.isAccountant == true)
    ) {
      const deletedGeneratedInvoice = await GeneratedInvoice.findByIdAndRemove(
        invoiceId
      );
      if (!deletedGeneratedInvoice) {
        return res
          .status(404)
          .json({ message: "Generated invoice not found." });
      }
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

const getGeneratedInvoiceByEmployee = async (req, res) => {
  try {
    let employeeId;
    if (req.user?.isAccountant == true) {
      employeeId = req.user?.accountantId;
    } else {
      employeeId = req.user?.employeeId;
    }

    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 20; // Get the limit (number of records per page) from query parameters, default to 10 if not provided

    // Calculate the skip value based on the page number and limit
    const skip = (page - 1) * limit;

    // Find generated invoices associated with the provided employee_id with pagination
    const generatedInvoices = await GeneratedInvoice.find({
      createdBy: employeeId,
    })
      .skip(skip) // Skip the specified number of records
      .limit(limit); // Limit the number of records returned

    res.status(200).json(generatedInvoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not get generated invoices for employee.",
    });
  }
};

const getAllGeneratedInvoiceByEmployeeId = async (req, res) => {
  try {
    let employeeId = req.params.employeeid;
    let id;
    if (req.user?.isAccountant == true) {
      id = req.user.accountantId;
    } else {
      id = req.user.employeeId;
    }

    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 20; // Get the limit (number of records per page) from query parameters, default to 10 if not provided

    // Calculate the skip value based on the page number and limit
    const skip = (page - 1) * limit;

    // Find generated invoices associated with the provided employee_id with pagination
    const generatedInvoices = await GeneratedInvoice.find({
      createdBy: employeeId,
    })
      .skip(skip) // Skip the specified number of records
      .limit(limit); // Limit the number of records returned

    if (
      generatedInvoices.createdBy == id ||
      (generatedInvoices.createdBy == id && req.user?.isAccountant == true)
    ) {
      res.status(200).json(generatedInvoices);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not get generated invoices for employee.",
    });
  }
};

// Get Generated Invoice by Accountant ID
// const getGeneratedInvoiceByAccountantId = async (req, res) => {
//   try {
//     const accountantId = req.params.accountant_id;

//     // Find all generated invoices associated with the provided accountant_id
//     const generatedInvoices = await GeneratedInvoice.find({ accountantId });

//     res.status(200).json(generatedInvoices);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Server error. Could not get generated invoices for accountant.",
//     });
//   }
// };

module.exports = {
  generateInvoice,
  updateGeneratedInvoice,
  deleteGeneratedInvoice,
  getGeneratedInvoiceByEmployee,
  getAllGeneratedInvoiceByEmployeeId,
  updateLogoInGeneratedInvoice,
  // getGeneratedInvoiceByAccountantId,
};
