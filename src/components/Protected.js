import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('pk_test_51Qi0z8KDiXgzbsukhyEjrHYelClsL9ecjdwSvOr12KDEFVaMuDQp7ifdbchQV0dy3gNAntgaEapDGJ7IdqX1oVJ200XOwkIFKY')
const BASE_URL = process.env.REACT_APP_BACKEND_BASEURL.replace(/\/$/, "");

const Protected = () => {
  const [user, setUser] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    protectedRoute();
  }, []);

  async function refreshAccessToken() {
    try {
      const res = await fetch(`${BASE_URL}/api/users/refresh-token`, {
        method: "POST",
        credentials: "include", // important to send cookies!
      });
      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error("Refresh token failed:", error);
      return null;
    }
  }

  async function fetchProducts(token) {
    try {
      const res = await fetch(`${BASE_URL}/api/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      } else {
        console.error("Failed to fetch products:", data.message);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  async function protectedRoute() {
    try {
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        navigate("/login");
        return;
      }

      // First attempt to access protected resource
      let protectedResponse = await fetch(
        `${BASE_URL}/api/users/protected`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(protectedResponse);

      if (protectedResponse.status === 401) {
        console.log(
          "Access token is invalid or expired. Attempting to refresh token..."
        );
        // Token expired or invalid, try refresh token
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          navigate("/login");
          return;
        }
        // Retry protected request with new token
        protectedResponse = await fetch(
          `${BASE_URL}/api/users/protected`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    
      const protectedData = await protectedResponse.json();
      console.log(protectedData);

      if (!protectedData.error) {
        setUser(protectedData.user);
        // ✅ Call getAllProducts API here
        fetchProducts(accessToken);
      } else {
        setErrorMessage("Access denied.");
      }
    } catch (error) {
      console.error("Error accessing protected route:", error);
    }
  }

  async function handlePayment() {
    const stripe = await stripePromise;

    try {
      // Send cart data to backend to create Stripe Checkout session
      const response = await fetch(
        `${BASE_URL}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }), // Make sure cart is available in scope
        }
      );

      console.log("Cart being sent:", cart);
      const session = await response.json();
      console.log("Stripe session returned:", session);


      // Redirect user to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error("Stripe redirect error:", result.error.message);
        // Optionally show error message to user
      }
    } catch (error) {
      console.error("Payment failed:", error);
      // Optionally show error toast/message here
    }
  }
  const increaseQuantity = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const decreaseQuantity = (productId) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) =>
          item._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center text-red-800 mb-6">
        Milan Cafe
      </h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        {user ? `Welcome, ${JSON.stringify(user.fullName)}` : `Session expired. Please Login again....`}
      </h2>

      {/* Product Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="border rounded shadow-md p-4 flex flex-col items-center"
            >
              <img
                className="w-32 h-32 object-cover mb-2"
                src={p.imageUrl}
                alt={p.name}
              />
              <div className="text-center">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-600">${p.price}</p>
                <p className="text-sm text-gray-500">{p.description}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-green-500 text-white px-2 rounded"
                    onClick={() => increaseQuantity(p)}
                  >
                    ➕
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 rounded"
                    onClick={() => decreaseQuantity(p._id)}
                  >
                    ➖
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            🛒 Your Cart
          </h2>
          <ul className="space-y-2">
            {cart.map((item) => (
              <li key={item._id}>
                {item.name} x {item.quantity} — ${item.price * item.quantity}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-bold">
            Total: $
            {cart
              .reduce((acc, item) => acc + item.price * item.quantity, 0)
              .toFixed(2)}
          </p>

          <button
            className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded"
            onClick={handlePayment}
          >
            💳 Pay Now
          </button>
        </div>
      )}
    </div>
  );

};

export default Protected;

