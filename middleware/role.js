// middleware to restrict access based on user roles
const permit = (...roles) => {
  return (req, res, next) => {
    // check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient rights' });
    }
    next(); // continue if role is permitted
  };
};

module.exports = permit;
