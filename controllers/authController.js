const User = require("../models/User");
const mongoose = require('mongoose');
const Message = require("../models/Messages"); // Ensure correct path
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure environment variables are loaded
const generateToken = require("./tokenController");
let counter = 1;
// register route

exports.register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUsers = await User.find().select("_id contacts").lean();

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      contacts: [],
    });

    await newUser.save(); // Save the new user first to get the _id

    // Create contact objects with the correct room IDs for the new user and update existing users
    let bulkUpdates = [];

    for (const existingUser of existingUsers) {
   // Generate a unique room ID for this pair

      // Add this contact to the new user's contacts list
      newUser.contacts.push({
        contactpersonid: existingUser._id,
        unreadCount: 0,
        lastChatTime: Date.now(),
        lastMessage: "Start chat",
      });

      // Update the existing user's contacts list with the new user
      bulkUpdates.push({
        updateOne: {
          filter: { _id: existingUser._id },
          update: {
            $push: {
              contacts: {
                contactpersonid: newUser._id,
                unreadCount: 0,
                lastChatTime: Date.now(),
                lastMessage: "Start chat",
              },
            },
          },
        },
      });
    }

    // Save the updated newUser contacts
    await newUser.save();

    // Perform bulk update to add new user to existing users' contact lists
    if (bulkUpdates.length > 0) {
      await User.bulkWrite(bulkUpdates);
    }

    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};


// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
     //console.log(user)
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
    });

    // Convert Mongoose document to a plain object and exclude the password
    const userObject = user.toObject();
    delete userObject.password;
   

    res.json({ message: "Logged in successfully", token, user: userObject });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Logout User
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Protected Route Example
exports.getProtectedData = [authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
}];

// details


exports.detail = async (req, res) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.email) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const email = decoded.email;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Convert user to object and remove sensitive fields
        const userObject = user.toObject();
        delete userObject.password;
        delete userObject._id;

        res.json(userObject);
    } catch (error) {
        console.error("Error in detail function:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
// idget 
exports.idget = async (req, res) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
      }
      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.email) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const email = decoded.email;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
          }
          
          res.json(user._id);
          // res.json(userObject);
          } catch (error) {
            console.error("Error in idget function:", error);
            return res.status(500).json({ message: "Internal server error" });
            }
            
            
          };

// update 

exports.updatedata = async (req, res) => {
  try {
      const { email, userName, about, dp } = req.body;

      if (!email) {
          return res.status(400).json({ success: false, message: "Email is required!" });
      }

      // Find user by email and update fields dynamically
      const updatedUser = await User.findOneAndUpdate(
          { email },
          { $set: { userName, about, dp } },
          { new: true, runValidators: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ success: false, message: "User not found!" });
      }

      res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
      console.error("Error updating user data:", error);
      res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Server-side: Express route to handle account deletion
// Server-side: Express route to handle account deletion
exports.DeleteAccount = async (req, res) => {
  const userId = req.body.id;

  // Check if the userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  console.log("User ID:", userId);

  try {
    // Attempt to delete the user by ID using the async/await pattern
    const data = await User.findByIdAndDelete(userId);

    // Check if the user was found and deleted
    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    // Successfully deleted the user
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    // Catch any errors that occur during the operation
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
