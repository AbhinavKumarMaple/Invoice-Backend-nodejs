const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Accountant = require("../models/Accountant");

// Create Accountant
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
      logo,
      username,
      email,
      password,
    } = req.body;

    // Check if the accountant with the same username or email already exists
    const existingAccountant = await Accountant.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAccountant) {
      return res
        .status(400)
        .json({
          message: "Accountant already exists with this username or email.",
        });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

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
      { accountantId: accountant._id },
      "your-secret-key",
      {
        expiresIn: "1h", // Token expiration time
      }
    );

    res.status(200).json({ token });
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
    const accountantId = req.params.id;
    const updateData = req.body;

    // Update the accountant data based on the provided ID
    const updatedAccountant = await Accountant.findByIdAndUpdate(
      accountantId,
      updateData,
      { new: true } // Return the updated accountant
    );

    if (!updatedAccountant) {
      return res.status(404).json({ message: "Accountant not found." });
    }

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
    const accountantId = req.params.id;

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

module.exports = {
  createAccountant,
  loginAccountant,
  updateAccountant,
  deleteAccountant,
};
