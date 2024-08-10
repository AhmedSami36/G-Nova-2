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