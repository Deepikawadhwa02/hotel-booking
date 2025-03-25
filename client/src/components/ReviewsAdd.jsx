import { useState } from "react";
import { useSelector } from "react-redux";
import "../styles/ReviewForm.scss";

const ReviewForm = ({ listingId, fetchReviews }) => {
  const [newReview, setNewReview] = useState({
    rating: 5,
    review_text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const customerId = useSelector((state) => state?.user?._id);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!customerId) {
      setReviewError("Please login to add a review");
      return;
    }

    if (newReview.review_text.length < 10) {
      setReviewError("Review must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);
    setReviewError("");

    try {
      const response = await fetch("http://localhost:3001/reviews/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: customerId,
          service_id: listingId,
          rating: newReview.rating,
          review_text: newReview.review_text,
        }),
      });

      if (response.ok) {
        // Refresh reviews after adding new one
        fetchReviews();
        // Reset form
        setNewReview({
          rating: 5,
          review_text: "",
        });
      } else {
        const data = await response.json();
        setReviewError(data.message || "Failed to add review");
      }
    } catch (err) {
      setReviewError("Error submitting review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="review-form-container">
      <h3>Add Your Review</h3>
      <form onSubmit={handleAddReview} className="review-form">
        <div className="rating-selector">
          <label>Rating:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${
                  star <= newReview.rating ? "filled" : ""
                }`}
                onClick={() => setNewReview({ ...newReview, rating: star })}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="review-input">
          <textarea
            value={newReview.review_text}
            onChange={(e) =>
              setNewReview({ ...newReview, review_text: e.target.value })
            }
            placeholder="Share your experience..."
            rows="4"
            required
            minLength="10"
          />
        </div>

        {reviewError && <div className="error-message">{reviewError}</div>}

        <button
          type="submit"
          className="submit-review"
          disabled={isSubmitting || !customerId}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div></>
  );
};

export default ReviewForm;