import verifyToken from "./verifyToken.js";
import User from "../users/user.model.js";

const verifyAdmin = async (req, res, next) => {
  try {
    // first verify token
    await new Promise((resolve, reject) => {
      verifyToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // now req.user has decoded data from verifyToken
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // all good, pass to next
    next();
  } catch (error) {
    console.error("verifyAdmin error:", error);
    res.status(403).json({ message: "Admin access required" });
  }
};

export default verifyAdmin;
