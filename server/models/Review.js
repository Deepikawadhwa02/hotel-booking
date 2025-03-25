const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review_text: { type: String, required: true },
  review_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
