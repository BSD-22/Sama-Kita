import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchProperties } from "@/store/properties"; // Assuming this exists

interface Property {
  id: number;
  propertyName: string;
  dueDate: string;
  propertyImage: string;
}

export default function PropertiesPage() {
  const dispatch = useAppDispatch();
  const { properties, isLoading } = useAppSelector((state) => state.properties);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-36 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              className="overflow-hidden">
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded-md animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-48 w-full bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Link to="/properties/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property: Property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle>{property.propertyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Due Date: {property.dueDate}</p>
                <img
                  src={property.propertyImage}
                  alt={property.propertyName}
                  className="w-full h-48 object-cover rounded-md"
                />
                <Link to={`/properties/${property.id}`}>
                  <Button
                    variant="outline"
                    className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
