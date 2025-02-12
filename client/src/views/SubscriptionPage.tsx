import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Check, AlertCircle } from "lucide-react";
import { baseUrl } from "@/constants/baseUrl";

const SUBSCRIPTION_FEATURES = {
  FREE: [
    "Basic monthly revenue analytics",
    "Simple occupancy tracking",
    "Single period view (1 month)",
    "Basic transaction history",
    "Standard property overview"
  ],
  BASIC: [
    "All FREE features",
    "6-month historical data analysis",
    "Revenue & expense breakdown",
    "Occupancy rate predictions",
    "Monthly trends visualization",
    "Transaction patterns analysis",
    "Property performance metrics"
  ],
  PREMIUM: [
    "All BASIC features",
    "Full year historical analysis",
    "Advanced revenue forecasting",
    "Detailed expense categorization",
    "Property-wise comparison",
    "Market trend analysis",
    "Custom period selection",
    "AI-powered recommendations",
    "Priority data updates"
  ],
};

const SUBSCRIPTION_PRICES = {
  BASIC: "Rp 99.000",
  PREMIUM: "Rp 299.000",
};

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubscribe = async (tier: "BASIC" | "PREMIUM") => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.post(
        `${baseUrl}/subscription/purchase`,
        { tier },
        {
          headers: { Authorization: `Bearer ${localStorage.access_token}` },
        }
      );

      console.log(data, "subscriptionpage");

      // Check if snap is available
      if (!(window as any).snap) {
        throw new Error("Midtrans Snap is not initialized");
      }

      // Initialize Midtrans snap for payment
      (window as any).snap.pay(data.token, {
        onSuccess: function(result: any) {
          console.log("success", result);
          localStorage.setItem("subscriptionTier", tier);
          navigate("/graph");
        },
        onPending: function(result: any) {
          console.log("pending", result);
          alert("Payment pending. Please complete your payment.");
        },
        onError: function(result: any) {
          console.log("error", result);
          setError("Payment failed. Please try again.");
        },
        onClose: function() {
          setError("Payment cancelled. Please try again.");
        }
      });
    } catch (err) {
      console.error("Subscription error:", err);
      setError("Failed to process subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Unlock advanced AI analytics and insights for your property management
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Free Tier */}
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">
                Basic features for getting started
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">Rp 0</span>
              </p>
              <button
                disabled
                className="mt-8 block w-full bg-gray-200 text-gray-600 rounded-md py-2 text-sm font-semibold"
              >
                Current Plan
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <ul className="space-y-4">
                {SUBSCRIPTION_FEATURES.FREE.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 shrink-0" />
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Basic Tier */}
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200 border-2 border-primary">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Basic</h3>
              <p className="mt-4 text-sm text-gray-500">
                All FREE features plus enhanced AI analysis
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{SUBSCRIPTION_PRICES.BASIC}</span>
              </p>
              <button
                onClick={() => handleSubscribe("BASIC")}
                disabled={loading}
                className="mt-8 block w-full bg-primary text-white rounded-md py-2 text-sm font-semibold"
              >
                Subscribe to Basic
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <ul className="space-y-4">
                {SUBSCRIPTION_FEATURES.BASIC.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 shrink-0" />
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Premium</h3>
              <p className="mt-4 text-sm text-gray-500">
                All BASIC features plus advanced market analysis
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{SUBSCRIPTION_PRICES.PREMIUM}</span>
              </p>
              <button
                onClick={() => handleSubscribe("PREMIUM")}
                disabled={loading}
                className="mt-8 block w-full bg-purple-600 text-white rounded-md py-2 text-sm font-semibold"
              >
                Subscribe to Premium
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <ul className="space-y-4">
                {SUBSCRIPTION_FEATURES.PREMIUM.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 shrink-0" />
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 text-center text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
} 