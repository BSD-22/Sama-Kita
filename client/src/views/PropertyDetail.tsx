import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { baseUrl } from "@/constants/baseUrl";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

type Renter = {
  id: number;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  hasLeaved: boolean;
};

type IndividualRoom = {
  id: number;
  roomNumber: string;
  status: "Available" | "Rented";
  renters: Renter[];
};

type Room = {
  id: number;
  typeName: string;
  price: number;
  Area: number;
  propertyId: number;
  totalRooms: number;
  roomImage: string;
  individualRooms: IndividualRoom[];
  availableRooms: number;
  occupiedRooms: number;
};

type Property = {
  id: number;
  propertyName: string;
  userId: number;
  propertyImage: string;
  Room: Room[];
};

export default function PropertyDetail() {
  const [property, setProperty] = useState<Property | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  async function getPropertyDetail() {
    try {
      const { data } = await axios.get(baseUrl + `/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });
      setProperty(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getPropertyDetail();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Property Header */}
      <div className="bg-gray-100 text-black border border-gray-300 rounded-lg p-4 md:p-6 mb-6 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="w-full md:w-24 h-24 bg-gray-600 rounded-md flex items-center justify-center">
            {property?.propertyImage && (
              <img
                src={property.propertyImage}
                alt="Property"
                className="w-full h-full object-cover rounded-md"
              />
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold">{property?.propertyName}</h1>
            <p className="text-sm text-black mt-1">Property ID: {property?.id}</p>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="types"
        className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="types">Room Types</TabsTrigger>
          <TabsTrigger value="individual">Individual Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          {/* Room Types View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {property?.Room?.map((room) => (
              <div
                key={room.id}
                className="relative p-6 border border-gray-300 rounded-lg shadow-md bg-gray-50">
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => navigate(`/properties/${property?.id}/edit/${room.id}`)}
                    className="px-4 py-2 text-white font-medium rounded-md focus:outline-none shadow-md">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                    {room.roomImage && (
                      <img
                        src={room.roomImage}
                        alt={room.typeName}
                        className="w-full h-full object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{room.typeName}</h3>
                    <p className="text-sm text-gray-600">
                      Price: <span className="font-medium">Rp {room.price.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Area: <span className="font-medium">{room.Area} m²</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Rooms: <span className="font-medium">{room.totalRooms}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Available: <span className="font-medium text-green-600">{room.availableRooms}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Occupied: <span className="font-medium text-blue-600">{room.occupiedRooms}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="individual">
          {/* Individual Rooms View */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {property?.Room?.map((roomType) =>
              roomType.individualRooms.map((room) => {
                const activeRenter = room.renters?.find((renter) => !renter.hasLeaved);

                const status = activeRenter ? "Rented" : "Available";

                return (
                  <div
                    key={room.id}
                    className={`p-4 border border-gray-300 rounded-lg shadow-md ${status === "Rented" ? "bg-blue-50" : "bg-green-50"}`}>
                    <h3 className="text-lg font-bold text-gray-800">Room {room.roomNumber}</h3>
                    <p className="text-sm text-gray-600">Type: {roomType.typeName}</p>
                    <p className="text-sm text-gray-600">Status: {status}</p>
                    <p className="text-sm text-gray-600">Price: Rp {roomType.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Area: {roomType.Area} m²</p>
                    {activeRenter && <p className="text-sm text-gray-600">Renter: {activeRenter.renterName}</p>}
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
        <Button
          onClick={() => navigate(`/properties/${property?.id}/renters`)}
          className="w-full sm:w-auto">
          See Renter Details
        </Button>
        <Button
          onClick={() => navigate(`/properties/${property?.id}/add`)}
          className="w-full sm:w-auto">
          Add More Rooms
        </Button>
      </div>
    </div>
  );
}
