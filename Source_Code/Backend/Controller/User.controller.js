import GuestDetails from "../Models/GuestDetails.model.js";
import Vendor from "../Models/Vendor.model.js";
import Review from "../Models/Review.model.js";
import User from "../Models/User.model.js";
import Planner from "../Models/Planner.model.js";
import Booking from "../Models/Booking.model.js";

export const guestDetails = async (req, res) => {
  try {
    const { guestList, totalGuests, notes } = req.body;
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body" });
    }
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      return res.status(400).json({
        message: "No userId found",
      });
    }
    if (userRole !== "user") {
      return res.status(403).json({
        message: "Only users with role 'user' can submit guest details",
      });
    }

    if (
      !guestList ||
      !Array.isArray(guestList) ||
      guestList.length === 0 ||
      !totalGuests
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required details" });
    }

    for (let guest of guestList) {
      if (!guest.name) {
        return res.status(400).json({
          message: "Each guest must have a name",
        });
      }
    }
    const newGuestDetails = new GuestDetails({
      userId,
      guestList,
      totalGuests,
      notes,
    });
    await newGuestDetails.save();
    return res.status(201).json({
      message: "Guest Details Saved Successfully",
      guestDetails: newGuestDetails,
    });
  } catch (error) {
    console.log("Error in guestDetails:", error);
    res.status(500).json({ message: "Something went wrong in guestDetails" });
  }
};

export const getAllPlanners=async(req,res)=>{
    try {
        const userId=req.user?.id;
        if(!userId)
        {
            return res.status(400).json({
                message:"UserId is missing"
            })
        }
        const listofallplanners=await Planner.find().select("-password");
        if(listofallplanners<1)
        {
            return res.status(400).json({
                message:"No planner",
                planner:[]
            })
        }
        return res.status(200).json({
            message:"Here are the list of all Planner",
            planner:listofallplanners,
            count:listofallplanners.length
        })
        
    } catch (error) {
        console.log("Error in fetching planner");
        return res.status(500).json({
            message:"Server error in getallplanner"
      })
   }
}

export const getAllVendors = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        message: "UserId is missing",
      });
    }
    // Only show approved vendors to users
    const listofallvendors = await Vendor.find({ status: 'approved' })
      .select("-password")
      .populate("servicesOffered");
    if (listofallvendors.length < 1)
      return res.status(200).json({
        message: "No approved vendors available",
        vendors: [],
        count: 0,
      });
    return res.status(200).json({
      message: "Here are the list of all vendors",
      vendors: listofallvendors,
      count: listofallvendors.length,
    });
  } catch (error) {
    console.log("Error in getAllVendors ", error);
    res.status(500).json({ message: "Something went wrong in getAllVendors" });
  }
};

