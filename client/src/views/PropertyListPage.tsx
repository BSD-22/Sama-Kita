import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Plus } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { baseUrl } from "@/constants/baseUrl";

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Properties</h2>
        <Button
          onClick={() => navigate("/properties/add")}
          className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Property
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Loading properties...</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
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

      {!loading && properties.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No properties found</p>
          <Button onClick={() => navigate("/properties/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Property
          </Button>
        </div>
      )}
    </div>
  );
}
