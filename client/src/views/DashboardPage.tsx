import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const quickLinks = [
    {
      title: "View Properties",
      description: "Check your property listings and details",
      path: "/property",
    },
    {
      title: "Add Property",
      description: "Register a new property to your portfolio",
      path: "/property/add",
    },
    {
      title: "Expenses Overview",
      description: "Track and manage your maintenance costs",
      path: "/expenses/maintenance",
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8 px-4">
      {/* Hero Section with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center">
        <h1 className="text-4xl font-bold text-primary">Welcome to Sama Kita Dashboard!</h1>
        <p className="text-lg text-muted-foreground mt-2">Explore your properties, see your data in real time, and manage your system automatically.</p>
      </motion.div>

      {/* Quick Links Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link, index) => (
          <motion.div
            key={link.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * (index + 1) }}>
            <Link to={link.path}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{link.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{link.description}</p>
                <ArrowRight className="w-5 h-5 mt-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-4">
        <Button
          asChild
          variant="default">
          <Link to="/property/add">Add New Property</Link>
        </Button>
        <Button
          asChild
          variant="outline">
          <Link to="/graph">View Performance</Link>
        </Button>
        <Button
          asChild
          variant="outline">
          <Link to="/expenses/add">Record Expense</Link>
        </Button>
      </motion.div>
    </div>
  );
}
