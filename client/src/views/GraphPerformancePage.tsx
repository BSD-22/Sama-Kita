import { useEffect, useState } from "react";
import { BarChart, Card, Title } from "@tremor/react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { baseUrl } from "@/constants/baseUrl";
import { GraphLoadingState } from '@/components/GraphLoadingState';
import { TierSpecificAnalytics } from '@/components/TierSpecificAnalytics';

type Transaction = {
  amount: number;
  orderId: string;
  paymentStatus: boolean;
  renterName: string;
  date?: Date;
};

type PeriodData = {
  totalRevenue: number;
  nettProfit: number;
  averageOccupancyRate: string;
  totalProperties: number;
  predictedOccupancy?: string;
  recentTransactions?: Transaction[];
  expenseBreakdown?: {
    maintenance: number;
    utilities: number;
  };
  propertyWiseAnalysis?: Array<{
    propertyName: string;
    revenue: number;
    occupancyRate: string;
    expenses: number;
  }>;
  monthlyTrends?: Array<{
    month: string;
    revenue: number;
    occupancyRate: string;
  }>;
  previousPeriod?: {
    totalRevenue: number;
    nettProfit: number;
  };
};

type DashboardData = {
  oneMonth?: PeriodData;
  sixMonths?: PeriodData;
  oneYear?: PeriodData;
};

const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return current === 0 ? "0%" : "+∞%";
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) > 1000) return change > 0 ? "+999+%" : "-999+%";
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
};

export default function Dashboard() {
  const { tier } = useSubscription();
  const [selectedPeriod, setSelectedPeriod] = useState<"oneMonth" | "sixMonths" | "oneYear">("oneMonth");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<number>(0);
  const [nettProfit, setNettProfit] = useState<number>(0);
  const [averageOccupancyRate, setAverageOccupancyRate] = useState<string>("0");
  const [previousRevenue, setPreviousRevenue] = useState<number>(0);
  const [previousNettProfit, setPreviousNettProfit] = useState<number>(0);
  const [propertiesCount, setPropertiesCount] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${baseUrl}/dashboard/performance?period=${selectedPeriod}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
          'X-Subscription-Tier': tier
        },
      });

      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      
      setData(result);
      
      if (result[selectedPeriod]) {
        const currentPeriodData = result[selectedPeriod];
        setRevenue(currentPeriodData.totalRevenue);
        setNettProfit(currentPeriodData.nettProfit);
        setAverageOccupancyRate(currentPeriodData.averageOccupancyRate);
        setPropertiesCount(currentPeriodData.totalProperties);

        if (currentPeriodData.monthlyTrends) {
          const formattedData = currentPeriodData.monthlyTrends.map((trend: { month: string; revenue: number }, index: number) => ({
            key: `trend-${index}-${trend.month}`,
            month: trend.month,
            Revenue: trend.revenue,
          }));
          setChartData(formattedData);
        }

        if (currentPeriodData.previousPeriod) {
          setPreviousRevenue(currentPeriodData.previousPeriod.totalRevenue);
          setPreviousNettProfit(currentPeriodData.previousPeriod.nettProfit);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tier, selectedPeriod]);

  const handlePeriodChange = (period: "oneMonth" | "sixMonths" | "oneYear") => {
    setSelectedPeriod(period);
  };

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <GraphLoadingState stages={[]} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground/90">Performance Dashboard</h2>
        {tier !== "PREMIUM" && (
          <button 
            onClick={() => window.location.href = '/subscription'}
            className="w-full sm:w-auto bg-primary/90 hover:bg-primary text-primary-foreground px-4 py-2 rounded-lg transition-colors"
          >
            Upgrade to Premium
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["oneMonth", "sixMonths", "oneYear"].map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              selectedPeriod === period 
                ? "bg-primary/90 text-primary-foreground" 
                : "bg-muted hover:bg-muted/80 text-foreground/80"
            }`}
            onClick={() => handlePeriodChange(period as "oneMonth" | "sixMonths" | "oneYear")}>
            {period.replace(/([A-Z])/g, " $1").trim()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Card className="p-4 sm:p-6 bg-card">
          <Title className="text-sm text-muted-foreground mb-2">Total Revenue</Title>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            Rp. {revenue.toLocaleString()}
          </p>
          <p className={`text-sm mt-2 ${
            previousRevenue > revenue 
              ? 'text-destructive/90' 
              : 'text-emerald-600'
          }`}>
            {calculatePercentageChange(revenue, previousRevenue)}
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card">
          <Title className="text-sm text-muted-foreground mb-2">Nett Profit</Title>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            Rp. {nettProfit.toLocaleString()}
          </p>
          <p className={`text-sm mt-2 ${
            previousNettProfit > nettProfit 
              ? 'text-destructive/90' 
              : 'text-emerald-600'
          }`}>
            {calculatePercentageChange(nettProfit, previousNettProfit)}
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card">
          <Title className="text-sm text-muted-foreground mb-2">Average Occupancy</Title>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {averageOccupancyRate}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Total Properties: {propertiesCount}
          </p>
        </Card>
      </div>

      <Card className="p-4 sm:p-6 bg-card">
        <Title className="text-sm text-muted-foreground mb-4">Revenue Trends</Title>
        <div className="h-[300px] sm:h-[400px] w-full">
          <BarChart
            data={chartData}
            index="month"
            categories={["Revenue"]}
            colors={["blue"]}
            valueFormatter={(number) => `Rp. ${Intl.NumberFormat("id").format(number)}`}
            showAnimation
            showLegend={false}
            showGridLines={false}
            showYAxis={false}
            startEndOnly
            className="h-full [&_.tremor-BarChart-bar]:opacity-70 [&_.tremor-BarChart-bar]:hover:opacity-100 [&_.tremor-BarChart-bar]:transition-opacity"
          />
        </div>
      </Card>

      {/* Tier-specific analytics */}
      {data && data[selectedPeriod] && (
        <TierSpecificAnalytics 
          data={data[selectedPeriod]} 
        />
      )}
    </div>
  );
}
