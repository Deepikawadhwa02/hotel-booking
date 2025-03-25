import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Verification.css";

const VerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const handleVerification = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          verificationCode,
        }),
      });

      const data = await response.json();
      

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Store token and navigate to home
      localStorage.setItem("token", data.token);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch("http://localhost:3001/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("New verification code sent to your email!");
    } catch (err) {
      setError(err.message || "Failed to resend verification code");
    }
  };

  // if (!userId) {
  //   return <navigate to="/register" replace />;
  // }

  return (
    <div className="verification">
      <div className="verification_content">
        <h1>Email Verification</h1>
        <p>Please enter the verification code sent to your email</p>
        
        <form className="verification_content_form" onSubmit={handleVerification}>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "VERIFYING..." : "VERIFY"}
          </button>
        </form>
        
        <button 
          className="resend-button"
          onClick={handleResendCode}
          disabled={isSubmitting}
        >
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default VerificationPage;