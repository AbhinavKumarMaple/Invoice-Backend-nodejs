const ServiceDescription = require("../models/ServiceDescription");

// Get All Service Descriptions by Employee ID
const getAllServiceDescriptionsByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.employee_id;

    // Find all service descriptions associated with the provided employee_id
    const serviceDescriptions = await ServiceDescription.find({ employeeId });

    res.status(200).json(serviceDescriptions);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "Server error. Could not get service descriptions for employee.",
      });
  }
};

// Create Service Description
const createServiceDescription = async (req, res) => {
  try {
    const { employeeId, description, created, accountant } = req.body;

    // Create a new service description instance
    const serviceDescription = new ServiceDescription({
      employeeId,
      description,
      created,
      accountant,
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
