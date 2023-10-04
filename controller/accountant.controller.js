const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Accountant = require("../models/accountantSchema");
const Employee = require("../models/employeeSchema");

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
      if (!user.accountantId) {
        return res
          .status(403)
          .json({ message: "Username mismatch in the token." });
      }
      const accountantId = user.accountantId;
      // Find the accountant based on the username (you may use a unique identifier)
      const accountant = await Accountant.findById(accountantId);

      if (!accountant) {
        return res.status(404).json({ message: "Accountant not found." });
      }

      // Generate a new access token
      const token = jwt.sign(
        {
          accountantId: accountant._id,
          isAccountant: true,
          // Add any other claims or data you need in the access token
        },
        process.env.SECRET,
        { expiresIn: process.env.TOKENTIME } // Set an appropriate expiration time for the access token
      );

      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: "false",
        })
        .status(200)
        .json("done");
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Server error. Could not generate refresh token." });
  }
};

// Create Accountant function (your existing code)
const createAccountant = async (req, res) => {
  try {
    const {
      name,
      businessName,
      contactNumber,
      address,
      vatNumber,
      crnNumber,
      banks,
      username,
      email,
      password,
      logo,
    } = req.body; // Use req.body to access JSON data

    // Check if the accountant with the same username or email already exists
    const existingAccountant = await Accountant.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAccountant) {
      return res.status(400).json({
        message: "Accountant already exists with this username or email.",
      });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    uploadStream.on("finish", async () => {
      // Create a new accountant instance
      const accountant = new Accountant({
        name,
        businessName,
        contactNumber,
        address,
        vatNumber,
        crnNumber,
        banks,
        logo,
        username,
        email,
        password: hashedPassword,
      });

      // Save the accountant to the database
      await accountant.save();

      res.status(201).json({ message: "Accountant created successfully." });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not create accountant." });
  }
};

// Login Accountant
const loginAccountant = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find the accountant by username
    const accountant = await Accountant.findOne({ username });

    if (!accountant) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, accountant.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate a JSON Web Token (JWT) for authentication
    const token = jwt.sign(
      {
        accountantId: accountant._id,
        isAccountant: true,
      },
      process.env.SECRET,
      {
        expiresIn: process.env.TOKENTIME, // Token expiration time
      }
    );

    // Generate a refresh token
    const refreshToken = jwt.sign(
      {
        accountantId: accountant._id,
        isAccountant: true,
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

    // Send the access token in the response
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: "false",
      })
      .status(200)
      .json("done");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not log in accountant." });
  }
};

// Update Accountant
const updateAccountant = async (req, res) => {
  try {
    const accountantId = req.user.accountantId;
    const updateData = req.body;

    // Check if the user wants to update the password
    if (updateData.password) {
      // Hash the new password before updating
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }
    // Update the accountant data based on the provided ID
    let updatedAccountant = await Accountant.findByIdAndUpdate(
      accountantId,
      updateData,
      { new: true } // Return the updated accountant
    );

    if (!updatedAccountant) {
      return res.status(404).json({ message: "Accountant not found." });
    }
    updatedAccountant.password = "";
    res.status(200).json(updatedAccountant);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update accountant." });
  }
};

// Delete Accountant
const deleteAccountant = async (req, res) => {
  try {
    const accountantId = req.user.accountantId;

    // Delete the accountant based on the provided ID
    const deletedAccountant = await Accountant.findByIdAndRemove(accountantId);

    if (!deletedAccountant) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    res.status(200).json({ message: "Accountant deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not delete accountant." });
  }
};

// Get Accountant by ID from Cookie
const getAccountantById = async (req, res) => {
  try {
    const accountantId = req.user.accountantId; // Replace 'accountantId' with the actual cookie name

    // Find the accountant based on the accountant ID from the cookie
    let accountant = await Accountant.findById(accountantId);
    accountant.password = "";
    if (!accountant) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    res.status(200).json(accountant);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not get accountant by ID." });
  }
};

const addBankToAccountant = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, sortCode } = req.body;
    const accountantId = req.user.accountantId; // Replace with the correct way to get the accountant ID

    // Create a new bank object
    const newBank = {
      bankName,
      accountName,
      accountNumber,
      sortCode,
    };

    // Find the accountant based on the accountant ID
    const accountant = await Accountant.findById(accountantId);

    if (!accountant) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    // Add the new bank to the accountant's list of banks
    accountant.banks.push(newBank);

    // Save the accountant with the updated bank list
    await accountant.save();

    res.status(201).json({ message: "Bank added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not add bank." });
  }
};

const removeBankByIdFromAccountant = async (req, res) => {
  try {
    const bankId = req.params.bankId;
    const accountantId = req.user.accountantId; // Replace with the correct way to get the accountant ID

    // Find the accountant based on the accountant ID
    const accountant = await Accountant.findById(accountantId);

    if (!accountant) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    // Find the index of the bank to be removed
    const bankIndex = accountant.banks.findIndex((bank) => bank._id == bankId);

    if (bankIndex === -1) {
      return res.status(404).json({ message: "Bank not found." });
    }

    // Remove the bank from the accountant's list of banks
    accountant.banks.splice(bankIndex, 1);

    // Save the accountant with the updated bank list
    await accountant.save();

    res.status(200).json({ message: "Bank removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not remove bank." });
  }
};

const editBankByIdForAccountant = async (req, res) => {
  try {
    const bankId = req.params.bankId;
    const { bankName, accountName, accountNumber, sortCode } = req.body;
    const accountantId = req.user.accountantId; // Replace with the correct way to get the accountant ID

    // Find the accountant based on the accountant ID
    const accountant = await Accountant.findById(accountantId);

    if (!accountant) {
      return res.status(404).json({ message: "Accountant not found." });
    }

    // Find the bank to be edited
    const bankToEdit = accountant.banks.find((bank) => bank._id == bankId);

    if (!bankToEdit) {
      return res.status(404).json({ message: "Bank not found." });
    }

    // Update the bank details
    bankToEdit.bankName = bankName;
    bankToEdit.accountName = accountName;
    bankToEdit.accountNumber = accountNumber;
    bankToEdit.sortCode = sortCode;

    // Save the accountant with the updated bank list
    await accountant.save();

    res.status(200).json({ message: "Bank updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not edit bank." });
  }
};

const generateInviteLink = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if an employee with the given username and hashed password exists
    const employee = await Employee.findOne({ username, password });

    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found with provided credentials." });
    }

    // Generate a JWT token with a 1-hour expiration based on username and hashed password
    const token = jwt.sign(
      { username, password }, // Include the username and hashed password
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    // Create the invite link using the generated token
    const inviteLink = `${process.env.DOMAIN}/api/employee/invite/${token}`;

    // Respond with the invite link
    res
      .status(201)
      .json({ message: "Invite link generated successfully.", inviteLink });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not generate invite link." });
  }
};

module.exports = {
  createAccountant,
  loginAccountant,
  updateAccountant,
  deleteAccountant,
  getAccountantById,
  refreshToken,
  addBankToAccountant,
  removeBankByIdFromAccountant,
  editBankByIdForAccountant,
  generateInviteLink,
};
