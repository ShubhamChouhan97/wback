const jwt = require('jsonwebtoken');
const User = require("../models/User");
// Authentication Middleware
const tokenverify = async (req, res) => {
  // Extract token from cookies
  const token = req.cookies.token; 
  const email = req.body.user;
  //console.log("Auth middleware called. at tokenverify");

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token found" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
if(email === decoded.email)
{
  const user = await User.findOne({ email });
  if(user.token === token)
  {
        return res.status(200).json({ message: "authorized" });

  }
  else{
    return res.status(401).json({ message: "Unauthorized" });
  }
 
}

    
    
    
  } catch (error) {
   // console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = tokenverify;
