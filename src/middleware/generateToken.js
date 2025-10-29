import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load env variables locally in this file
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET) throw new Error("JWT secret is not defined in .env");

const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export default generateToken;
