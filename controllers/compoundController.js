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

exports.uploadphoto = upload.single('Image');

exports.resizePhoto = (req, res, next) => {

    if (!req.file) return next();

    req.file.filename = `compound-${req.ID}-${Date.now()}.jpeg`;

    sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/compounds/${req.file.filename}`);
    next();
}

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
  const compound = new Compound({
    name: req.body.name,
    estates: req.body.estates,
    compoundImages: req.file ? req.file.filename : 'default.png',
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    description: req.body.description,
    contactInfo: req.body.contactInfo,
    workers: req.body.workers
  });

  try {
    const newCompound = await compound.save();
    res.status(201).json(newCompound);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    const compound = await Compound.findById(req.params.id);
    if (!compound) {
      return res.status(404).json({ message: 'Compound not found' });
    }

    await compound.remove();
    res.status(200).json({ message: 'Compound deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
