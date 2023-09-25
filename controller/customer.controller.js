const Customer = require("../models/Customer");

// Create Customer
const createCustomer = async (req, res) => {
  try {
    const { name, id, contactNumber, address, banks, creator, accountant } =
      req.body;

    // Create a new customer instance
    const customer = new Customer({
      name,
      id, // Consider generating UUID here if not provided in the request
      contactNumber,
      address,
      banks,
      creator,
      accountant,
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
    const customerId = req.params.id;
    const updateData = req.body;

    // Update the customer data based on the provided ID
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true } // Return the updated customer
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.status(200).json(updatedCustomer);
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
    const customerId = req.params.id;

    // Delete the customer based on the provided ID
    const deletedCustomer = await Customer.findByIdAndRemove(customerId);

    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found." });
    }

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
    const customerId = req.params.id;

    // Find the customer based on the provided ID
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not get customer by ID." });
  }
};

// Get All Customers
const getAllCustomers = async (req, res) => {
  try {
    // Find all customers
    const customers = await Customer.find();

    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not get all customers." });
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  getAllCustomers,
};
