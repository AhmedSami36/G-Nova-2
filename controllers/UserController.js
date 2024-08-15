const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); 
const crypto = require('crypto');
const { sendemail } = require('../utils/email');
const multer = require('multer');
const sharp = require('sharp');
require('dotenv').config();
const saltRounds=10;


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb("Not an image! please upload only images.", false)
    }
}


const upload = multer({

    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadphoto = upload.single('Image');

const resizePhoto = (req, res, next) => {

    if (!req.file) return next();

    req.file.filename = `User-${req.ID}-${Date.now()}.jpeg`;

    sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
    next();
}



const signup = async (req, res) => {

    const { username, email,lastName,firstName, password, phoneNum } = req.body;
    let profilePic = req.file ? req.file.filename : 'default.png';

    try {
        // Check if user with the same email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if user with the same username already exists
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username already taken' });
        }


        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password,saltRounds);

       

        // Create a new user
        user = new User({ username, email,firstName,lastName, password:hashedPassword, phoneNum,profilePic });

        

        // Save user to the database
        await user.save();

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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate auth token
    const token = user.generateAuthToken();

    res.status(200).json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get current user
const getuserinfo = async (req, res) => {
    const userId = req.ID;
    
    try {
     
        
        if (!userId) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Find the user by ID and exclude the password field
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // 2. Generate OTP
        const otp = generateOTP();

        // 3. Set OTP and expiration time
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 3600000; // OTP valid for 1 hour

        // 4. Save the user with the OTP and expiration time
        await user.save();

        // 5. Send OTP via email
        const message = `Your OTP for password reset is ${otp}. It is valid for 1 hour.`;
        await sendemail({
            email: user.email,
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP validity
    if (user.resetPasswordOTP !== otp || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = '';
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


const updateprofile=async(req,res)=>{

  const userId = req.ID;
  const {firstName,lastName,email,mobileNumber,bio}=req.body;
    
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


const  getAllChatsForUser=async (req,res) =>{

  const userId = req.ID;
  try {
    const userWithChats = await User.findById(userId)
      .populate({
        path: 'chats',
        select: '_id participants',  // Select only the chat ID and participants
        populate: {
          path: 'participants',
          select: 'username firstName lastName profilePic' // Select user details to display in chat list
        }
      })
      .select('chats'); // Select only the chats field from the user document

    if (!userWithChats) {
      throw new Error('User not found');
    }

    res.status(200).json(userWithChats.chats);
  } catch (error) {
    console.error(error.message);
    throw new Error('Error fetching chats for user');
  }
}

const getChatHistoryForUser = async (req, res) => {
  const userId = req.ID; 
  const { chatId } = req.params; 

  try {
    const chat = await Chat.findById(chatId)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'username firstName lastName profilePic' 
        }
      })
      .populate({
        path: 'participants',
        select: 'username firstName lastName profilePic' 
      });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    
    const isParticipant = chat.participants.some(participant => participant._id.equals(userId));
    if (!isParticipant) {
      return res.status(403).json({ message: 'User is not a participant in this chat' });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};



const updateBio = async (req, res) => {
  try {
    const { bio } = req.body; // Bio to be updated from the request body

    if (!bio) {
      return res.status(400).json({ message: 'Bio is required' });
    }

    const user = await User.findByIdAndUpdate(req.ID, { bio }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Bio updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// View User Bio
const viewBio = async (req, res) => {
  try {
    const user = await User.findById(req.ID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ bio: user.bio });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


const addToFavourites = async (req, res) => {
  try {
    const userId = req.ID; // Use req.ID from the middleware
    const estateId = req.body.estateId;

    // Validate estateId
    if (!estateId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Estate ID is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favourite: estateId } }, // Add estate ID only if it's not already in the array
      { new: true }
    ).populate('favourite'); // Optionally populate the favourites with estate details

    res.status(200).json({
      status: 'success',
      data: user.favourite,
      message: 'Estate added to favourites successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Remove Estate from Favourites
const removeFromFavourites = async (req, res) => {
  try {
    const userId = req.ID; // Use req.ID from the middleware
    const estateId = req.body.estateId;

    // Validate estateId
    if (!estateId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Estate ID is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favourite: estateId } }, // Remove estate ID from the array
      { new: true }
    ).populate('favourite'); // Optionally populate the favourites with estate details

    res.status(200).json({
      status: 'success',
      data: user.favourite,
      message: 'Estate removed from favourites successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};

// View Favourites
const viewFavourites = async (req, res) => {
  try {
    const userId = req.ID; // Use req.ID from the middleware

    const user = await User.findById(userId).populate('favourite');

    res.status(200).json({
      status: 'success',
      data: user.favourite,
      message: 'Favourites retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};
const searchUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {

      const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).select('-password');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    signup,
    signin,
    getuserinfo,
    forgotPassword,
    resetPassword,
    updateprofile,
    viewFavourites,
    removeFromFavourites,
    addToFavourites,
    viewBio,
    updateBio,
    getAllChatsForUser,
    getChatHistoryForUser,
    searchUserByUsername,
    uploadphoto,
    resizePhoto

};
