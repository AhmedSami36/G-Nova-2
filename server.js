const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const authMiddleware = require('./src/middleware/authMiddleware');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const extractToken = require('./src/middleware/extractToken');
const config = require('./src/config/config');
//----------------------------------------------------------------

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: true, // Allow all origins
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,POST,PUT',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  };
  app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(helmet());
app.use(extractToken);
app.use(errorMiddleware);

//Routes

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI_REMOTE).then(() => {
    console.log('MongoDB connection successfully');
}).catch(err => {
    console.log(err);
    console.log('MongoDB connection failed');
    process.exit(1);
});

// Start the server
const PORT = config.port || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
