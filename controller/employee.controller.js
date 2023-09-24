const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// Create Employee
const createEmployee = async (req, res) => {
  try {
    const { name, contactNumber, username, email, password, accountant } =
      req.body;

    // Check if the employee with the same username or email already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ username }, { email }],
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({
          message: "Employee already exists with this username or email.",
        });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new employee instance
    const employee = new Employee({
      name,
      contactNumber,
      username,
      email,
      password: hashedPassword,
      accountant, // Assuming you pass the accountant ID when creating an employee
    });

    // Save the employee to the database
    await employee.save();

    res.status(201).json({ message: "Employee created successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not create employee." });
  }
};

// Login Employee
const loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the employee by username
    const employee = await Employee.findOne({ username });

    if (!employee) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, employee.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate a JSON Web Token (JWT) for authentication
    const token = jwt.sign({ employeeId: employee._id }, "your-secret-key", {
      expiresIn: "1h", // Token expiration time
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not log in employee." });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;

    // Update the employee data based on the provided ID
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true } // Return the updated employee
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update employee." });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Delete the employee based on the provided ID
    const deletedEmployee = await Employee.findByIdAndRemove(employeeId);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not delete employee." });
  }
};

module.exports = {
  createEmployee,
  loginEmployee,
  updateEmployee,
  deleteEmployee,
};
