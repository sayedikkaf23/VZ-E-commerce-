const jwt = require("jsonwebtoken");
// const { SECRET } = require("../../config");
const User = require("../models/user");

module.exports = (function () {
  this.decodeTokenAndGetUser = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded;
  };

  this.authMiddleware = async (req, res, next) => {
    const token = req.header("authorization");
    if (!token) {
      res.statusCode = 401;
      res.json({ success: false, message: "Please login!" });
      return;
    }
    try {
      const data = await this.decodeTokenAndGetUser(token);
      if (!data) {
        res.json({ success: false, message: "Please login again!" }, 401);
        return;
      }
      req.user = await User.findById(data.id, null, { lean: true });

      next();
    } catch (error) {
      next(error);
    }
  };

  this.getToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, JWT_SECRET, {
      expiresIn: "90 days",
    });
  };

  return this;
})();
