const Developer = require('../models/DevelopersModel');

// Get all developers
exports.getAllDevelopers = async (req, res) => {
    try {
        const developers = await Developer.find().populate('projects');
        res.status(200).json(developers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a developer by ID
exports.getDeveloperById = async (req, res) => {
    try {
        const developer = await Developer.findById(req.params.id).populate('projects');
        if (!developer) return res.status(404).json({ message: 'Developer not found' });
        res.status(200).json(developer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new developer
exports.createDeveloper = async (req, res) => {
    const developer = new Developer({
        name: req.body.name,
        company: req.body.company,
        projects: req.body.projects,
        contactInfo: req.body.contactInfo,
        bio: req.body.bio
    });

    try {
        const newDeveloper = await developer.save();
        res.status(201).json(newDeveloper);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a developer
exports.updateDeveloper = async (req, res) => {
    try {
        const updatedDeveloper = await Developer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedDeveloper) return res.status(404).json({ message: 'Developer not found' });
        res.status(200).json(updatedDeveloper);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a developer
exports.deleteDeveloper = async (req, res) => {
    try {
        const developer = await Developer.findByIdAndDelete(req.params.id);
        if (!developer) return res.status(404).json({ message: 'Developer not found' });
        res.status(200).json({ message: 'Developer deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
