const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");

  // Check if no token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};
