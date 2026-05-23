import User from "../Models/User.model.js";
import Admin from "../Models/Admin.model.js";
import Planner from "../Models/Planner.model.js";
import Vendor from "../Models/Vendor.model.js";
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
import jwt from 'jsonwebtoken'
import Service from "../Models/Service.model.js";
dotenv.config();

export const SignupController = async (req, res) => {
  try {
    const { username, adminName, plannerName, email, password, contactDetails, role,servicesOffered } = req.body;
    if (!(username || adminName || plannerName)|| !email || !password || !role || !contactDetails) {
      return res.status(400).json({
        message: "Please fill all the mendatory fields",
      });
    }
    const validRoles = ["user", "admin", "planner", "vendor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Role is not valid",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }
    if (role === "user" && (await User.findOne({ email }))) {
      return res.status(400).json({
        message: "User already exist",
      });
    }
    if (role === "planner" && (await Planner.findOne({ email }))) {
      return res.status(400).json({
        message: "Planner already exist",
      });
    }
    if (role === "vendor" && (await Vendor.findOne({ email }))) {
      return res.status(400).json({
        message: "Vendor already exist",
      });
    }
    if (role === "admin" && (await Admin.findOne({ email }))) {
      return res.status(400).json({
        message: "Admin already exist",
      });
    }

    let contactStr = contactDetails.toString();
    const leadingZeros = contactStr.match(/^0+/g);
    const zeroCount = leadingZeros ? leadingZeros[0].length : 0;

    if (contactStr.length === 10 && /^[1-9]\d{9}$/.test(contactStr)) {
    } else if (contactStr.length === 11 && zeroCount === 1 && /^[0][1-9]\d{9}$/.test(contactStr)) {
      contactStr = contactStr.slice(1);
    }else{
        return res.status(400).json({
        message: "Invalid contact number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;
    if (role === "user") {
      newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        contactDetails,
        role,
      });
    } else if (role === "planner") {
      newUser = await Planner.create({
        plannerName,
        email,
        password: hashedPassword,
        contactDetails,
        role,
      });
    } else if (role === "vendor") {
      newUser = await Vendor.create({ username, email, password: hashedPassword, contactDetails, role });

      // Handle vendor services if provided
      if (Array.isArray(servicesOffered) && servicesOffered.length > 0) {
        const createdServices = await Promise.all(
          servicesOffered.map(async (service) => {
            return await Service.create({
              type: service.type,
              description: service.description,
              price: service.price,
              vendorId: newUser._id
            });
          })
        );
        newUser.servicesOffered = createdServices.map(s => s._id);
        await newUser.save();
      }
    }else if (role === "admin") {
      newUser = await Admin.create({
        adminName,
        email,
        contactDetails,
        password: hashedPassword,
        role,
      });
    }
    return res.status(201).json({
      message: `User created successfully with role ${role}`,
      newUser,
    });
  } catch (error) {
    console.log(error, "Signup Controller Error");
    return res.status(500).json({
      message:"Singup Controller Server Error"
    })
  }
};

export const SigninController = async (req, res) => {
  try {
    const { nameoremail, password, role } = req.body;

    if (!nameoremail || !password || !role) {
      return res.status(401).json({
        message: "Fill all mandatory details",
      });
    }

    let existingUser;

    if (role === 'user') {
      existingUser = await User.findOne({
        $or: [
          { username: nameoremail },
          { email: nameoremail },
        ],
      });
      if (!existingUser) {
        return res.status(400).json({
          message: "User does not exist",
        });
      }
      if(existingUser.role !==role)
      {
        return res.status(400).json({
          message:"Not Authorized with this role"
        })
      }
    } 
    else if (role === 'admin') {
      existingUser = await Admin.findOne({
        $or: [
          { adminName: nameoremail },
          { email: nameoremail },
        ],
      });
      if (!existingUser) {
        return res.status(400).json({
          message: "Admin does not exist",
        });
      }
      if(existingUser.role !==role)
      {
        return res.status(400).json({
          message:"Not Authorized with this role"
        })
      }
    } 
    else if (role === 'planner') {
      existingUser = await Planner.findOne({
        $or: [
          { plannerName: nameoremail },
          { email: nameoremail },
        ],
      });
      if (!existingUser) {
        return res.status(400).json({
          message: "Planner does not exist",
        });
      }
      if(existingUser.role !==role)
      {
        return res.status(400).json({
          message:"Not Authorized with this role"
        })
      }
    } 
    else if (role === 'vendor') {
      existingUser = await Vendor.findOne({
        $or: [
          { username: nameoremail },
          { email: nameoremail },
        ],
      });
      if (!existingUser) {
        return res.status(400).json({
          message: "Vendor does not exist",
        });
      }
      if(existingUser.role !==role)
      {
        return res.status(400).json({
          message:"Not Authorized with this role"
        })
      }
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: existingUser._id, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    return res.status(200).json({
      message: "Signin successful",
      token,
      user:{
        id:existingUser.id,
        role:existingUser.role,
        email:existingUser.email,
        name: existingUser.username || existingUser.plannerName || existingUser.adminName
      }
    });

  } catch (error) {
    console.log(error.message, "SigninController error");
    return res.status(500).json({ message: "SignIN Server error" });
  }
};

export const passwordReset = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id, role } = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    let userModel;
    if (role === 'user') userModel = User;
    else if (role === 'admin') userModel = Admin;
    else if (role === 'planner') userModel = Planner;
    else if (role === 'vendor') userModel = Vendor;
    else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    existingUser.password = hashedNewPassword;
    await existingUser.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error, "passwordReset Error");
    return res.status(500).json({ message: "Password Reset Server Error" });
  }
};
