// config.js
require('dotenv').config();

module.exports = {
    // MongoDB connection URLs
    mongoURIS: process.env.MONGO_URI_LOCAL,
    mongoURI: process.env.MONGO_URI_REMOTE,

    // Port for the server to listen on
    port: process.env.PORT || 3002,

    // JWT Secret Key
    jwtSecret: process.env.JWT_SECRET
};
