import Planner from "../Models/Planner.model.js";
import Booking from "../Models/Booking.model.js";
import Package from "../Models/Package.model.js";
import Vendor from "../Models/Vendor.model.js";
import User from "../Models/User.model.js";

// Get planner's bookings (assigned bookings + unassigned bookings they can claim)
export const getMyBookings = async (req, res) => {
  try {
    const plannerId = req.user?.id;
    if (!plannerId || req.user?.role !== 'planner') {
      return res.status(403).json({ message: "Only planners can access this" });
    }

    const { status, showAll } = req.query;
    
    // Get assigned bookings
    let filter = { plannerId };
    if (status) filter.status = status;

    const assignedBookings = await Booking.find(filter)
      .populate('userId packageId destinationId guestDetailsId')
      .populate({
        path: 'vendors',
        select: '-password'
      })
      .populate({
        path: 'suggestedVendors',
        select: '-password'
      })
      .sort({ createdAt: -1 });

    // If showAll is true, also get unassigned bookings
    let unassignedBookings = [];
    if (showAll === 'true') {
      const unassignedFilter = { plannerId: null, status: 'pending' };
      if (status) unassignedFilter.status = status;
      
      unassignedBookings = await Booking.find(unassignedFilter)
        .populate('userId packageId destinationId guestDetailsId')
        .populate({
          path: 'vendors',
          select: '-password'
        })
        .populate({
          path: 'suggestedVendors',
          select: '-password'
        })
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      message: "Bookings retrieved successfully",
      bookings: [...assignedBookings, ...unassignedBookings],
      assignedCount: assignedBookings.length,
      unassignedCount: unassignedBookings.length,
      count: assignedBookings.length + unassignedBookings.length,
    });
  } catch (error) {
    console.log("Error in getMyBookings:", error);
    res.status(500).json({ message: "Server error in getMyBookings" });
  }
};

