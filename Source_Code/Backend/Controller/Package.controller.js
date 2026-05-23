import Package from "../Models/Package.model.js";
import Service from "../Models/Service.model.js";
import Destination from "../Models/Destination.model.js";

// Get all packages
export const getAllPackages = async (req, res) => {
  try {
    const { destinationId } = req.query;
    let filter = {};
    
    if (destinationId) {
      // Show packages that match the destination OR packages with no destination (null)
      filter = {
        $or: [
          { destinationId: destinationId },
          { destinationId: null },
          { destinationId: { $exists: false } }
        ]
      };
    }

    const packages = await Package.find(filter)
      .populate('servicesIncluded destinationId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Packages retrieved successfully",
      packages,
      count: packages.length,
    });
  } catch (error) {
    console.log("Error in getAllPackages:", error);
    res.status(500).json({ message: "Server error in getAllPackages" });
  }
};

// Get single package
export const getPackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    const packageData = await Package.findById(packageId)
      .populate('servicesIncluded destinationId');

    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.status(200).json({
      message: "Package retrieved successfully",
      package: packageData,
    });
  } catch (error) {
    console.log("Error in getPackage:", error);
    res.status(500).json({ message: "Server error in getPackage" });
  }
};

// Planner/Admin: Create package
export const createPackage = async (req, res) => {
  try {
    if (req.user?.role !== 'planner' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, servicesIncluded, basePrice, customizable, description, destinationId, image } = req.body;

    if (!title || !basePrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (destinationId) {
      const destination = await Destination.findById(destinationId);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
    }

    const newPackage = new Package({
      title,
      servicesIncluded: servicesIncluded || [],
      basePrice,
      customizable: customizable !== undefined ? customizable : true,
      description: description || '',
      destinationId: destinationId || null,
      image: image || '',
    });

    await newPackage.save();
    await newPackage.populate('servicesIncluded destinationId');

    return res.status(201).json({
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.log("Error in createPackage:", error);
    res.status(500).json({ message: "Server error in createPackage" });
  }
};

// Planner/Admin: Update package
export const updatePackage = async (req, res) => {
  try {
    if (req.user?.role !== 'planner' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { packageId } = req.params;
    const updateData = req.body;

    const packageData = await Package.findByIdAndUpdate(
      packageId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('servicesIncluded destinationId');

    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.status(200).json({
      message: "Package updated successfully",
      package: packageData,
    });
  } catch (error) {
    console.log("Error in updatePackage:", error);
    res.status(500).json({ message: "Server error in updatePackage" });
  }
};

// Admin: Delete package
export const deletePackage = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can delete packages" });
    }

    const { packageId } = req.params;

    const packageData = await Package.findByIdAndDelete(packageId);

    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.status(200).json({
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.log("Error in deletePackage:", error);
    res.status(500).json({ message: "Server error in deletePackage" });
  }
};

