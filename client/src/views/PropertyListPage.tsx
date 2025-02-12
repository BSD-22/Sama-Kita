import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Plus } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { baseUrl } from "@/constants/baseUrl";
import { motion } from "framer-motion";

interface Property {
  id: number;
  propertyName: string;
  propertyImage: string;
  dueDate: string;
  Room: Array<{
    id: number;
    typeName: string;
    totalRooms: number;
  }>;
}

export default function PropertyListPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/properties`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRooms = (property: Property) => {
    return property.Room.reduce((total, room) => total + room.totalRooms, 0);
  };

  const filteredProperties = properties.filter((property) =>
    property.propertyName.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Properties</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        <div className="mb-6">
          <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="p-0">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg animate-pulse" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="h-6 w-3/4 bg-gray-200 rounded-md animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-4 w-1/3 bg-gray-200 rounded-md animate-pulse" />
                  </div>
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
          <Button
            onClick={() => navigate("/properties/add")}
            className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </div>

        <div className="relative w-full">
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                onClick={() => navigate(`/properties/${property.id}`)}
                className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="relative p-0">
                  <img
                    src={property.propertyImage}
                    alt={property.propertyName}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg md:text-xl mb-2">{property.propertyName}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <p>Due Date: {new Date(property.dueDate).toLocaleDateString()}</p>
                    <p>Total Rooms: {getTotalRooms(property)}</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${property.id}/add`);
                    }}>
                    Add Room
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && !isSearching && filteredProperties.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Ga ketemu properti yg dicari nih 😢" : "No properties found"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/properties/add")}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Property
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