// Create custom package
export const createCustomPackage = async (req, res) => {
  try {
    if (req.user?.role !== 'planner') {
      return res.status(403).json({ message: "Only planners can create packages" });
    }

    const { title, servicesIncluded, basePrice, customizable, description, destinationId, image } = req.body;

    if (!title || !basePrice) {
      return res.status(400).json({ message: "Missing required fields" });
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

    // Add to planner's custom packages
    const planner = await Planner.findById(req.user.id);
    planner.customPackages.push(newPackage._id);
    await planner.save();

    return res.status(201).json({
      message: "Custom package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.log("Error in createCustomPackage:", error);
    res.status(500).json({ message: "Server error in createCustomPackage" });
  }
};

// Suggest vendors to user (can be called by planner or user)
export const suggestVendors = async (req, res) => {
  try {
    const { bookingId, vendorIds, category } = req.body;

    if (!bookingId || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization: user can save preferences for their own booking, planner can suggest for assigned bookings
    if (req.user?.role === 'user') {
      if (booking.userId?.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized for this booking" });
      }
    } else if (req.user?.role === 'planner') {
      if (booking.plannerId?.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized for this booking" });
      }
    } else {
      return res.status(403).json({ message: "Only users and planners can suggest vendors" });
    }

    // Validate vendor IDs
    const mongoose = (await import('mongoose')).default;
    const validVendorIds = vendorIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validVendorIds.length !== vendorIds.length) {
      return res.status(400).json({ message: "Some vendor IDs are invalid" });
    }

    // Store suggested vendors (user preferences or planner suggestions)
    booking.suggestedVendors = validVendorIds;
    await booking.save();

    return res.status(200).json({
      message: req.user?.role === 'user' 
        ? "Vendor preferences saved successfully. Your planner will be notified."
        : "Vendors suggested successfully",
      suggestedVendors: validVendorIds,
      category: category || 'all',
    });
  } catch (error) {
    console.log("Error in suggestVendors:", error);
    res.status(500).json({ message: "Server error in suggestVendors" });
  }
};

// Assign vendors to booking
export const assignVendorsToBooking = async (req, res) => {
  try {
    if (req.user?.role !== 'planner') {
      return res.status(403).json({ message: "Only planners can assign vendors" });
    }

    const { bookingId } = req.params;
    const { vendorIds } = req.body;

    console.log('Assign vendors request:', { bookingId, vendorIds, plannerId: req.user.id });

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ message: "vendorIds must be a non-empty array" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if planner is assigned to this booking
    const bookingPlannerId = booking.plannerId ? booking.plannerId.toString() : null;
    const currentPlannerId = req.user.id.toString();

    if (!bookingPlannerId) {
      return res.status(403).json({ 
        message: "No planner assigned to this booking. Please claim the booking first from the View Bookings page." 
      });
    }

    if (bookingPlannerId !== currentPlannerId) {
      return res.status(403).json({ 
        message: `Not authorized for this booking. This booking is assigned to planner ID: ${bookingPlannerId}, but you are: ${currentPlannerId}` 
      });
    }

    // Validate that all vendor IDs exist
    const mongoose = (await import('mongoose')).default;
    const validVendorIds = vendorIds.filter(id => {
      const isValid = mongoose.Types.ObjectId.isValid(id);
      if (!isValid) {
        console.log('Invalid vendor ID:', id);
      }
      return isValid;
    });
    
    if (validVendorIds.length !== vendorIds.length) {
      return res.status(400).json({ 
        message: `Some vendor IDs are invalid. Valid: ${validVendorIds.length}, Total: ${vendorIds.length}` 
      });
    }

    // Check if vendors exist and are approved
    const vendors = await Vendor.find({ 
      _id: { $in: validVendorIds },
      status: 'approved'
    });
    
    if (vendors.length !== validVendorIds.length) {
      const foundIds = vendors.map(v => v._id.toString());
      const missingIds = validVendorIds.filter(id => !foundIds.includes(id.toString()));
      return res.status(400).json({ 
        message: `Some vendors not found or not approved. Missing: ${missingIds.length}` 
      });
    }

    // Assign vendors
    booking.vendors = validVendorIds;
    await booking.save();
    
    // Populate before returning
    await booking.populate('vendors', '-password');
    await booking.populate('userId packageId destinationId plannerId');

    console.log('Vendors assigned successfully:', {
      bookingId: booking._id,
      vendorCount: booking.vendors.length
    });

    return res.status(200).json({
      message: `Successfully assigned ${validVendorIds.length} vendor(s) to booking`,
      booking,
    });
  } catch (error) {
    console.log("Error in assignVendorsToBooking:", error);
    res.status(500).json({ 
      message: "Server error in assignVendorsToBooking",
      error: error.message 
    });
  }
};

// Get all vendors (for selection)
export const getAllVendors = async (req, res) => {
  try {
    if (req.user?.role !== 'planner' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { status, serviceType } = req.query;
    const filter = { role: 'vendor' };
    if (status) filter.status = status;

    let vendors = await Vendor.find(filter)
      .select('-password')
      .populate('servicesOffered');

    // Filter by service type if provided
    if (serviceType) {
      vendors = vendors.filter(vendor => 
        vendor.servicesOffered.some(service => 
          service.type === serviceType
        )
      );
    }

    return res.status(200).json({
      message: "Vendors retrieved successfully",
      vendors,
      count: vendors.length,
    });
  } catch (error) {
    console.log("Error in getAllVendors:", error);
    res.status(500).json({ message: "Server error in getAllVendors" });
  }
};

// Get customization requests for a booking
export const getCustomizationRequests = async (req, res) => {
  try {
    if (req.user?.role !== 'planner') {
      return res.status(403).json({ message: "Only planners can view customization requests" });
    }

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('userId');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.plannerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized for this booking" });
    }

    return res.status(200).json({
      message: "Customization requests retrieved successfully",
      customRequests: booking.customRequests || '',
      customizationRequests: booking.customizationRequests || '',
    });
  } catch (error) {
    console.log("Error in getCustomizationRequests:", error);
    res.status(500).json({ message: "Server error in getCustomizationRequests" });
  }
};

// Update customization request response
export const respondToCustomization = async (req, res) => {
  try {
    if (req.user?.role !== 'planner') {
      return res.status(403).json({ message: "Only planners can respond to customization requests" });
    }

    const { bookingId } = req.params;
    const { response, status: responseStatus } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.plannerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized for this booking" });
    }

    booking.customizationResponse = response;
    booking.customizationStatus = responseStatus || 'reviewed';
    await booking.save();

    return res.status(200).json({
      message: "Response to customization request saved successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in respondToCustomization:", error);
    res.status(500).json({ message: "Server error in respondToCustomization" });
  }
};

