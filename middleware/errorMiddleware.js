// errorMiddleware.js

const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  };
  
  module.exports = errorMiddleware;