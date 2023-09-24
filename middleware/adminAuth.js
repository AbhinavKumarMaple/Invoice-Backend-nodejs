const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const rawHeaders = req.rawHeaders;
  const headerIndex = rawHeaders.indexOf("authenticate");

  if (headerIndex !== -1) {
    const token = rawHeaders[headerIndex + 1].split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      // Check user type
      if (user && user.user_type === 1) {
        req.user = user;
        next();
      } else {
        return res.sendStatus(403);
      }
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = {
  verifyToken,
};
