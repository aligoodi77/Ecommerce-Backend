// src/products/products.route.js
import express from "express";
import Reviews from "../reviews/reviews.model.js";
import Products from "../products/products.model.js";

const router = express.Router();

// post a new review
router.post("/post-review", async (req, res) => {
  try {
    const { comment, rating, productId, userId } = req.body;

    if (!comment || !rating || !productId || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingReview = await Reviews.findOne({ productId, userId });

    if (existingReview) {
      existingReview.comment = comment;
      existingReview.rating = rating;
      await existingReview.save();
    } else {
      const newReview = new Reviews({
        comment,
        rating,
        productId,
        userId,
      });
      await newReview.save();
    }

    // calculate the average rating
    const reviews = await Reviews.find({ productId });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;

      const product = await Products.findById(productId);
      if (product) {
        product.rating = averageRating;
        await product.save({ validateBeforeSave: false });
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    res.status(200).json({
      message: "Review processed successfully",
      reviews,
    });
  } catch (error) {
    console.error("Error posting review", error);
    res.status(500).json({ message: "Failed to post review" });
  }
});

// total reviews count
router.get("/total-reviews", async (req, res) => {
  try {
    const totalReviews = await Reviews.countDocuments({});
    res.status(200).json({ totalReviews });
  } catch (error) {
    console.error("Error getting total review", error);
    res.status(500).json({ message: "Failed to get review count" });
  }
});

// get reviews by userid
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    const reviews = await Reviews.find({ userId }).sort({ createdAt: -1 });
    if (reviews.length === 0)
      return res.status(404).json({ message: "No reviews found" });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews by user", error);
    res.status(500).json({ message: "Failed to fetch reviews by user" });
  }
});

export default router;
