import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { baseUrl } from "@/constants/baseUrl";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

type Room = {
  id: number;
  typeName: string;
  price: number;
  Area: number;
  propertyId: number;
  totalRooms: number;
  roomImage: string; // Add roomImage field
};

type Property = {
  id: number;
  propertyName: string;
  userId: number;
  propertyImage: string; // Image for the property
  Room: Room[];
};

export default function PropertyDetail() {
  const [property, setProperty] = useState<Property | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  async function getPropertyDetail() {
    try {
      const { data } = await axios.get(baseUrl + `/property/${id}`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page>
      <div className="container mx-auto px-4 py-6">
        {/* Property Header */}
        <div className="bg-gray-100 text-black border border-gray-300 rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-600 rounded-md flex items-center justify-center">
              {/* Property Image */}
              {property?.propertyImage && (
                <img
                  src={property.propertyImage}
                  alt="Property"
                  className="w-full h-full object-cover rounded-md"
                />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{property?.propertyName}</h1>
              <p className="text-sm text-black mt-1">Property ID: {property?.id}</p>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {property?.Room?.map((room) => (
              <div
                key={room.id}
                className="relative p-6 border border-gray-300 rounded-lg shadow-md bg-gray-50">
                {/* Edit Button at the Top Right */}
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => navigate(`/property/${property?.id}/edit/${room.id}`)}
                    className="px-4 py-2 text-white font-medium rounded-md focus:outline-none shadow-md">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                    {/* Room Image */}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button for Renters */}
        <div className="mt-8 flex justify-between">
          <Button
            onClick={() => navigate(`/property/${property?.id}/renters`)}
            className="px-6 py-5 text-white font-medium rounded-md focus:outline-none shadow-md">
            See Renter Details
          </Button>
          <Button
            onClick={() => navigate(`/property/${property?.id}/add`)}
            className="px-6 py-5 text-white font-medium rounded-md focus:outline-none shadow-md">
            Add More Rooms
          </Button>
        </div>
      </div>
    </Page>
  );
}
