const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const verifyJWT = async (req, res, next) => {
  console.log("verifyjwt");

  try {
    console.log("accesstoken - ", req.cookies.accessToken);
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.send("Unauthorized request ");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETS);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      res.send("Invalid Access Token");
      return;
    }
    console.log("req send by = ", user);
    req.user = user;
    req.username = user.username;
    req.isLogedIn = true;
    next();
  } catch (err) {
    console.log("error : ", err);
    res.json({ verifyJWT_middleware_err: err });
  }
};

module.exports = verifyJWT;
