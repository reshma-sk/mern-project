// src/components/Payment.js
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51Qi0z8KDiXgzbsukhyEjrHYelClsL9ecjdwSvOr12KDEFVaMuDQp7ifdbchQV0dy3gNAntgaEapDGJ7IdqX1oVJ200XOwkIFKY'); // replace with your publishable key

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Call backend to create payment intent
    const response = await fetch('http://localhost:5000/api/payment/createPaymentIntent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000 }), // $10.00 in cents
    });
    const { clientSecret } = await response.json();

    // Confirm card payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        setMessage('Payment successful!');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay $10
      </button>
      {message && <div>{message}</div>}
    </form>
  );
};

const Payment = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Payment;
