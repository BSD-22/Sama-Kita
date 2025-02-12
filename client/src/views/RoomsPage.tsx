import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchRooms } from "@/store/rooms";

interface IndividualRoom {
  id: number;
  roomNumber: string;
  status: string;
}

interface Room {
  id: number;
  typeName: string;
  price: number;
  roomImage: string;
  Area: number;
  totalRooms: number;
  status: string;
  propertyId: number;
  individualRooms: IndividualRoom[];
}

export default function RoomsPage() {
  const dispatch = useAppDispatch();
  const { rooms, isLoading } = useAppSelector((state) => state.rooms);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const filteredRooms = rooms.filter((room: Room) =>
    room.typeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add loading skeleton
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <Card
              key={index}
              className="animate-pulse">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="w-full h-48 bg-gray-200 rounded-md"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-9 bg-gray-200 rounded"></div>
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
      className="container mx-auto px-4 py-8"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <Link to="/rooms/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </Link>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all pr-10"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            🔍
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room: Room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{room.typeName}</CardTitle>
                  <Badge variant={room.status === "Available" ? "secondary" : "destructive"}>{room.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <img
                    src={room.roomImage || "/placeholder-room.jpg"}
                    alt={room.typeName}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-500">Price: Rp.{room.price.toLocaleString()}</p>
                    <p className="text-gray-500">Area: {room.Area}m²</p>
                    <p className="text-gray-500">Total Rooms: {room.totalRooms}</p>
                    <p className="text-gray-500">Available: {room.individualRooms?.filter((r: IndividualRoom) => r.status === "Available").length || 0}</p>
                  </div>
                  <Link to={`/property/${room.propertyId}/edit/${room.id}`}>
                    <Button
                      variant="outline"
                      className="w-full">
                      Manage Room
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">Tidak ada kamar yg ditemukan 😢</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
