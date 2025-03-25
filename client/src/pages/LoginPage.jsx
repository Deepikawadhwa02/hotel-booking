import React, { useState } from "react";
import "../styles/Login.scss";
import { setLogin } from "../redux/state";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State to store error messages

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message); // Set error message from server response
        return;
      }

      const loggedIn = await response.json();

      dispatch(
        setLogin({
          user: loggedIn.user,
          token: loggedIn.token,
        })
      );
      
      navigate("/");

    } catch (err) {
      console.error("Login failed", err.message);
      setError("Login failed. Please try again."); // Generic error message
    }
  };

  return (
    <div className="login">
      <div className="login_content">
        {error && <div className="error">{error}</div>} {/* Display error message */}
        <form className="login_content_form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">LOG IN</button>
        </form>
        <a href="/register">Don't have an account? Sign Up Here</a>
      </div>
    </div>
  );
};

export default LoginPage;
// import React, { useState } from "react";
// import "../styles/Login.scss"
// import { setLogin } from "../redux/state";
// import { useDispatch } from "react-redux"
// import { useNavigate } from "react-router-dom"

// const LoginPage = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const dispatch = useDispatch()

//   const navigate = useNavigate()

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     try {
//       const response = await fetch ("http://localhost:3001/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ email, password })
//       })

//       /* Get data after fetching */
//       const loggedIn = await response.json()

//       if (loggedIn) {
//         dispatch (
//           setLogin({
//             user: loggedIn.user,
//             token: loggedIn.token
//           })
//         )
//         navigate("/")
//       }

//     } catch (err){
//       console.err("Login failed", err.message)
//     }
//   }

//   return (
//     <div className="login">
//       <div className="login_content">
//         <form className="login_content_form" onSubmit={handleSubmit}>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <button type="submit">LOG IN</button>
//         </form>
//         <a href="/register">Don't have an account? Sign In Here</a>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;