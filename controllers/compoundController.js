const Compound = require('../models/CompoundModel');
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

exports.uploadphoto = upload.array('compoundImages', 5);

exports.resizePhoto = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    req.body.compoundImages = [];

    await Promise.all(
        req.files.map(async (file, i) => {
            const filename = `compound-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(500, 500)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/compounds/${filename}`);

            req.body.compoundImages.push(filename);
        })
    );

    next();
};



// Get all compounds
exports.getAllCompounds = async (req, res) => {
  try {
    const compounds = await Compound.find().populate('estates').populate('workers');
    res.status(200).json(compounds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single compound by ID
exports.getCompoundById = async (req, res) => {
  try {
    const compound = await Compound.findById(req.params.id).populate('estates').populate('workers');
    if (!compound) {
      return res.status(404).json({ message: 'Compound not found' });
    }
    res.status(200).json(compound);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new compound
exports.createCompound = async (req, res) => {
  try {
      // Check if a compound with the same name and address already exists
      const existingCompound = await Compound.findOne({
          name: req.body.name,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state
      });

      if (existingCompound) {
          return res.status(400).json({
              status: 'fail',
              message: 'Compound with this title and location already exists'
          });
      }

      // Use the processed images or default to 'default.png'
      const compoundImages = req.body.compoundImages.length > 0 
          ? req.body.compoundImages 
          : ['default.png'];

      // Create new compound
      const newCompound = await Compound.create({
          ...req.body,
          compoundImages: compoundImages
      });

      res.status(201).json({
          status: 'success',
          data: newCompound,
          message: 'Compound created successfully'
      });
  } catch (err) {
      res.status(400).json({
          status: 'fail',
          message: err.message
      });
  }
};



// Update a compound by ID
exports.updateCompound = async (req, res) => {
  try {
    const compound = await Compound.findById(req.params.id);
    if (!compound) {
      return res.status(404).json({ message: 'Compound not found' });
    }

    Object.assign(compound, req.body);
    const updatedCompound = await compound.save();
    res.status(200).json(updatedCompound);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a compound by ID
exports.deleteCompound = async (req, res) => {
  try {
    // Find and delete the compound by ID
    const compound = await Compound.findByIdAndDelete(req.params.id);

    if (!compound) {
      return res.status(404).json({ message: 'Compound not found' });
    }

    res.status(200).json({ message: 'Compound deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

