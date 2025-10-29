import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const generateToken = (user) => {
  if (!JWT_SECRET) throw new Error("JWT secret is not defined in .env");
  return jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export default generateToken;
