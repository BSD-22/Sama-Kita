import { Card, DonutChart, BarList } from "@tremor/react";
import { useSubscription } from "@/contexts/SubscriptionContext";

export const TierSpecificAnalytics = ({ data }: { data: any }) => {
  const { tier } = useSubscription();

  if (!data) return null;

  return (
    <>
      {/* Basic Tier Analytics */}
      {tier !== "FREE" && (
        <>
          <Card className="p-4 sm:p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            <DonutChart
              data={[
                { name: "Maintenance", value: data.expenseBreakdown?.maintenance || 0 },
                { name: "Utilities", value: data.expenseBreakdown?.utilities || 0 }
              ]}
              index="name"
              valueFormatter={(number: number) => `Rp. ${Intl.NumberFormat("id").format(number)}`}
              className="h-52"
            />
          </Card>

          <Card className="p-4 sm:p-6 bg-card mt-4">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <BarList
              data={
                data.recentTransactions?.map((t: any) => ({
                  name: t.renterName,
                  value: t.amount,
                  date: new Date(t.date).toLocaleDateString()
                })) || []
              }
              valueFormatter={(number: number) => `Rp. ${Intl.NumberFormat("id").format(number)}`}
            />
          </Card>
        </>
      )}

      {/* Premium Tier Analytics */}
      {tier === "PREMIUM" && (
        <>
          <Card className="p-4 sm:p-6 bg-card mt-4">
            <h3 className="text-lg font-semibold mb-4">Property Performance</h3>
            <div className="space-y-4">
              {data.propertyWiseAnalysis?.map((property: any) => (
                <div key={property.propertyName} className="border-b pb-4">
                  <h4 className="font-medium">{property.propertyName}</h4>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-semibold">
                        Rp. {Intl.NumberFormat("id").format(property.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Occupancy</p>
                      <p className="font-semibold">{property.occupancyRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expenses</p>
                      <p className="font-semibold">
                        Rp. {Intl.NumberFormat("id").format(property.expenses)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-card mt-4">
            <h3 className="text-lg font-semibold mb-4">Predictions & Insights</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Occupancy</p>
                <p className="text-xl font-bold">{data.predictedOccupancy}%</p>
              </div>
              {/* Add more premium insights here */}
            </div>
          </Card>
        </>
      )}
    </>
  );
}; 