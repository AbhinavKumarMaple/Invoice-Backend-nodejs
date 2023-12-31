const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employeeSchema");
const Accountant = require("../models/accountantSchema");
var fs = require("fs");

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

      const tokenHours = parseInt(process.env.TOKENTIME); // Token expiration time in hours
      const expirationTimeInSeconds = tokenHours * 3600; // Convert hours to seconds

      // Calculate the expiration time as a Date object
      const tokenExpireTime = new Date(
        Date.now() + expirationTimeInSeconds * 1000
      );

      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: "false",
        })
        .status(200)
        .json({
          message: "Token will expire on",
          expirationTime: tokenExpireTime,
        });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not generate refresh token." });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { username, email, password } = req.body; // These are the required fields
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
    if (!req.file || req.file.length === 0) {
      return res.status(400).json({
        message: "No logo was sent",
      });
    }
    
    logo = {
      data: fs.readFileSync(req.file.path), // Use the 'buffer' property to store the file content
      contentType: req.file.mimetype,
    };
    // Process and add the uploaded image(s) to the accountant's 'img' field

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new employee instance
    const employee = new Employee({
      accountantId,
      username,
      email,
      password: hashedPassword,
      // These fields are optional and will only be set if they are in the request
      businessName: req.body.businessName,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      vatNumber: req.body.vatNumber,
      crnNumber: req.body.crnNumber,
      banks: req.body.banks,
      logo, // Assuming this is the logo field, and it's optional
    });

    fs.unlinkSync(req.file.path);

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

const addImageToEmployee = async (req, res) => {
  try {
    // Get the employee ID from the request body (assuming you have it as employeeId)
    const employeeId = req.body.employeeId; // Update this based on your actual implementation

    // Find the employee by ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    if (!req.file || req.file.length === 0) {
      return res.status(400).send("No images uploaded.");
    }

    // Process and add the uploaded image to the employee's 'logo' field
    const newImage = {
      data: fs.readFileSync(req.file.path), // Use the 'buffer' property to store the file content
      contentType: req.file.mimetype,
    };

    // Remove the uploaded file from the temporary storage
    fs.unlinkSync(req.file.path);

    // Replace the existing logo array with the new image
    employee.logo = [newImage];

    // Save the updated employee object with the new image
    await employee.save();

    res
      .status(200)
      .json({ message: "Logo updated for employee successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update logo for employee." });
  }
};

// Remove Image from Accountant function
const removeImageFromAccountant = async (req, res) => {
  try {
    // Get the accountant ID from the request user object (assuming you have it in req.user.accountantId)
    // const employeeid = req.user.employeeId; // Update this based on your actual implementation

    // Find the accountant by ID
    const employeeId = req.params.employeeId;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Accountant not found." });
    }
    // Get the image ID from req.params.id
    const imageId = req.params.id;

    // Find the index of the image with the specified ID in the accountant's 'logo' array
    const imageIndex = employee.logo.findIndex((image) => image._id == imageId);

    if (imageIndex === -1) {
      return res
        .status(404)
        .json({ message: "Image not found in accountant's collection." });
    }

    // Remove the image from the accountant's 'logo' array by index
    employee.logo.splice(imageIndex, 1);

    // Save the updated accountant object with the image removed
    await employee.save();

    res
      .status(200)
      .json({ message: "Image removed from accountant successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not remove image from accountant.",
    });
  }
};

