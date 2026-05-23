import Admin from "../Models/Admin.model.js";
import User from "../Models/User.model.js";
import Planner from "../Models/Planner.model.js";
import Vendor from "../Models/Vendor.model.js";
import Booking from "../Models/Booking.model.js";
import Destination from "../Models/Destination.model.js";
import Package from "../Models/Package.model.js";
import Review from "../Models/Review.model.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can access this" });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Users retrieved successfully",
      users,
      count: users.length,
    });
  } catch (error) {
    console.log("Error in getAllUsers:", error);
    res.status(500).json({ message: "Server error in getAllUsers" });
  }
};

// Get all planners
export const getAllPlanners = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can access this" });
    }

    const planners = await Planner.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Planners retrieved successfully",
      planners,
      count: planners.length,
    });
  } catch (error) {
    console.log("Error in getAllPlanners:", error);
    res.status(500).json({ message: "Server error in getAllPlanners" });
  }
};

// Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can access this" });
    }

    const vendors = await Vendor.find().select('-password')
      .populate('servicesOffered')
      .sort({ createdAt: -1 });

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

// Approve/Reject vendor
export const updateVendorStatus = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can update vendor status" });
    }

    const { vendorId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { status },
      { new: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.status(200).json({
      message: "Vendor status updated successfully",
      vendor,
    });
  } catch (error) {
    console.log("Error in updateVendorStatus:", error);
    res.status(500).json({ message: "Server error in updateVendorStatus" });
  }
};

// Approve/Reject planner
export const updatePlannerStatus = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can update planner status" });
    }

    const { plannerId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const planner = await Planner.findByIdAndUpdate(
      plannerId,
      { status },
      { new: true }
    ).select('-password');

    if (!planner) {
      return res.status(404).json({ message: "Planner not found" });
    }

    return res.status(200).json({
      message: "Planner status updated successfully",
      planner,
    });
  } catch (error) {
    console.log("Error in updatePlannerStatus:", error);
    res.status(500).json({ message: "Server error in updatePlannerStatus" });
  }
};

// Ban/Suspend user
export const updateUserStatus = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can update user status" });
    }

    const { userId } = req.params;
    const { isBanned, isSuspended } = req.body;

    const updateData = {};
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (isSuspended !== undefined) updateData.isSuspended = isSuspended;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    console.log("Error in updateUserStatus:", error);
    res.status(500).json({ message: "Server error in updateUserStatus" });
  }
};

// Assign planner to booking
export const assignPlannerToBooking = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can assign planners" });
    }

    const { bookingId } = req.params;
    const { plannerId } = req.body;

    if (!plannerId) {
      return res.status(400).json({ message: "plannerId is required" });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { plannerId },
      { new: true }
    ).populate('userId packageId destinationId plannerId');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({
      message: "Planner assigned successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in assignPlannerToBooking:", error);
    res.status(500).json({ message: "Server error in assignPlannerToBooking" });
  }
};

// Analytics Dashboard
export const getAnalytics = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can access analytics" });
    }

    const { period = 'month' } = req.query; // month, quarter, year

    // Calculate date range
    const now = new Date();
    let startDate;
    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Most booked destinations
    const destinationBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$destinationId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const destinationIds = destinationBookings.map(d => d._id);
    const topDestinations = await Destination.find({ _id: { $in: destinationIds } });

    // Most booked packages
    const packageBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$packageId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const packageIds = packageBookings.map(p => p._id);
    const topPackages = await Package.find({ _id: { $in: packageIds } });

    // Top performing vendors (by reviews)
    const vendorReviews = await Review.aggregate([
      { $match: { targetType: 'vendor', createdAt: { $gte: startDate } } },
      { $group: { _id: '$targetId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 5 },
    ]);

    const vendorIds = vendorReviews.map(v => v._id);
    const topVendors = await Vendor.find({ _id: { $in: vendorIds } }).select('-password');

    // Booking statistics
    const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } });
    const confirmedBookings = await Booking.countDocuments({
      status: 'confirmed',
      createdAt: { $gte: startDate },
    });
    const conversionRate = totalBookings > 0
      ? ((confirmedBookings / totalBookings) * 100).toFixed(2)
      : 0;

    return res.status(200).json({
      message: "Analytics retrieved successfully",
      analytics: {
        period,
        topDestinations: topDestinations.map((dest, idx) => ({
          destination: dest,
          bookingCount: destinationBookings[idx]?.count || 0,
        })),
        topPackages: topPackages.map((pkg, idx) => ({
          package: pkg,
          bookingCount: packageBookings[idx]?.count || 0,
        })),
        topVendors: topVendors.map((vendor, idx) => ({
          vendor,
          avgRating: vendorReviews[idx]?.avgRating?.toFixed(2) || 0,
          reviewCount: vendorReviews[idx]?.count || 0,
        })),
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: await Booking.countDocuments({
            status: 'pending',
            createdAt: { $gte: startDate },
          }),
          completed: await Booking.countDocuments({
            status: 'completed',
            createdAt: { $gte: startDate },
          }),
          conversionRate: totalBookings > 0
            ? `${((confirmedBookings / totalBookings) * 100).toFixed(2)}%`
            : '0%',
        },
      },
    });
  } catch (error) {
    console.log("Error in getAnalytics:", error);
    res.status(500).json({ message: "Server error in getAnalytics" });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can access booking stats" });
    }

    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('userId packageId destinationId plannerId')
      .sort({ createdAt: -1 });

    const stats = {
      total: await Booking.countDocuments(),
      pending: await Booking.countDocuments({ status: 'pending' }),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
    };

    return res.status(200).json({
      message: "Booking statistics retrieved successfully",
      bookings,
      stats,
      count: bookings.length,
    });
  } catch (error) {
    console.log("Error in getBookingStats:", error);
    res.status(500).json({ message: "Server error in getBookingStats" });
  }
};

