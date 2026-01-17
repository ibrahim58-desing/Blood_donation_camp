import jwt from "jsonwebtoken";
import { Users } from "../Mongoose/Model/UserSchema.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Users.findById(decoded.id); // ✔ full user

      if (!req.user) {
        return res.status(401).json({ msg: "Users not found" });
      }

      next();
    } catch (err) {

      return res.status(401).json({ msg: "Not authorizedz, token failed",err});
    }
  } else {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }
};
