const jwt = require('jsonwebtoken');
// Authentication Middleware
const checktoken = (req, res, next) => {
  // Extract token from cookies
  const token = req.cookies.token; 
  //console.log("Auth middleware called. at checktoken.js");
  // Check if token is missing
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token found" });
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    return res.status(200).json({ message: "authorized" });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = checktoken;
