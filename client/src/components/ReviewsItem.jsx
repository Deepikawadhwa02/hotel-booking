import "../styles/Reviews.scss";
import { useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';

const ReviewItem = ({ review, onDelete }) => {
  const currentUser = useSelector((state) => state?.user);
  const isAuthor = currentUser?._id === review.user_id._id;

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="reviewer-info">
          <img 
            src={`http://localhost:3001/${review.user_id.profileImagePath.replace("public", "")}`}
            alt="Profile"
            className="reviewer-image"
          />
          <div className="reviewer-details">
            <div className="name-actions">
              <h4>{review.user_id.firstName} {review.user_id.lastName}</h4>
              {isAuthor && (
                <button 
                  onClick={() => onDelete(review._id)}
                  className="delete-button"
                  aria-label="Delete review"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="review-date">
              {new Date(review.review_date).toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="rating">
          {[...Array(5)].map((_, index) => (
            <span key={index} className={index < review.rating ? "star filled" : "star"}>
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="review-text">{review.review_text}</p>
    </div>
  );
};

export default ReviewItem;