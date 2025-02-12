import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "@/constants/baseUrl";
import { Crown, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";

type Subscription = {
  tier: "FREE" | "BASIC" | "PREMIUM";
  startDate: string;
  endDate: string | null;
  active: boolean;
};

export default function SubscriptionManagementPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/subscription/current`, {
        headers: { Authorization: `Bearer ${localStorage.access_token}` },
      });
      setSubscription(data);
    } catch (err) {
      setError("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = () => {
    if (!subscription?.endDate) return null;
    const end = new Date(subscription.endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Subscription Details</h2>
            <Crown className={`w-8 h-8 ${
              subscription?.tier === "PREMIUM" ? "text-purple-600" :
              subscription?.tier === "BASIC" ? "text-blue-600" : "text-gray-400"
            }`} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="text-lg font-semibold">{subscription?.tier || "FREE"}</p>
              </div>
              <div className={`px-3 py-1 rounded-full ${
                subscription?.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {subscription?.active ? "Active" : "Inactive"}
              </div>
            </div>

            {subscription?.tier !== "FREE" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">Start Date</p>
                    </div>
                    <p className="font-medium">{formatDate(subscription?.startDate || "")}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">End Date</p>
                    </div>
                    <p className="font-medium">{subscription?.endDate ? formatDate(subscription.endDate) : "N/A"}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getDaysRemaining() && getDaysRemaining()! < 7 ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    <p className="text-sm text-gray-500">Subscription Status</p>
                  </div>
                  {getDaysRemaining() ? (
                    <p className="font-medium">
                      {getDaysRemaining()} days remaining
                      {getDaysRemaining()! < 7 && (
                        <span className="text-amber-500 ml-2">Renewal coming soon</span>
                      )}
                    </p>
                  ) : (
                    <p className="font-medium">Lifetime access</p>
                  )}
                </div>
              </>
            )}

            {subscription?.tier !== "PREMIUM" && (
              <div className="mt-8">
                <button
                  onClick={() => window.location.href = '/subscription'}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:from-purple-700 hover:to-indigo-700"
                >
                  Upgrade Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 