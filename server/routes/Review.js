const express = require("express");
const Review = require("../models/Review");
const router = express.Router();

// Get all reviews for a service
router.get("/:serviceId", async (req, res) => {
  try {
    const reviews = await Review.find({ service_id: req.params.serviceId }).populate("user_id");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new review
router.post("/add", async (req, res) => {
  const { user_id, service_id, rating, review_text } = req.body;
  const review = new Review({ user_id, service_id, rating, review_text });
  try {
    await review.save();
    res.json({ message: "Review added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update review
router.put("/:id", async (req, res) => {
  const { rating, review_text } = req.body;
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, review_text },
      { new: true }
    );
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete review
router.delete("/:id", async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
