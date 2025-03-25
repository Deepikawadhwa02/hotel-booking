import { useState } from "react";
import "../styles/ListingCard.scss";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList, setTripList } from "../redux/state";

const ListingCard = ({
  id,
  listingId,
  creator,
  listingPhotoPaths,
  city,
  province,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const wishList = user?.wishList || [];
  const isLiked = wishList.find((item) => item?._id === listingId);
  
  const patchWishList = async () => {
    try {
      if (user?._id !== creator) {
        const response = await fetch(
          `http://localhost:3001/users/${user?._id}/${listingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        dispatch(setWishList(data.wishList));
      }
    } catch (err) {
      console.error("Failed to update wish list:", err);
    }
  };

  const removeBooking = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/users/delete/${id}`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        const updatedTrips = await response.json();
        dispatch(setTripList(updatedTrips));
        window.location.reload();
      } else {
        console.error("Failed to remove booking");
      }
    } catch (err) {
      console.error("Remove booking error:", err);
    }
  };

  const handlePayment = async (e) => {
    e.stopPropagation();

    try {
      const response = await fetch("http://localhost:3001/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice * 100,
          currency: "INR",
          customerId: user._id,
          hostId: creator,
          listingId,
          startDate,
          endDate,
          totalPrice,
        }),
      });

      const data = await response.json();

      if (data?.id && window.Razorpay) {
        const options = {
          key: "rzp_test_NMfVLEL8kHrUkh",
          amount: data.amount,
          currency: data.currency,
          name: "Your Booking Platform",
          description: `Booking for ${category} in ${city}`,
          order_id: data.id,
          handler: async (response) => {
            const verifyResponse = await fetch(
              "http://localhost:3001/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: user._id,
                  listingId,
                  bookingId: data.bookingId,
                }),
              }
            );
            const verificationResult = await verifyResponse.json();
            if (verificationResult.success) {
              navigate("/");
            } else {
              alert("Payment verification failed");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || "",
          },
          theme: { color: "#3399cc" },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        alert("Failed to initialize Razorpay");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
    }
  };

  return (
    <div
      className="listing-card"
      onClick={() => navigate(`/properties/${listingId}`)}
    >
      <div className="slider-container">
        <div
          className="slider"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {listingPhotoPaths?.map((photo, index) => (
            <div key={index} className="slide">
              <img
                src={`http://localhost:3001/${photo.replace("public", "")}`}
                alt={`photo ${index + 1}`}
              />
              <div
                className="prev-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(
                    (prevIndex) =>
                      (prevIndex - 1 + listingPhotoPaths.length) %
                      listingPhotoPaths.length
                  );
                }}
              >
                <ArrowBackIosNew sx={{ fontSize: "15px" }} />
              </div>
              <div
                className="next-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(
                    (prevIndex) => (prevIndex + 1) % listingPhotoPaths.length
                  );
                }}
              >
                <ArrowForwardIos sx={{ fontSize: "15px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <h3>
        {city}, {province}, {country}
      </h3>
      <p>{category}</p>
      {!booking ? (
        <>
          <p>{type}</p>
          <p>
            <span>₹{price}</span> per night
          </p>
        </>
      ) : (
        <>
          <p>
            {startDate} - {endDate}
          </p>
          <p>
            <span>₹{totalPrice}</span> total
          </p>
        </>
      )}
      {booking && (
        <button
          className="remove-button"
          onClick={(e) => {
            e.stopPropagation();
            removeBooking();
          }}
        >
          Remove
        </button>
      )}
      <button
        className="favorite"
        onClick={(e) => {
          e.stopPropagation();
          patchWishList();
        }}
        disabled={!user}
      >
        {isLiked ? (
          <Favorite sx={{ color: "red" }} />
        ) : (
          <Favorite sx={{ color: "white" }} />
        )}
      </button>
      {booking && (
        <button onClick={handlePayment}>
          Book Now
        </button>
      )}
    </div>
  );
};

export default ListingCard;
