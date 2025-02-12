import { useEffect, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const filteredProperties = properties.filter((property: Property) =>
    property.propertyName.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Properties</h1>
          <Link to="/properties/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Cari properti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all pr-10"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            🔍
          </span>
        </div>

        {isSearching ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex space-x-3">
              <span className="w-5 h-5 bg-gray-400 rounded-full animate-[loadingDot_1s_ease-in-out_infinite]"></span>
              <span className="w-5 h-5 bg-gray-400 rounded-full animate-[loadingDot_1s_ease-in-out_0.2s_infinite]"></span>
              <span className="w-5 h-5 bg-gray-400 rounded-full animate-[loadingDot_1s_ease-in-out_0.4s_infinite]"></span>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property: Property) => (
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
                      <Link to={`/property/${property.id}`}>
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

            {filteredProperties.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">Tidak ada properti yg ditemukan 😢</p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
