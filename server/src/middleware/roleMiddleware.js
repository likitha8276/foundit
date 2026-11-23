const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.'
    });
  }

  next();
};

const requireActiveUser = (req, res, next) => {
  if (!req.user || !req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is disabled or inactive.'
    });
  }
  next();
};

module.exports = {
  requireAdmin,
  requireActiveUser
};
