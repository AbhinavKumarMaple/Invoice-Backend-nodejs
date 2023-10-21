const Customer = require("../models/customerSchema");

// Create Customer
const createCustomer = async (req, res) => {
  const { employeeId, accountantId } = req.user;
  // console.log(employeeId)
  if ("this is employee" + employeeId) {
    creator = employeeId;
  } else {
    creator = accountantId;
  }
  try {
    const { name, id, contactNumber, address,address2, banks } = req.body;
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
      address2,
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
    let customerId = req.params.customerId;

    if (req.user.isAccountant) {
      id = req.user.accountantId;
    } else {
      id = req.user.employeeId;
    }

    // Find the existing customer by IDs
    const existingCustomer = await Customer.findById(customerId);

    // If the customer doesn't exist, return a 404 error
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Check if either employeeId or accountantId matches the creator of the customer
    if (existingCustomer.creator.toString() !== id) {
      return res.status(403).json({
        message: "Unauthorized: You are not allowed to update this customer.",
      });
    }

    // Update the customer data with all fields from the request body
    Object.assign(existingCustomer, req.body);

    // Save the updated customer to the database
    await existingCustomer.save();

    res.status(200).json({ message: "Customer updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not update customer." });
  }
};


// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id; // Extract the customer ID from the request params
    // const { employeeId, accountantId } = req.user; // Extract employeeId and accountantId from req.user
if(req.user.isAccountant){
  id = req.user.accountantId
}else{
  id = req.user.employeeId
}
    // Find the existing customer by ID
    const existingCustomer = await Customer.findOneAndRemove({_id:customerId, creator:id});

    // If the customer doesn't exist, return a 404 error
    if (!existingCustomer) {
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
    let customerId = req.params.customerId;

    if (req.user.isAccountant) {
      id = req.user.accountantId;
    } else {
      id = req.user.employeeId;
    }

    // Find the customer by both customerId and accountantId
    const customer = await Customer.findById(
      customerId
    );

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


const getAllCustomers = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const username = req.query.username;

    const filter = { creator: employeeId };

    if (username) {
      // Use a case-insensitive regular expression to search for the username
      filter.user = new RegExp(username, "i");
    }

    const customers = await Customer.find(filter)
      .skip(skip)
      .limit(limit);

    const totalCustomers = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / limit);

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

    // console.log(existingBanks);

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