// Login Employee
const loginEmployee = async (req, res) => {
  try {
    const tokenUrl = req.query.token;

    if (tokenUrl) {
      const decodedToken = jwt.verify(tokenUrl, process.env.SECRET);
      const { email } = decodedToken;
      const tokenEmployee = await Employee.findOne({ email });

      if (!tokenEmployee) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Generate a JSON Web Token (JWT) for authentication
      const token = jwt.sign(
        {
          employeeId: tokenEmployee._id,
          accountantId: tokenEmployee.accountantId,
        },
        process.env.SECRET,
        {
          expiresIn: process.env.TOKENTIME, // Token expiration time
        }
      );

      const tokenHours = parseInt(process.env.TOKENTIME); // Token expiration time in hours
      const expirationTimeInSeconds = tokenHours * 3600; // Convert hours to seconds

      // Calculate the expiration time as a Date object
      const expirationDate = new Date(
        Date.now() + expirationTimeInSeconds * 1000
      );

      // Generate a refresh token
      const refreshToken = jwt.sign(
        {
          employeeId: tokenEmployee._id,
          accountantId: tokenEmployee.accountantId,
        },
        process.env.SECRET, // Use a different secret for refresh tokens
        {
          expiresIn: process.env.REFRESH_TOKENTIME, // Refresh token expiration time
        }
      );

      // Set the refresh token as an HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: "false",
        expires: new Date(
          Date.now() + parseInt(process.env.REFRESH_COOKIE_EXPIRY) * 3600000
        ), // 3600000 milliseconds in an hour
      });

      // Set the token expiration time as a human-readable date and time format
      // const tokenExpireTime = expirationDate.toLocaleString();

      // Send the access token and its expiration time in the response
      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: "false",
        })
        .status(200)
        .json({ message: "done", expirationTime: expirationDate });
    } else {
      const { email, password } = req.body;

      // Find the employee by username
      const employee = await Employee.findOne({ email });

      if (!employee) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, employee.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Generate a JSON Web Token (JWT) for authentication
      const token = jwt.sign(
        { employeeId: employee._id, accountantId: employee.accountantId },
        process.env.SECRET,
        {
          expiresIn: process.env.TOKENTIME, // Token expiration time
        }
      );
      const tokenHours = parseInt(process.env.TOKENTIME); // Token expiration time in hours
      const expirationTimeInSeconds = tokenHours * 3600; // Convert hours to seconds

      // Calculate the expiration time as a Date object
      const expirationDate = new Date(
        Date.now() + expirationTimeInSeconds * 1000
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
        secure: "false",
        expires: new Date(
          Date.now() + parseInt(process.env.REFRESH_COOKIE_EXPIRY) * 3600000
        ), // 3600000 milliseconds in an hour
      });

      // Set the token expiration time as a human-readable date and time format
      // const tokenExpireTime = expirationDate.toLocaleString();

      // Send the access token and its expiration time in the response
      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: "false",
        })
        .status(200)
        .json({ message: "done", expirationTime: expirationDate });
    }
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
    const tokenEmployeeId = req.user.accountantId;
    const updateData = req.body;

    const checkEmployee = await Employee.findById(employeeId);
    if (!checkEmployee.accountantId == tokenEmployeeId) {
      return res
        .status(403)
        .json("you do not have access to perform this action");
    }

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
    const employeeId = req.params.id;
    const tokenEmployeeId = req.user.accountantId;
    const checkEmployee = await Employee.findById(employeeId);
    if (!checkEmployee.accountantId == tokenEmployeeId) {
      return res
        .status(403)
        .json("you do not have access to perform this action");
    }

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
    let id = req.user.employeeId;
    if (!id) {
      id = req.user.accountantId;
    }

    if (req.params.id) {
      id = req.params.id; // Extract the employee ID from the request params
    }

    const tokenEmployeeId = req.user.accountantId;

    // Find the employee by their ID
    let employee = await Employee.findById(id).lean();

    // If the employee is not found, return a 404 error
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    if (!(employee.accountantId === tokenEmployeeId)) {
      return res
        .status(403)
        .json("you do not have access to perform this action");
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
    const { accountantId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const username = req.query.username;

    const skip = (page - 1) * limit;

    const filter = { accountantId: accountantId };
    if (username) {
      // Use a case-insensitive regular expression to search for the username
      filter.username = new RegExp(username, "i");
    }

    const employees = await Employee.find(filter)
      .select(["-logo", "-password"])
      .skip(skip)
      .limit(limit);

    const totalEmployees = await Employee.countDocuments(filter);
    const totalPages = Math.ceil(totalEmployees / limit);

    res.status(200).json({
      employees,
      currentPage: page,
      totalPages,
      totalEmployees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not get employees." });
  }
};

// Function to get all bank information objects for an accountant
const getAllBanksForAccountant = async (req, res) => {
  try {
    const { employeeId } = req.user;

    // Find the accountant based on the accountant ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    // Extract the banks array from the accountant object
    const banks = employee.banks || [];

    res.status(200).json({ banks });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not get bank information." });
  }
};

const addBankToEmployee = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, sortCode } = req.body;
    const employeeId = req.user.employeeId;

    // Create a new bank object
    const newBank = {
      bankName,
      accountName,
      accountNumber,
      sortCode,
    };

    // Find the employee based on the employee ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    // Add the new bank to the accountant's list of banks
    employee.banks.push(newBank);

    // Save the accountant with the updated bank list
    await employee.save();

    res.status(201).json({ message: "Bank added successfully." });
  } catch (err) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not add bank." });
  }
};
const removeBankByIdFromEmployee = async (req, res) => {
  try {
    const bankId = req.params.bankId;
    const employeeId = req.user.employeeId; // Replace with the correct way to get the accountant ID

    // Find the accountant based on the accountant ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    // Find the index of the bank to be removed
    const bankIndex = employee.banks.findIndex((bank) => bank._id == bankId);

    if (bankIndex === -1) {
      return res.status(404).json({ message: "Bank not found." });
    }

    // Remove the bank from the accountant's list of banks
    employee.banks.splice(bankIndex, 1);

    // Save the accountant with the updated bank list
    await employee.save();

    res.status(200).json({ message: "Bank removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not remove bank." });
  }
};

const editBankByIdForEmployee = async (req, res) => {
  try {
    const bankId = req.params.bankId;
    const { bankName, accountName, accountNumber, sortCode } = req.body;
    const employeeId = req.user.employeeId; // Replace with the correct way to get the accountant ID

    // Find the accountant based on the accountant ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    // Find the bank to be edited
    const bankToEdit = employee.banks.find((bank) => bank._id == bankId);

    if (!bankToEdit) {
      return res.status(404).json({ message: "Bank not found." });
    }

    // Update the bank details
    bankToEdit.bankName = bankName;
    bankToEdit.accountName = accountName;
    bankToEdit.accountNumber = accountNumber;
    bankToEdit.sortCode = sortCode;

    // Save the accountant with the updated bank list
    await employee.save();

    res.status(200).json({ message: "Bank updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not edit bank." });
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
  getAllBanksForAccountant,
  addBankToEmployee,
  removeBankByIdFromEmployee,
  editBankByIdForEmployee,
  removeImageFromAccountant,
  addImageToEmployee,
};
