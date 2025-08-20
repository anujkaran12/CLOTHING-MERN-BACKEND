const jwt = require("jsonwebtoken");

const loginValidator = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = req.cookies.JWT_TOKEN || authHeader;
  
  if (!token || token === "null") {
    return res.status(401).json( "No token provided");
  }

  try {
    const { payload } = jwt.verify(token, process.env.JWT_KEY); // replace with your secret
    req.id = payload; // attach user info to request

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json("Invalid or expired token");
  }
};

module.exports = { loginValidator };
