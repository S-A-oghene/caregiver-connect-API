module.exports = (req, res, next) => {
  // Check if user is authenticated via session
  if (req.isAuthenticated()) {
    return next();
  }
  // If not authenticated, send an error response
  res.status(401).json({
    error:
      "Unauthorized: You must be logged in to perform this action. Please log in via /auth/login.",
  });
};
