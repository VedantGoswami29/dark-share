const activeUsers = new Set();

module.exports = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    activeUsers.add(ip);
    req.activeUsers = activeUsers;
    next();
};
