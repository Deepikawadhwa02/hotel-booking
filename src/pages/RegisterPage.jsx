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
  const [error, setError] = useState(""); // State to store error messages

  // Validate email format
  const validateEmail = (email) => {
    // Simple regex for email validation (could be more robust)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Update form data and validate email
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = name === "profileImage" ? files[0] : value;

    // Update form data
    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Validate email if it's the email field
    if (name === "email") {
      setEmailValid(validateEmail(value));
    }
  };

  // Check password match whenever password or confirmPassword changes
  useEffect(() => {
    setPasswordMatch(formData.password === formData.confirmPassword || formData.confirmPassword === "");
  }, [formData.password, formData.confirmPassword]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailValid) {
      setError("Invalid email format");
      return;
    }

    if (!passwordMatch) {
      setError("Passwords do not match");
      return;
    }

    try {
      const register_form = new FormData();
      for (const key in formData) {
        register_form.append(key, formData[key]);
      }

      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        body: register_form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message); // Set error message from server response
        return;
      }

      navigate("/login");
    } catch (err) {
      console.log("Registration failed", err.message);
      setError("Registration failed. Please try again."); // Generic error message
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
          {!emailValid && (
            <p style={{ color: "red" }}>Invalid email format!</p>
          )}
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
          {!passwordMatch && (
            <p style={{ color: "red" }}>Passwords do not match!</p>
          )}
          <input
            id="image"
            type="file"
            name="profileImage"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
            required
          />
          <label htmlFor="image">
            <img src="/assets/addImage.png" alt="add profile photo" />
            <p>Upload Your Photo</p>
          </label>
          {formData.profileImage && (
            <img
              src={URL.createObjectURL(formData.profileImage)}
              alt="profile photo"
              style={{ maxWidth: "80px" }}
            />
          )}
          {error && <div className="error">{error}</div>} {/* Display error message */}
          <button type="submit" disabled={!passwordMatch || !emailValid}>
            REGISTER
          </button>
        </form>
        <a href="/login">Already have an account? Log In Here</a>
      </div>
    </div>
  );
};

export default RegisterPage;

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/Register.scss";

// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     profileImage: null,
//   });

//   const [passwordMatch, setPasswordMatch] = useState(true);
//   const [emailValid, setEmailValid] = useState(true);

//   // Validate email format
//   const validateEmail = (email) => {
//     // Simple regex for email validation (could be more robust)
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   };

//   // Update form data and validate email
//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     const newValue = name === "profileImage" ? files[0] : value;

//     // Update form data
//     setFormData({
//       ...formData,
//       [name]: newValue,
//     });

//     // Validate email if it's the email field
//     if (name === "email") {
//       setEmailValid(validateEmail(value));
//     }
//   };

//   // Check password match whenever password or confirmPassword changes
//   useEffect(() => {
//     setPasswordMatch(formData.password === formData.confirmPassword || formData.confirmPassword === "");
//   }, [formData.password, formData.confirmPassword]);

//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!emailValid) {
//       console.log("Invalid email format");
//       return;
//     }

//     try {
//       const register_form = new FormData();
//       for (var key in formData) {
//         register_form.append(key, formData[key]);
//       }

//       const response = await fetch("http://localhost:3001/auth/register", {
//         method: "POST",
//         body: register_form,
//       });

//       if (response.ok) {
//         navigate("/login");
//       }
//     } catch (err) {
//       console.log("Registration failed", err.message);
//     }
//   };

//   return (
//     <div className="register">
//       <div className="register_content">
//         <form className="register_content_form" onSubmit={handleSubmit}>
//           <input
//             placeholder="First Name"
//             name="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//             required
//           />
//           <input
//             placeholder="Last Name"
//             name="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//             required
//           />
//           <input
//             placeholder="Email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//           {!emailValid && (
//             <p style={{ color: "red" }}>Invalid email format!</p>
//           )}
//           <input
//             placeholder="Password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             type="password"
//             required
//           />
//           <input
//             placeholder="Confirm Password"
//             name="confirmPassword"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             type="password"
//             required
//           />
//           {!passwordMatch && (
//             <p style={{ color: "red" }}>Passwords do not match!</p>
//           )}
//           <input
//             id="image"
//             type="file"
//             name="profileImage"
//             accept="image/*"
//             style={{ display: "none" }}
//             onChange={handleChange}
//             required
//           />
//           <label htmlFor="image">
//             <img src="/assets/addImage.png" alt="add profile photo" />
//             <p>Upload Your Photo</p>
//           </label>
//           {formData.profileImage && (
//             <img
//               src={URL.createObjectURL(formData.profileImage)}
//               alt="profile photo"
//               style={{ maxWidth: "80px" }}
//             />
//           )}
//           <button type="submit" disabled={!passwordMatch || !emailValid}>
//             REGISTER
//           </button>
//         </form>
//         <a href="/login">Already have an account? Log In Here</a>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;

