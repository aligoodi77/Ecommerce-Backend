import dotenv from "dotenv";
dotenv.config();
console.log("JWT_SECRET_KEY:", process.env.JWT_SECRET_KEY); // test

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./src/users/user.route.js";
import productsRoutes from "./src/products/products.route.js";
import reviewsRoutes from "./src/reviews/reviews.route.js";
import ordersRoutes from "./src/orders/orders.route.js";
import statsRoutes from "./src/stats/stats.route.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use(cookieParser());

// ✅ Dynamic CORS (allow any localhost port)
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("https://localhost")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/stats", statsRoutes);

// MongoDB connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Server is running 🚀"));

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
