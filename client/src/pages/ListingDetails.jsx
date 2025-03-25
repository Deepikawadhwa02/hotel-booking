import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import ReviewItem from "../components/ReviewsItem";
import ReviewForm from "../components/ReviewsAdd";
import WeatherWidget from "../components/Weather";
import NearbyPlaces from "../components/NearbyPlace";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);

  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState('');

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };
  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/reviews/${listingId}`,{
          method: "GET",
        }
      );
      // setReviews(response.data.reviews);
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching listing:", err);
    }
  };
  useEffect(() => {
    getListingDetails();
    fetchReviews();
  }, []);
  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:3001/reviews/${reviewId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        fetchReviews(); // Refresh reviews after deletion
      } else {
        console.error('Failed to delete review');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };
  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    // Update the selected date range when user makes a selection
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.round(end - start) / (1000 * 60 * 60 * 24); // Calculate the difference in day unit

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.user?._id);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      };

      const response = await fetch("http://localhost:3001/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });
      
      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }
    } catch (err) {
      console.log("Submit Booking Failed.", err.message);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />

      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item) => (
            <img
              src={`http://localhost:3001/${item.replace("public", "")}`}
              alt="listing photo"
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={`http://localhost:3001/${listing.creator?.profileImagePath.replace(
              "public",
              ""
            )}`}
          />
          <h3>
            Hosted by {listing.creator?.firstName} {listing.creator?.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />
        {/* <WeatherWidget locationName={listing.city} /> */}
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />
        <NearbyPlaces listingId={listingId} />
        <div className="booking">
          <div className="booking-reviews">
            <div>
              <h2>What this place offers?</h2>
              <div className="amenities">
                {listing.amenities[0].split(",").map((item, index) => (
                  <div className="facility" key={index}>
                    <div className="facility_icon">
                      {
                        facilities.find((facility) => facility.name === item)
                          ?.icon
                      }
                    </div>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="reviews-section">
          <h2>Reviews</h2>
          <ReviewForm listingId={listingId} fetchReviews={fetchReviews}/>
          <div className="reviews-container">
            {reviews && reviews.length > 0 ? (
              <>
                <div className="reviews-summary">
                  <h3>
                    <span className="star filled">★</span>
                    {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)} · {reviews.length} reviews
                  </h3>
                </div>
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <ReviewItem key={review._id} review={review} onDelete={handleDeleteReview}/>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-reviews">No reviews yet</p>
            )}
          </div>
        </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              {dayCount > 1 ? (
                <h2>
                  ₹{listing.price} x {dayCount} nights
                </h2>
              ) : (
                <h2>
                  ₹{listing.price} x {dayCount} night
                </h2>
              )}

              <h2>Total price: ₹{listing.price * dayCount}</h2>
              <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toDateString()}</p>

              <button className="button" type="submit" onClick={handleSubmit}>
                BOOKING
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;
