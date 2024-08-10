const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel'); 
const crypto = require('crypto');
const { sendemail } = require('../utils/email');

require('dotenv').config();
const saltRounds=10;

const signup = async (req, res) => {
    const { username, email, password} = req.body;

    try {
        // Check if user with the same email already exists
        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: 'admin with this email already exists' });
        }

        // Check if user with the same username already exists
        admin = await Admin.findOne({ username });
        if (admin) {
            return res.status(400).json({ message: 'Username already taken' });
        }


        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password,saltRounds);

       

        // Create a new user
        admin = new Admin({ username, email, password:hashedPassword });

        

        // Save user to the database
        await admin.save();

        // Generate auth token
       // const token = user.generateAuthToken();

        res.status(201).json({ 
            Message:'Signed up successfully' 
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};



// User login
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate auth token
    const token = admin.generateAuthToken();

    res.status(200).json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get current user
const getadmininfo = async (req, res) => {
    const adminId = req.ID;
    
    try {
     
        
        if (!adminId) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Find the user by ID and exclude the password field
        const admin = await Admin.findById(adminId).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        res.status(200).json(admin);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Find the user by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin with this email does not exist' });
        }

        // 2. Generate OTP
        const otp = generateOTP();

        // 3. Set OTP and expiration time
        admin.resetPasswordOTP = otp;
        admin.resetPasswordExpires = Date.now() + 3600000; // OTP valid for 1 hour

        // 4. Save the user with the OTP and expiration time
        await admin.save();

        // 5. Send OTP via email
        const message = `Your OTP for password reset is ${otp}. It is valid for 1 hour.`;
        await sendemail({
            email: admin.email,
            subject: 'Password Reset OTP',
            message: message
        });

        // 6. Send response
        res.status(200).json({ message: 'OTP sent to your email' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find the user by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check OTP validity
    if (admin.resetPasswordOTP !== otp || admin.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.resetPasswordOTP = '';
    admin.resetPasswordExpires = null;

    await admin.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

/*
const updateprofile=async(req,res)=>{

  const adminId = req.ID;
  const {email}=req.body;
    
  try {
   
      
      if (!userId) {
          return res.status(401).json({ message: 'No token, authorization denied' });
      }

      // Find the user by ID and exclude the password field
      const user = await User.findById(userId).select('-password');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.mobileNumber = mobileNumber || user.mobileNumber;
      user.bio = bio || user.bio;

      await user.save();
      res.status(200).json(user);

  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
  }

};

*/
module.exports = {
    signup,
    signin,
    getadmininfo,
    forgotPassword,
    resetPassword,
    //updateprofile
};
