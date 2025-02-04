import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import Page from "@/app/dashboard/page";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchRenters } from "@/store/renters";
import { fetchProperties } from "@/store/properties";
import { baseUrl } from "@/constants/baseUrl";

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type RecentSales = {
  amount: number;
  orderId: string;
  paymentStatus: boolean;
  renterName: string;
};

type PeriodSummary = {
  totalRevenue: number;
  nettProfit: number;
  averageOccupancyRate: string;
  recentSales: RecentSales[];
};

type Summary = {
  oneMonth: PeriodSummary;
  sixMonths: PeriodSummary;
  oneYear: PeriodSummary;
};

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"oneMonth" | "sixMonths" | "oneYear">("oneMonth");
  const [averageOccupancyRate, setAverageOccupancyRate] = useState<string>("");
  const [revenue, setRevenue] = useState<number>(0);
  const [nettProfit, setNettProfit] = useState<number>(0);
  const [recentSales, setRecentSales] = useState<RecentSales[]>([]);
  const [previousRevenue, setPreviousRevenue] = useState<number>(0);
  const [previousNettProfit, setPreviousNettProfit] = useState<number>(0);

  const [barData, setBarData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Revenue",
        data: Array(12).fill(0),
        backgroundColor: "rgba(255, 223, 186, 0.8)",
        borderColor: "rgba(240, 169, 108, 1)",
        borderWidth: 1,
      },
    ],
  });

  const renters = useAppSelector((state) => state.renters.renters);
  const properties = useAppSelector((state) => state.properties.properties);
  const dispatch = useAppDispatch();

  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) {
      return current === 0 ? "0%" : "+100%"; // Prevent division by zero
    }
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  const fetchSummary = async (): Promise<void> => {
    try {
      const { data } = await axios.get<Summary>(baseUrl + "/response-graph-performance", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      const summary = data;

      // Period mapping for dynamic data retrieval
      const periods: { [key: string]: PeriodSummary } = {
        oneMonth: summary.oneMonth,
        sixMonths: summary.sixMonths,
        oneYear: summary.oneYear,
      };

      const currentPeriod = periods[selectedPeriod];
      const previousPeriod =
        selectedPeriod === "oneMonth"
          ? summary.sixMonths // Use six months data for estimating previous one month
          : selectedPeriod === "sixMonths"
          ? summary.oneYear // Use one year data for estimating previous six months
          : { totalRevenue: 0, nettProfit: 0, recentSales: [] }; // No previous period for one year

      const previousRevenue = previousPeriod.totalRevenue / (selectedPeriod === "oneMonth" ? 6 : 2);
      const previousNettProfit = previousPeriod.nettProfit / (selectedPeriod === "oneMonth" ? 6 : 2);

      setRevenue(currentPeriod.totalRevenue);
      setNettProfit(currentPeriod.nettProfit);
      setAverageOccupancyRate(currentPeriod.averageOccupancyRate);
      setRecentSales(currentPeriod.recentSales);

      setPreviousRevenue(previousRevenue);
      setPreviousNettProfit(previousNettProfit);

      // Update chart data
      setBarData((prevData) => ({
        ...prevData,
        datasets: [
          {
            ...prevData.datasets[0],
            data: currentPeriod.recentSales.map((sale) => sale.amount),
          },
        ],
      }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dispatch(fetchRenters());
    dispatch(fetchProperties());
    fetchSummary();
  }, [selectedPeriod]);

  const handlePeriodChange = (period: "oneMonth" | "sixMonths" | "oneYear") => {
    setSelectedPeriod(period);
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Revenue by Year", color: "#333333" },
    },
    scales: {
      x: { ticks: { color: "#333333" }, grid: { display: false } },
      y: { ticks: { color: "#333333" }, grid: { color: "rgba(240, 240, 240, 0.4)" } },
    },
  };

  return (
    <Page>
      <div className="min-h-screen text-gray-900 px-6 pb-10 pt-3">
        <h2 className="mb-5 text-3xl font-extrabold text-gray-800">Dashboard</h2>

        {/* Period switcher */}
        <div className="mb-6">
          {["oneMonth", "sixMonths", "oneYear"].map((period) => (
            <button
              key={period}
              className={`mr-4 px-4 py-2 rounded-md ${selectedPeriod === period ? "bg-black text-white" : "bg-gray-200"}`}
              onClick={() => handlePeriodChange(period as "oneMonth" | "sixMonths" | "oneYear")}>
              {period.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>

        {/* Top metrics section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Revenue</h3>
            <p className="text-3xl font-bold">Rp. {revenue.toLocaleString()}</p>
            <p className="text-green-600 text-sm mt-2">{calculatePercentageChange(revenue, previousRevenue)}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Nett Profit</h3>
            <p className="text-3xl font-bold">Rp. {nettProfit.toLocaleString()}</p>
            <p className="text-green-600 text-sm mt-2">{calculatePercentageChange(nettProfit, previousNettProfit)}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Average Occupancy</h3>
            <p className="text-3xl font-bold">{averageOccupancyRate}%</p>
            <p className="text-gray-500 text-sm mt-2">Total Properties: {properties.length}</p>
          </div>
        </div>

        {/* Middle section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 p-6 bg-white rounded-lg shadow">
            <Bar
              data={barData}
              options={barOptions}
            />
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Recent Sales</h3>
            <ul className="space-y-4">
              {recentSales.map((sale, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{sale.renterName}</p>
                    <p className={`text-sm ${sale.paymentStatus ? "text-green-600" : "text-red-500"}`}>{sale.paymentStatus ? "Completed" : "Pending"}</p>
                  </div>
                  <p className={`font-bold ${sale.paymentStatus ? "text-green-600" : "text-gray-500"}`}>
                    {sale.paymentStatus ? `+Rp. ${sale.amount.toLocaleString()}` : `Rp. ${sale.amount.toLocaleString()}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Page>
  );
}
