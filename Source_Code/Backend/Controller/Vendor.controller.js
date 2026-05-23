import Vendor from "../Models/Vendor.model.js";
import Service from "../Models/Service.model.js";
import Booking from "../Models/Booking.model.js";
import Review from "../Models/Review.model.js";

// Get vendor's assigned weddings
export const getMyAssignments = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can access this" });
    }

    // Use $in operator to find bookings where vendorId is in the vendors array
    const bookings = await Booking.find({ 
      vendors: { $in: [vendorId] } 
    })
      .populate('userId', 'username email')
      .populate('packageId', 'title basePrice')
      .populate('destinationId', 'name location')
      .populate('plannerId', 'plannerName email')
      .populate({
        path: 'vendors',
        select: '-password'
      })
      .sort({ date: 1 });

    return res.status(200).json({
      message: "Assignments retrieved successfully",
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.log("Error in getMyAssignments:", error);
    res.status(500).json({ message: "Server error in getMyAssignments" });
  }
};

// Get single assignment details
export const getAssignment = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { bookingId } = req.params;

    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can access this" });
    }

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'username email')
      .populate('packageId', 'title basePrice')
      .populate('destinationId', 'name location')
      .populate('plannerId', 'plannerName email')
      .populate('guestDetailsId')
      .populate({
        path: 'vendors',
        select: '-password'
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if vendor is assigned (handle both ObjectId and string comparison)
    const isAssigned = booking.vendors.some(v => {
      const vId = v._id ? v._id.toString() : v.toString();
      return vId === vendorId || vId === vendorId.toString();
    });

    if (!isAssigned) {
      return res.status(403).json({ message: "Not assigned to this booking" });
    }

    return res.status(200).json({
      message: "Assignment retrieved successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in getAssignment:", error);
    res.status(500).json({ message: "Server error in getAssignment" });
  }
};

// Add/Update service offering
export const addService = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can add services" });
    }

    const { type, name, description, price, images, availability } = req.body;

    if (!type || !name || !description || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newService = new Service({
      type,
      name,
      description,
      price,
      images: images || [],
      availability: availability !== undefined ? availability : true,
      vendorId,
    });

    await newService.save();

    const vendor = await Vendor.findById(vendorId);
    vendor.servicesOffered.push(newService._id);
    await vendor.save();

    return res.status(201).json({
      message: "Service added successfully",
      service: newService,
    });
  } catch (error) {
    console.log("Error in addService:", error);
    res.status(500).json({ message: "Server error in addService" });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { serviceId } = req.params;

    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can update services" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.vendorId?.toString() !== vendorId) {
      return res.status(403).json({ message: "Not authorized to update this service" });
    }

    const updateData = req.body;
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.log("Error in updateService:", error);
    res.status(500).json({ message: "Server error in updateService" });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { serviceId } = req.params;

    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can delete services" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.vendorId?.toString() !== vendorId) {
      return res.status(403).json({ message: "Not authorized to delete this service" });
    }

    await Service.findByIdAndDelete(serviceId);

    const vendor = await Vendor.findById(vendorId);
    vendor.servicesOffered = vendor.servicesOffered.filter(
      id => id.toString() !== serviceId
    );
    await vendor.save();

    return res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteService:", error);
    res.status(500).json({ message: "Server error in deleteService" });
  }
};

// Get my services
export const getMyServices = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can access this" });
    }

    const services = await Service.find({ vendorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Services retrieved successfully",
      services,
      count: services.length,
    });
  } catch (error) {
    console.log("Error in getMyServices:", error);
    res.status(500).json({ message: "Server error in getMyServices" });
  }
};

// Update availability calendar
export const updateAvailability = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can update availability" });
    }

    const { availabilityCalendar } = req.body;

    if (!Array.isArray(availabilityCalendar)) {
      return res.status(400).json({ message: "availabilityCalendar must be an array" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { availabilityCalendar },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      message: "Availability updated successfully",
      vendor,
    });
  } catch (error) {
    console.log("Error in updateAvailability:", error);
    res.status(500).json({ message: "Server error in updateAvailability" });
  }
};

// Upload deliverables (mark task completion)
export const uploadDeliverables = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { bookingId } = req.params;
    const { deliverables, status, notes } = req.body;

    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can upload deliverables" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if vendor is assigned (handle both ObjectId and string comparison)
    const isAssigned = booking.vendors.some(v => {
      const vId = v._id ? v._id.toString() : v.toString();
      return vId === vendorId || vId === vendorId.toString();
    });

    if (!isAssigned) {
      return res.status(403).json({ message: "Not assigned to this booking" });
    }

    // Store deliverables (you might want a separate Deliverable model)
    booking.vendorDeliverables = booking.vendorDeliverables || [];
    booking.vendorDeliverables.push({
      vendorId,
      deliverables: deliverables || [],
      status: status || 'completed',
      notes: notes || '',
      uploadedAt: new Date(),
    });

    await booking.save();

    return res.status(200).json({
      message: "Deliverables uploaded successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in uploadDeliverables:", error);
    res.status(500).json({ message: "Server error in uploadDeliverables" });
  }
};

// Submit invoice
export const submitInvoice = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { bookingId } = req.params;
    const { amount, description, invoiceUrl } = req.body;

    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can submit invoices" });
    }

    if (!amount || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if vendor is assigned (handle both ObjectId and string comparison)
    const isAssigned = booking.vendors.some(v => {
      const vId = v._id ? v._id.toString() : v.toString();
      return vId === vendorId || vId === vendorId.toString();
    });

    if (!isAssigned) {
      return res.status(403).json({ message: "Not assigned to this booking" });
    }

    // Store invoice (you might want a separate Invoice model)
    booking.vendorInvoices = booking.vendorInvoices || [];
    booking.vendorInvoices.push({
      vendorId,
      amount,
      description,
      invoiceUrl: invoiceUrl || '',
      status: 'pending',
      submittedAt: new Date(),
    });

    await booking.save();

    return res.status(200).json({
      message: "Invoice submitted successfully",
      invoice: {
        vendorId,
        amount,
        description,
        invoiceUrl,
        status: 'pending',
      },
    });
  } catch (error) {
    console.log("Error in submitInvoice:", error);
    res.status(500).json({ message: "Server error in submitInvoice" });
  }
};

// Get my reviews
export const getMyReviews = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId || req.user?.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can access this" });
    }

    const reviews = await Review.find({ targetId: vendorId, targetType: 'vendor' })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews,
      averageRating: avgRating.toFixed(2),
      count: reviews.length,
    });
  } catch (error) {
    console.log("Error in getMyReviews:", error);
    res.status(500).json({ message: "Server error in getMyReviews" });
  }
};

