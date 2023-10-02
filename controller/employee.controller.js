const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employeeSchema");
const Accountant = require("../models/accountantSchema");

// Route to generate a refresh token for an accountant

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    // Verify the provided refresh token
    jwt.verify(refreshToken, process.env.SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token." });
      }

      // Check if the username in the decoded token matches the provided username
      if (!user.employeeId) {
        return res
          .status(403)
          .json({ message: "Username mismatch in the token." });
      }
      const employeeId = user.employeeId;
      // Find the accountant based on the username (you may use a unique identifier)
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Accountant not found." });
      }

      // Generate a new access token
      const token = jwt.sign(
        { employeeId: employee._id, accountantId: employee.accountantId },
        process.env.SECRET,
        {
          expiresIn: process.env.TOKENTIME, // Token expiration time
        }
      );

      res
        .cookie("token", token, { httpOnly: true, sameSite: "none" })
        .status(200)
        .json("done");
    });
  } catch (error) {
    console.log("error");
    res
      .status(500)
      .json({ message: "Server error. Could not generate refresh token." });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { name, contactNumber, username, email, password } = req.body;
    const accountantId = req.user.accountantId;
    // Check if the accountant with the specified accountantId exists
    const existingAccountant = await Accountant.findById(accountantId);

    if (!existingAccountant) {
      return res.status(400).json({
        message: "Accountant not found with the provided accountantId.",
      });
    }

    // Check if the employee with the same username or email already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ username }, { email }],
    });

    if (existingEmployee) {
      return res.status(400).json({
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
      accountantId,
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
    const token = jwt.sign(
      { employeeId: employee._id, accountantId: employee.accountantId },
      process.env.SECRET,
      {
        expiresIn: process.env.TOKENTIME, // Token expiration time
      }
    );

    // Generate a refresh token
    const refreshToken = jwt.sign(
      { employeeId: employee._id, accountantId: employee.accountantId },
      process.env.SECRET, // Use a different secret for refresh tokens
      {
        expiresIn: process.env.REFRESH_TOKENTIME, // Refresh token expiration time
      }
    );

    // Set the refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",

      expires: new Date(
        Date.now() + parseInt(process.env.REFRESH_COOKIE_EXPIRY) * 3600000
      ), // 3600000 milliseconds in an hour
    });

    // Send the access token in the response
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
      })
      .status(200)
      .json("done");
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
    const employeeId = req.user.employeeId;
    const updateData = req.body;

    // Check if the user wants to update the password
    if (updateData.password) {
      // Hash the new password before updating
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    // Update the employee data based on the provided ID
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true } // Return the updated employee
    );
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    updatedEmployee.accountantId = "";
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
    const employeeId = req.user.employeeId;

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

//get employee by id
const getEmployeeById = async (req, res) => {
  try {
    const _id = req.user.employeeId; // Extract the employee ID from the request params

    // Find the employee by their ID
    const employee = await Employee.findById(_id);

    // If the employee is not found, return a 404 error
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    employee.password = "";
    // Send a JSON response with the employee's details
    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not get employee." });
  }
};

const getAllEmployeesByAccountantId = async (req, res) => {
  try {
    const { accountantId } = req.user; // Extract accountantId from req.user
    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 20; // Get the limit (number of records per page) from query parameters, default to 10 if not provided

    // Calculate the skip value based on the page number and limit
    const skip = (page - 1) * limit;

    // Find employees that match the accountantId with pagination
    const employees = await Employee.find({ accountantId: accountantId })
      .skip(skip) // Skip the specified number of records
      .limit(limit); // Limit the number of records returned

    // Send a JSON response with the array of employee details
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not get employees." });
  }
};

const inviteLogin = async (req, res) => {
  try {
    const tokenUrl = req.params.token;

    // Verify and decode the token
    const decodedToken = jwt.verify(tokenUrl, process.env.SECRET);

    const { username, password } = decodedToken;

    // Authenticate the employee using username and hashed password
    // Implement your authentication logic here, e.g., querying the database
    const employee = await Employee.findOne({ username, password });

    if (!employee) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate a JSON Web Token (JWT) for authentication
    const token = jwt.sign(
      { employeeId: employee._id, accountantId: employee.accountantId },
      process.env.SECRET,
      {
        expiresIn: process.env.TOKENTIME, // Token expiration time
      }
    );

    // Generate a refresh token
    const refreshToken = jwt.sign(
      { employeeId: employee._id, accountantId: employee.accountantId },
      process.env.SECRET, // Use a different secret for refresh tokens
      {
        expiresIn: process.env.REFRESH_TOKENTIME, // Refresh token expiration time
      }
    );

    // Respond with the JWT token for the session
    // Set the refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      expires: new Date(
        Date.now() + parseInt(process.env.REFRESH_COOKIE_EXPIRY) * 3600000
      ), // 3600000 milliseconds in an hour
    });

    // Send the access token in the response
    res
      .cookie("token", token, { httpOnly: true, sameSite: "none" })
      .status(200)
      .json("");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not log in employee." });
  }
};

module.exports = {
  createEmployee,
  loginEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  getAllEmployeesByAccountantId,
  refreshToken,
  inviteLogin,
};
