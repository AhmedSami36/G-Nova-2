const Estate = require('../models/EstateModel');
const multer = require('multer');
const sharp = require('sharp');

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

exports.uploadphoto= upload.array('photos', 5);

exports.resizePhoto = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    // Array to store the filenames of resized images
    req.body.photos = [];

    // Loop over the uploaded files and process each one
    await Promise.all(
        req.files.map(async (file, i) => {
            const filename = `estate-${req.ID}-${Date.now()}-${i + 1}.jpeg`;

            // Resize the image and save it
            await sharp(file.buffer)
                .resize(500, 500)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/estates/${filename}`);

            // Push the filename to req.body.photos array
            req.body.photos.push(filename);
        })
    );

    next();
};




// Get all states
exports.getAllEstates = async (req, res) => {
    try {
        const estates = await Estate.find();
        res.status(200).json({
            status: 'success',
            data: estates,
            message: 'States retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};
// Get all estates by category
exports.getEstatesByCategory = async (req, res) => {
    try {
        
        const category = req.params.category;
        const estates = await Estate.find({ category });

        if (estates.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: `No estates found in the ${category} category`
            });
        }

        res.status(200).json({
            status: 'success',
            data: estates,
            message: `${category.charAt(0).toUpperCase() + category.slice(1)} estates retrieved successfully`
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};
// Get all estates by city
exports.getEstatesByCity = async (req, res) => {
    try {
        const city = req.params.city;
        const estates = await Estate.find({ location: city });

        if (estates.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: `No estates found in ${city}`
            });
        }

        res.status(200).json({
            status: 'success',
            data: estates,
            message: `Estates in ${city} retrieved successfully`
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};


// Get a state by ID
exports.getEstateById = async (req, res) => {
    try {
        const estates = await Estate.findById(req.params.id);
        if (!estates) {
            return res.status(404).json({
                status: 'fail',
                message: 'State not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: estates,
            message: 'State retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};
// Get an estate by name
exports.getEstateByName = async (req, res) => {
    try {
        const estate = await Estate.find({
            title: new RegExp(req.params.name, 'i')  
        });

        if (estate.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No estates found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: estate,
            message: 'Estates retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};


// Create a new state
exports.createEstate = async (req, res) => {
    
    try {
        // Check if a state with the same title and location already exists
        const existingEstate = await Estate.findOne({ title: req.body.title, location: req.body.location });
        if (existingEstate) {
            return res.status(400).json({
                status: 'fail',
                message: 'State with this title and location already exists'
            });
        }

        const photos = req.body.photos && req.body.photos.length > 0 
        ? req.body.photos 
        : ['default.png']; // Set default if no photos uploaded

        req.body.photos = photos; // Assign photos to the body

        // Create a new state
        const newEstate = await Estate.create(req.body);
        res.status(201).json({
            status: 'success',
            data: newEstate,
            message: 'State Created Successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Update an estate
exports.updateEstate = async (req, res) => {
    try {
        if (req.files && req.files.length > 0) {
           
            req.body.photos = req.body.photos && req.body.photos.length > 0 
                ? req.body.photos 
                : ['default.png']; 
        }


        // Update the estate with new data (including photo if applicable)
        const updatedEstate = await Estate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedEstate) {
            return res.status(404).json({
                status: 'fail',
                message: 'Estate not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: updatedEstate,
            message: 'Estate updated successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};


// Delete a state
exports.deleteEstate = async (req, res) => {
    try {
        const deletedEstate = await Estate.findByIdAndDelete(req.params.id);
        if (!deletedEstate) {
            return res.status(404).json({
                status: 'fail',
                message: 'State not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'State deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};
// Apply offer to an estate
exports.applyOffer = async (req, res) => {
    try {
        const estateId = req.params.id;
        const discountPercentage = req.body.discountPercentage || 0;

        // Find the estate by ID
        const estate = await Estate.findById(estateId);

        if (!estate) {
            return res.status(404).json({
                status: 'fail',
                message: 'Estate not found'
            });
        }

        // Apply the offer and save the estate
        await estate.makeOffer(discountPercentage);

        res.status(200).json({
            status: 'success',
            data: estate,
            message: `Offer applied successfully with a ${discountPercentage}% discount`
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};
// Remove offer from an estate by ID
exports.removeOffer = async (req, res) => {
    try {
        const estateId = req.params.id;

        // Find the estate by ID
        const estate = await Estate.findById(estateId);

        if (!estate) {
            return res.status(404).json({
                status: 'fail',
                message: 'Estate not found'
            });
        }

        // Remove the offer and restore the original price
        await estate.removeOffer();

        res.status(200).json({
            status: 'success',
            data: estate,
            message: 'Offer removed and original price restored successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};
// Get all estates with offers
exports.getAllEstatesWithOffers = async (req, res) => {
    try {
        const estatesWithOffers = await Estate.find({ offer: true });

        if (estatesWithOffers.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No estates with offers found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: estatesWithOffers,
            message: 'Estates with offers retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getNewlyLaunchedEstates = async (req, res) => {
    try {
        // Define the time frame for "newly launched" (e.g., within the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Query for estates created within the last 30 days
        const newEstates = await Estate.find({
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 }); // Sort by most recent first

        if (newEstates.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No newly launched estates found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: newEstates,
            message: 'Newly launched estates retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};