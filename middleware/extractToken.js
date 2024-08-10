const extractToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        console.log('Token extracted:', token);
        req.token = token;
    }
    next();
};

module.exports = extractToken;