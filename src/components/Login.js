import  { useState } from "react";
import { checkValidData } from "../utils/validate";
//import { isTokenExpired } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const[role,setRole] = useState("");

  const navigate = useNavigate();

  const toggleSignInForm = () => {
    setIsSignIn(!isSignIn);
    setErrorMessage(null);
  };

  const handleValidate = async () => {
    const message = checkValidData(fullName, email, password);
    setErrorMessage(message);
    if (message) return;

    if (isSignIn) {
      try {
        const response = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // ✅ important for cookies
          
        });
        const res = await response.json();
        //const accessToken = res.accessToken
        console.log(res);
        if (res.accessToken) {
          localStorage.setItem("accessToken", res.accessToken); // ✅ This should overwrite the old one
          localStorage.setItem("user", JSON.stringify(res.user)); // ✅ store user info
          alert("Logged in Successfully");
          if (res.user.role !== "user") {
            navigate('/admindashboard'); // Go to admin area
          } else {
            navigate('/protected'); // Regular user area
          }
        } else {
          alert(res.error || "Login failed");
        }
      } catch (err) {
        console.log(err);
        setErrorMessage("Login failed. Please try again.");
      }
    } else {
      try {
        const response = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          //credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            password,
            
          }),
        });
        console.log(response);
        
        const data = await response.json();
        console.log(data);
        if(!data.error) alert("Signup successful");
        else alert(data.error)
        console.log(data.message);
        
        // Optionally reset fields:
        setFullName("");
        setEmail("");
        setPassword("");
        
      } catch (error) {
        console.log(error);
        setErrorMessage("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div>
      <form
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
        className="w-3/12 absolute bg-black p-12 my-24 mx-auto left-0 right-0 text-white rounded bg-opacity-80"
      >
        <h1 className="font-bold text-3xl py-4">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h1>
        {!isSignIn && (
          <input
            className="p-4 my-4 w-full bg-gray-700"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            name="fullname"
            autoComplete="off"
          />
        )}

        <input
          className="p-4 my-4 w-full bg-gray-700"
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email_random"
          autoComplete="off"
        />

        <input
          className="p-4 my-4 w-full bg-gray-700"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password_random"
          autoComplete="new-password"
        />
        <p className="text-red-500 font-bold text-lg py-1">{errorMessage}</p>

        <button className="my-6 p-4 bg-red-950 w-full" onClick={handleValidate}>
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>

        <p className="py-4 cursor-pointer" onClick={toggleSignInForm}>
          {isSignIn
            ? "New to Netflix? Sign Up Now"
            : "Already registered? Sign In Now"}
        </p>
      </form>
    </div>
  );
};

export default Login;
