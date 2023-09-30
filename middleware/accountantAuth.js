const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  } else {
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Unauthorized: token not " });
      } else {
        if (user.isAccountant) {
          // Check user type
          req.user = user;
          next();
        } else {
          return res.status(403).json({ message: "Unauthorized: token not " });
        }
      }
    });
  }
};

module.exports = {
  verifyToken,
};
