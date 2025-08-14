module.exports = (roles = []) => {
  // Coerce roles to be an array if a single role string is passed
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // The auth middleware should have already run and attached req.user
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      // user's role is not authorized
      return res.status(403).json({
        error: "Forbidden: You do not have permission to perform this action.",
      });
    }
    next();
  };
};