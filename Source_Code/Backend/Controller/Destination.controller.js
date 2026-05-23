import Destination from "../Models/Destination.model.js";
import Venue from "../Models/Venue.model.js";
import Package from "../Models/Package.model.js";

// Get all destinations with filters
export const getAllDestinations = async (req, res) => {
  try {
    const { location, style, minPrice, maxPrice, minCapacity, maxCapacity } = req.query;
    const filter = {};

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (style) {
      filter.style = style.toLowerCase();
    }
    if (minPrice || maxPrice) {
      filter['priceRange.min'] = minPrice ? { $gte: Number(minPrice) } : undefined;
      filter['priceRange.max'] = maxPrice ? { $lte: Number(maxPrice) } : undefined;
    }
    if (minCapacity || maxCapacity) {
      filter['guestCapacity.min'] = minCapacity ? { $gte: Number(minCapacity) } : undefined;
      filter['guestCapacity.max'] = maxCapacity ? { $lte: Number(maxCapacity) } : undefined;
    }

    // Remove undefined values
    Object.keys(filter).forEach(key => {
      if (filter[key] === undefined) delete filter[key];
    });

    const destinations = await Destination.find(filter)
      .populate('venues')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Destinations retrieved successfully",
      destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.log("Error in getAllDestinations:", error);
    res.status(500).json({ message: "Server error in getAllDestinations" });
  }
};

// Get single destination with venues and packages
export const getDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const destination = await Destination.findById(destinationId)
      .populate('venues');

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const packages = await Package.find({ destinationId })
      .populate('servicesIncluded');

    return res.status(200).json({
      message: "Destination retrieved successfully",
      destination: {
        ...destination.toObject(),
        packages,
      },
    });
  } catch (error) {
    console.log("Error in getDestination:", error);
    res.status(500).json({ message: "Server error in getDestination" });
  }
};

// Admin: Create destination
export const createDestination = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can create destinations" });
    }

    const { name, location, style, priceRange, guestCapacity, description, images, availableDates } = req.body;

    if (!name || !location || !style || !priceRange || !guestCapacity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newDestination = new Destination({
      name,
      location,
      style: style.toLowerCase(),
      priceRange,
      guestCapacity,
      description: description || '',
      images: images || [],
      availableDates: availableDates || [],
    });

    await newDestination.save();

    return res.status(201).json({
      message: "Destination created successfully",
      destination: newDestination,
    });
  } catch (error) {
    console.log("Error in createDestination:", error);
    res.status(500).json({ message: "Server error in createDestination" });
  }
};

// Admin: Update destination
export const updateDestination = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can update destinations" });
    }

    const { destinationId } = req.params;
    const updateData = req.body;

    if (updateData.style) {
      updateData.style = updateData.style.toLowerCase();
    }

    const destination = await Destination.findByIdAndUpdate(
      destinationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    return res.status(200).json({
      message: "Destination updated successfully",
      destination,
    });
  } catch (error) {
    console.log("Error in updateDestination:", error);
    res.status(500).json({ message: "Server error in updateDestination" });
  }
};

// Admin: Delete destination
export const deleteDestination = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can delete destinations" });
    }

    const { destinationId } = req.params;

    const destination = await Destination.findByIdAndDelete(destinationId);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    return res.status(200).json({
      message: "Destination deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteDestination:", error);
    res.status(500).json({ message: "Server error in deleteDestination" });
  }
};

