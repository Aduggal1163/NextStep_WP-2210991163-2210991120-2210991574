import Booking from "../Models/Booking.model.js";
import User from "../Models/User.model.js";
import Planner from "../Models/Planner.model.js";
import Package from "../Models/Package.model.js";
import Destination from "../Models/Destination.model.js";
import GuestDetails from "../Models/GuestDetails.model.js";

// User: Create booking
export const createBooking = async (req, res) => {
  try {
    const { packageId, destinationId, date, customRequests, guestDetailsId } = req.body;
    const userId = req.user?.id;

    if (!userId || req.user?.role !== 'user') {
      return res.status(403).json({ message: "Only users can create bookings" });
    }

    if (!packageId || !destinationId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const packageData = await Package.findById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const newBooking = new Booking({
      userId,
      packageId,
      destinationId,
      date: new Date(date),
      customRequests: customRequests || '',
      guestDetailsId: guestDetailsId || null,
      status: 'pending',
      totalAmount: packageData.basePrice || 0,
    });

    await newBooking.save();
    await newBooking.populate('packageId destinationId');

    return res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.log("Error in createBooking:", error);
    res.status(500).json({ message: "Server error in createBooking" });
  }
};

// User: Get my bookings
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "UserId is missing" });
    }

    const bookings = await Booking.find({ userId })
      .populate('packageId destinationId plannerId guestDetailsId')
      .populate({
        path: 'vendors',
        select: '-password'
      })
      .populate({
        path: 'suggestedVendors',
        select: '-password'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings retrieved successfully",
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.log("Error in getMyBookings:", error);
    res.status(500).json({ message: "Server error in getMyBookings" });
  }
};

// Planner: Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    if (req.user?.role !== 'planner' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('userId packageId destinationId plannerId guestDetailsId')
      .populate({
        path: 'vendors',
        select: '-password'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings retrieved successfully",
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.log("Error in getAllBookings:", error);
    res.status(500).json({ message: "Server error in getAllBookings" });
  }
};

// Planner: Assign planner to booking (claim booking)
export const assignPlanner = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const plannerId = req.user?.id;

    if (req.user?.role !== 'planner' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // If booking already has a planner and user is not admin, check if it's the same planner
    if (booking.plannerId && booking.plannerId.toString() !== plannerId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Booking is already assigned to another planner" });
    }

    booking.plannerId = plannerId;
    await booking.save();
    
    await booking.populate('userId packageId destinationId plannerId');

    return res.status(200).json({
      message: "Booking claimed successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in assignPlanner:", error);
    res.status(500).json({ message: "Server error in assignPlanner" });
  }
};

// Planner: Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (req.user?.role !== 'planner' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate('userId packageId destinationId plannerId');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in updateBookingStatus:", error);
    res.status(500).json({ message: "Server error in updateBookingStatus" });
  }
};

// Planner: Assign vendors to booking
export const assignVendors = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { vendorIds } = req.body;

    if (req.user?.role !== 'planner' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ message: "vendorIds must be a non-empty array" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Validate vendor IDs
    const mongoose = (await import('mongoose')).default;
    const Vendor = (await import('../Models/Vendor.model.js')).default;
    
    const validVendorIds = vendorIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validVendorIds.length !== vendorIds.length) {
      return res.status(400).json({ message: "Some vendor IDs are invalid" });
    }

    // Verify vendors exist
    const vendors = await Vendor.find({ _id: { $in: validVendorIds } });
    if (vendors.length !== validVendorIds.length) {
      return res.status(400).json({ message: "Some vendors not found" });
    }

    booking.vendors = validVendorIds;
    await booking.save();
    
    await booking.populate('vendors', '-password');
    await booking.populate('userId packageId destinationId plannerId');

    return res.status(200).json({
      message: "Vendors assigned successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in assignVendors:", error);
    res.status(500).json({ message: "Server error in assignVendors" });
  }
};

// User: Get single booking
export const getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    const booking = await Booking.findById(bookingId)
      .populate('userId packageId destinationId plannerId guestDetailsId')
      .populate({
        path: 'vendors',
        select: '-password'
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user?.role === 'user' && booking.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json({
      message: "Booking retrieved successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in getBooking:", error);
    res.status(500).json({ message: "Server error in getBooking" });
  }
};

