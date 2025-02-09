import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

type HandleSubmit = (
  event: React.FormEvent<HTMLFormElement>,
  formData: {
    typeName: string;
    price: number;
    Area: number;
    totalRooms: number;
    roomImage: File | null;
    existingRoomImage: string | null;
    propertyId: number;
  }
) => void;

type Room = {
  id: number;
  typeName: string;
  price: number;
  Area: number;
  propertyId: number;
  totalRooms: number;
  roomImage: string | null; // Existing image URL
};

export default function RoomsForm({ handleSubmit, room }: { handleSubmit: HandleSubmit; room: Room | null }) {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [formData, setFormData] = useState<{
    typeName: string;
    price: number;
    Area: number;
    totalRooms: number;
    roomImage: File | null; // For new uploads
    existingRoomImage: string | null; // For current image
    propertyId: number;
  }>({
    typeName: "",
    price: 0,
    Area: 0,
    totalRooms: 0,
    roomImage: null,
    existingRoomImage: room?.roomImage || null,
    propertyId: +propertyId!,
  });

  const handleChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (fieldName === "price" || fieldName === "Area" || fieldName === "totalRooms") {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: +value,
      }));
    } else if (fieldName === "roomImage") {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const file = target.files[0];
        setFormData((prev) => ({
          ...prev,
          roomImage: file, // New file
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  useEffect(() => {
    if (room) {
      setFormData((prev) => ({
        ...prev,
        typeName: room.typeName,
        price: room.price,
        Area: room.Area,
        totalRooms: room.totalRooms,
        existingRoomImage: room.roomImage || null, // Load existing image URL
        roomImage: null, // No new upload by default
        propertyId: room.propertyId,
      }));
    }
  }, [room]);

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>{room ? "Edit Room" : "Add a New Room"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => handleSubmit(e, formData)}
            className="space-y-4">
            <div>
              <Label htmlFor="typeName">Room Name</Label>
              <Input
                name="typeName"
                type="text"
                placeholder="Enter room name"
                value={formData.typeName}
                onChange={(e) => handleChange("typeName", e)}
              />
            </div>
            <div>
              <Label htmlFor="price">Price (Rp.)</Label>
              <Input
                name="price"
                type="number"
                placeholder="Enter price per night"
                value={formData.price}
                onChange={(e) => handleChange("price", e)}
              />
            </div>
            <div>
              <Label htmlFor="Area">Area (m²)</Label>
              <Input
                name="Area"
                type="number"
                placeholder="Enter room area"
                value={formData.Area}
                onChange={(e) => handleChange("Area", e)}
              />
            </div>
            <div>
              <Label htmlFor="totalRooms">Total Rooms</Label>
              <Input
                name="totalRooms"
                type="number"
                placeholder="Enter total rooms"
                value={formData.totalRooms}
                onChange={(e) => handleChange("totalRooms", e)}
              />
            </div>
            <div>
              <Label htmlFor="roomImage">Room Image</Label>
              {formData.existingRoomImage && (
                <div className="mb-2">
                  <img
                    src={formData.existingRoomImage}
                    alt="Current Room"
                    className="h-32 w-32 object-cover"
                  />
                </div>
              )}
              <Input
                name="roomImage"
                type="file"
                onChange={(e) => handleChange("roomImage", e)}
              />
              <small className="text-sm text-muted-foreground">(Optional) Upload a new image for this room</small>
            </div>
            <Button
              type="submit"
              className="w-full">
              {room ? "Update Room" : "Add Room"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
