import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.scss";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        setFormData((prev) => ({
          ...prev,
          profileImage: file,
        }));
      } else {
        setError("Please select a valid image file");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (name === "email") {
        setEmailValid(validateEmail(value));
      }
    }
  };

  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword ||
        formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  const navigate = useNavigate();

  const uploadImage = async (userId) => {
    try {
      const imageForm = new FormData();
      imageForm.append("profileImage", formData.profileImage);

      const uploadResponse = await fetch("http://localhost:3001/auth/upload-image", {
        method: "POST",
        body: imageForm,
      });

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed");
      }

      const imageData = await uploadResponse.json();

      const updateResponse = await fetch(`http://localhost:3001/auth/update-profile-image/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath: imageData.imagePath }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile image");
      }

      return imageData.imagePath;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        throw new Error("All fields are required");
      }

      if (!emailValid) {
        throw new Error("Invalid email format");
      }

      if (!passwordMatch) {
        throw new Error("Passwords do not match");
      }

      // Prepare the JSON data excluding the profile image
      const { firstName, lastName, email, password } = formData;
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      };
      
      // Register user
      const registerResponse = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        throw new Error(data.message || "Registration failed");
      }

      const { user } = await registerResponse.json();

      // Upload profile image if present
      if (formData.profileImage) {
        setUploadProgress(50);
        await uploadImage(user._id);
        setUploadProgress(100);
      }

      // Navigate to verification page with userId
      // console.log(user);
      
      navigate("/verify", { 
        state: { 
          userId: user?._id,
          email: user?.email // Optional: Can be used to display the email in verification page
        }
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        <form className="register_content_form" onSubmit={handleSubmit}>
          <input
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {!emailValid && <p style={{ color: "red" }}>Invalid email format!</p>}
          <input
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
          />
          <input
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            required
          />
          {!passwordMatch && <p style={{ color: "red" }}>Passwords do not match!</p>}
          <input
            id="image"
            type="file"
            name="profileImage"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="image">
            <img src="/assets/addImage.png" alt="add profile photo" />
            <p>Upload Your Photo</p>
          </label>
          {formData.profileImage && (
            <div className="preview-image">
              <img
                src={URL.createObjectURL(formData.profileImage)}
                alt="profile photo"
                style={{ maxWidth: "80px" }}
              />
              <p>{formData.profileImage.name}</p>
            </div>
          )}
          {uploadProgress > 0 && (
            <div className="upload-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={!passwordMatch || !emailValid || isSubmitting}>
            {isSubmitting ? "REGISTERING..." : "REGISTER"}
          </button>
        </form>
        <a href="/login">Already have an account? Log In Here</a>
      </div>
    </div>
  );
};

export default RegisterPage;