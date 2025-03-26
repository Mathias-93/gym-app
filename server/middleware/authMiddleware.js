import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  // console.log("Checking authentication...");
  // console.log("Cookies:", req.cookies);

  const token = req.cookies.token; // Read from cookie

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("JWT verification failed:", err.message);
      return res.status(403).json({ message: "Forbidden - Invalid token." });
    }
    req.user = user; // Attach decoded token data to request
    next();
  });
};

export default authenticateToken;
