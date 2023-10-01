const Customer = require("../models/customerSchema");

// Create Customer
const createCustomer = async (req, res) => {
  const { employeeId, accountantId } = req.user;
  if (employeeId) {
    creator = employeeId;
  } else {
    creator = accountantId;
  }
  try {
    const { name, id, contactNumber, address, banks } = req.body;
    const existingCustomer = await Customer.findOne({ name });
    if (existingCustomer) {
      return res.json({ message: "Customer already exists with that name" });
    }
    // Create a new customer instance
    const customer = new Customer({
      name,
      id, // Consider generating UUID here if not provided in the request
      contactNumber,
      address,
      banks,
      creator,
      accountantId,
    });

    // Save the customer to the database
    await customer.save();

    res.status(201).json({ message: "Customer created successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not create customer." });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const _id = req.params.customerId; // Extract the customer ID from the request params
    const { name, contactNumber, address } = req.body;
    const { accountantId } = req.user; // Extract employeeId and accountantId from req.user

    // Find the existing customer by ID
    const existingCustomer = await Customer.findById(_id);

    // If the customer doesn't exist, return a 404 error
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Check if either employeeId or accountantId matches the creator of the customer
    if (existingCustomer.creator.toString() !== accountantId) {
      return res.status(403).json({
        message: "Unauthorized: You are not allowed to update this customer.",
      });
    }

    // Update the customer data
    existingCustomer.name = name;
    existingCustomer.contactNumber = contactNumber;
    existingCustomer.address = address;

    // Save the updated customer to the database
    await existingCustomer.save();

    res.status(200).json({ message: "Customer updated successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update customer." });
  }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id; // Extract the customer ID from the request params
    const { employeeId, accountantId } = req.user; // Extract employeeId and accountantId from req.user

    // Find the existing customer by ID
    const existingCustomer = await Customer.findById(customerId);

    // If the customer doesn't exist, return a 404 error
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Check if either employeeId or accountantId matches the creator of the customer
    if (
      existingCustomer.creator.toString() !== employeeId &&
      existingCustomer.creator.toString() !== accountantId
    ) {
      return res.status(403).json({
        message: "Unauthorized: You are not allowed to delete this customer.",
      });
    }

    // Delete the customer from the database
    await existingCustomer.remove();

    res.status(200).json({ message: "Customer deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not delete customer." });
  }
};

// Get Customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id; // Extract the customer ID from the request params
    const { accountantId } = req.user; // Extract accountantId from req.user

    // Find the customer by both customerId and accountantId
    const customer = await Customer.findById({
      customerId,
    });

    // If the customer is not found or doesn't match the accountantId, return a 404 error
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Send a JSON response with the customer's details
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not get customer." });
  }
};

// Get All Customers with Pagination
const getAllCustomers = async (req, res) => {
  try {
    const { accountantId } = req.user; // Extract accountantId from req.user
    const page = parseInt(req.query.page) || 1; // Current page (default to 1)
    const limit = parseInt(req.query.limit) || 10; // Number of items per page (default to 10)

    // Calculate the skip value based on the current page and limit
    const skip = (page - 1) * limit;

    // Find all customers that match the accountantId with pagination
    const customers = await Customer.find({ accountantId: accountantId })
      .skip(skip)
      .limit(limit);

    // Count the total number of customers for pagination information
    const totalCustomers = await Customer.countDocuments({
      accountantId: accountantId,
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCustomers / limit);

    // Send a JSON response with the array of customer details and pagination information
    res.status(200).json({
      customers,
      currentPage: page,
      totalPages,
      totalCustomers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not get customers." });
  }
};

const addBankToCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const newBank = req.body;
    // Find the customer by ID
    let customer = await Customer.findById(customerId);
    // console.log(customer);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Extract the existing banks from the customer object
    let existingBanks = customer.banks;

    // Add the new bank info to the existing banks
    existingBanks.push(newBank);

    console.log(existingBanks);

    // Update the customer object with the modified banks
    customer.banks = existingBanks;

    // Save the updated customer data
    const updatedCustomer = await customer.save();

    res.status(200).json({
      message: "Bank added successfully.",
      customer: updatedCustomer, // Send back the updated customer object
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not add bank to customer." });
  }
};

const removeBankFromCustomer = async (req, res) => {
  try {
    // const _id = req.params.customerId;
    // const bankId = req.body._id;
    let {_id,bankid} = req.query
    // Find the customer by ID
    const customer = await Customer.findById(_id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Find the index of the bank to remove
    const bankIndex = customer.banks.findIndex(
      (bank) => bank._id.toString() === bankid
    );

    if (bankIndex === -1) {
      return res
        .status(404)
        .json({ message: "Bank not found for this customer." });
    }

    // Remove the bank from the array
    customer.banks.splice(bankIndex, 1);

    // Save the updated customer data
    await customer.save();

    res.status(200).json({ message: "Bank removed successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not remove bank from customer." });
  }
};

const editBankForCustomer = async (req, res) => {
  try {
    let (_id,bankid) = req.query
    const updatedBank = req.body;

    // Find the customer by ID
    const customer = await Customer.findById(_id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Find the index of the bank to update
    const bankIndex = customer.banks.findIndex(
      (bank) => bank._id.toString() === bankid
    );

    if (bankIndex === -1) {
      return res
        .status(404)
        .json({ message: "Bank not found for this customer." });
    }

    // Update the bank data
    customer.banks[bankIndex] = {
      ...customer.banks[bankIndex],
      ...updatedBank,
    };

    // Save the updated customer data
    await customer.save();

    res.status(200).json({ message: "Bank updated successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update bank for customer." });
  }
};




module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  getAllCustomers,
  addBankToCustomer,
  removeBankFromCustomer,
  editBankForCustomer,

};