export const addReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { targetId, targetType, rating, comment } = req.body;

    if (!userId || req.user?.role !== 'user') {
      return res.status(403).json({ message: "Only users can add reviews" });
    }

    if (!targetId || !targetType || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this target
    const existingReview = await Review.findOne({ userId, targetId, targetType });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this " + targetType });
    }

    const review = new Review({
      userId,
      targetId,
      targetType,
      rating,
      comment: comment || '',
    });

    await review.save();

    // Update target's rating if it's a vendor or planner
    if (targetType === 'vendor') {
      const vendor = await Vendor.findById(targetId);
      if (vendor) {
        const reviews = await Review.find({ targetId, targetType: 'vendor' });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        vendor.rating = avgRating;
        vendor.reviews.push(review._id);
        await vendor.save();
      }
    } else if (targetType === 'planner') {
      const planner = await Planner.findById(targetId);
      if (planner) {
        const reviews = await Review.find({ targetId, targetType: 'planner' });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        planner.rating = avgRating;
        planner.reviews.push(review._id);
        await planner.save();
      }
    }

    return res
      .status(201)
      .json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("Add Review Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const profile = async (req, res) => {
  try {
    const { emailOrUserName } = req.body;
    if (!emailOrUserName) {
      return res.status(400).json({ message: "Required email or username" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUserName }, { username: emailOrUserName }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json({ user });
    }
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  const { emailOrUserName, prevData, updateData } = req.body;
  if (!emailOrUserName || !prevData || !updateData) {
    res.status(401).json({ message: "Missing required field" });
  }

  const user = await User.findOne({
    $or: [{ email: emailOrUserName }, { username: emailOrUserName }],
  });

  if (prevData == updateData){
      return res.status(400).json({message: "Same data found"});
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  } else {
    if (prevData === user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData)) {
        return res.status(400).json({ message: "Invalid email provide"});
      }
      const updateUser = await User.findOneAndUpdate(
        { email: prevData },
        { $set: { email: updateData } },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        message: "User updated successfully",
        user: updateUser
      });

    } else if (prevData === user.username) {
      const updateUser = await User.findOneAndUpdate(
        { username: prevData },
        { $set: { username: updateData } },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        message: "User updated successfully",
        user: updateUser
      });

    } else if (prevData === user.contactDetails) {
      let contactStr = updateData.toString();
      const leadingZeros = contactStr.match(/^0+/g);
      const zeroCount = leadingZeros ? leadingZeros[0].length : 0;

      if (contactStr.length === 10 && /^[1-9]\d{9}$/.test(contactStr)) {
      } else if (
        contactStr.length === 11 &&
        zeroCount === 1 &&
        /^[0][1-9]\d{9}$/.test(contactStr)
      ) {
        contactStr = contactStr.slice(1);
      }else {
        return res.status(400).json({
          message: "Invalid contact number",
        });
      }

      const updateUser = await User.findOneAndUpdate(
        { contactDetails: prevData },
        { $set: { contactDetails: updateData } },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        message: "User updated successfully",
        user: updateUser
      });

    } else{
      return res.status(400).json({message: "Invalid data provided"});
    }
  }
};

// Confirm booking (user accepts the booking)
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    if (!userId || req.user?.role !== 'user') {
      return res.status(403).json({ message: "Only users can confirm bookings" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: "Only pending bookings can be confirmed" });
    }

    booking.status = 'confirmed';
    await booking.save();
    await booking.populate('packageId destinationId plannerId');

    return res.status(200).json({
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    console.log("Error in confirmBooking:", error);
    res.status(500).json({ message: "Server error in confirmBooking" });
  }
};

// Get booking progress/timeline
export const getBookingProgress = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    if (!userId || req.user?.role !== 'user') {
      return res.status(403).json({ message: "Only users can view booking progress" });
    }

    const booking = await Booking.findById(bookingId)
      .populate('packageId destinationId plannerId')
      .populate({
        path: 'vendors',
        select: '-password'
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Create progress timeline
    const progress = {
      status: booking.status,
      steps: [
        {
          name: 'Booking Created',
          status: 'completed',
          date: booking.createdAt,
        },
        {
          name: 'Planner Assigned',
          status: booking.plannerId ? 'completed' : 'pending',
          date: booking.plannerId ? booking.updatedAt : null,
        },
        {
          name: 'Vendors Selected',
          status: booking.vendors && booking.vendors.length > 0 ? 'completed' : 'pending',
          date: booking.vendors && booking.vendors.length > 0 ? booking.updatedAt : null,
        },
        {
          name: 'Booking Confirmed',
          status: booking.status === 'confirmed' || booking.status === 'completed' ? 'completed' : 'pending',
          date: booking.status === 'confirmed' || booking.status === 'completed' ? booking.updatedAt : null,
        },
        {
          name: 'Wedding Completed',
          status: booking.status === 'completed' ? 'completed' : 'pending',
          date: booking.status === 'completed' ? booking.updatedAt : null,
        },
      ],
    };

    return res.status(200).json({
      message: "Booking progress retrieved successfully",
      booking,
      progress,
    });
  } catch (error) {
    console.log("Error in getBookingProgress:", error);
    res.status(500).json({ message: "Server error in getBookingProgress" });
  }
};
