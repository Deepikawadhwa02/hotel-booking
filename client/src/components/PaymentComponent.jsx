// components/PaymentPage.js
import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/PaymentComponent.css';

const PaymentPage = () => {
  const { amount } = useParams();
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError("Failed to initiate payment. Please try again.");
      }
    };
    fetchPaymentIntent();
  }, [amount]);

  const handlePayment = async () => {
    setLoading(true);
    if (!stripe || !elements) return;

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        setError(error.message);
      } else if (paymentIntent?.status === "succeeded") {
        alert("Payment successful!");
        navigate("/");
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>Complete Your Payment</h2>
      <CardElement />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handlePayment} disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

export default PaymentPage;
