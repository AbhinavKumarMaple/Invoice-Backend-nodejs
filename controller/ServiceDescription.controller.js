const ServiceDescription = require("../models/serviceDescriptionSchema");

// Get All Service Descriptions by Employee ID
const getAllServiceDescriptionsByEmployeeId = async (req, res) => {
  try {
    let employeeId = req.user.employeeId;
    if (req.user?.isAccountant == true) {
      employeeId = req.user.accountantId;
    }
    // console.log(employeeId);
    // Find all service descriptions associated with the provided employee_id
    const serviceDescriptions = await ServiceDescription.find({
      employeeId: employeeId,
    });

    res.status(200).json(serviceDescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not get service descriptions for employee.",
    });
  }
};

// Create Service Description
const createServiceDescription = async (req, res) => {
  try {
    const { description } = req.body;
    let employeeId = req.user?.employeeId;
    let accountantId = req.user?.accountantId;

    if (req.user?.isAccountant == true) {
      employeeId = req.user?.accountantId;
    }

    // Check if a service description with the same description and employeeId already exists
    const existingServiceDescription = await ServiceDescription.findOne({
      employeeId,
      description,
    });
    if (existingServiceDescription) {
      return res.status(400).json({
        message: "Service description with this description already exists.",
      });
    }

    // Create a new service description instance
    const serviceDescription = new ServiceDescription({
      description,
      employeeId,
      accountantId,
    });

    // Save the service description to the database
    await serviceDescription.save();

    res
      .status(201)
      .json({ message: "Service description created successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not create service description." });
  }
};

// Update Service Description
const updateServiceDescription = async (req, res) => {
  try {
    const descriptionId = req.params.id;
    const updateData = req.body;
    let employeeId = req.user?.employeeId;
    let accountantId = req.user?.accountantId;
    let isAccountant = req.user?.isAccountant;

    let serviceDescription = await ServiceDescription.findById(descriptionId);
    if (serviceDescription.employeeId != employeeId)
      return res.status(404).json({ message: "not auth." });
    // Update the service description data based on the provided ID

    const updatedServiceDescription =
      await ServiceDescription.findByIdAndUpdate(
        descriptionId,
        updateData,
        { new: true } // Return the updated service description
      );

    if (!updatedServiceDescription) {
      return res
        .status(404)
        .json({ message: "Service description not found." });
    }

    res.status(200).json(updatedServiceDescription);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not update service description." });
  }
};

// Delete Service Description
const deleteServiceDescription = async (req, res) => {
  try {
    const descriptionId = req.params.id;
    let employeeId = req.user?.employeeId;
    let accountantId = req.user?.accountantId;
    let isAccountant = req.user?.isAccountant;

    let serviceDescription = await ServiceDescription.findById(descriptionId);
    if (serviceDescription.employeeId != employeeId)
      return res.status(404).json({ message: "not auth." });

    // Delete the service description based on the provided ID
    const deletedServiceDescription =
      await ServiceDescription.findByIdAndRemove(descriptionId);

    if (!deletedServiceDescription) {
      return res
        .status(404)
        .json({ message: "Service description not found." });
    }

    res
      .status(200)
      .json({ message: "Service description deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not delete service description." });
  }
};

module.exports = {
  getAllServiceDescriptionsByEmployeeId,
  createServiceDescription,
  updateServiceDescription,
  deleteServiceDescription,
};
