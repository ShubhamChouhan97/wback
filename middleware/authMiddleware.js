const jwt = require('jsonwebtoken');
const User = require("../models/User");
// Authentication Middleware
const authenticate = async(req, res, next) => {
  // Extract token from cookies
  const token = req.cookies.token; 
  const email = req.body.user;
  //console.log("Auth middleware called. Token:", token);

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token found" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    if(email===decoded.email)
    {
      const user = await User.findOne({ email });
  if(user.token === token)
  {
        next();   
  }
  else{
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = authenticate;
