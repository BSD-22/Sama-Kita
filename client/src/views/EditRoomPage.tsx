import RoomsForm from "@/components/ui/RoomsForm";
import { baseUrl } from "@/constants/baseUrl";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";

type Room = {
  id: number;
  typeName: string;
  price: number;
  Area: number;
  propertyId: number;
  totalRooms: number;
  roomImage: string | null;
};

type FormData = {
  typeName: string;
  price: number;
  Area: number;
  totalRooms: number;
  roomImage: File | null;
  propertyId: number;
  existingRoomImage: string | null;
};

export default function EditRoomPage() {
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();

  const fetchRoomById = async () => {
    try {
      const { data } = await axios.get(baseUrl + `/properties/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setRoom(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRoomById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, formData: FormData) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("typeName", formData.typeName);
    formDataToSubmit.append("totalRooms", formData.totalRooms.toString());
    formDataToSubmit.append("price", formData.price.toString());
    formDataToSubmit.append("Area", formData.Area.toString());
    formDataToSubmit.append("propertyId", formData.propertyId.toString());

    if (formData.roomImage) {
      formDataToSubmit.append("roomImage", formData.roomImage); // New upload
    } else if (formData.existingRoomImage) {
      formDataToSubmit.append("existingRoomImage", formData.existingRoomImage); // Existing image
    }

    try {
      await axios.put(`http://localhost:8080/properties/${propertyId}/edit-room/${roomId}`, formDataToSubmit, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/properties/${propertyId}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <RoomsForm
      handleSubmit={handleSubmit}
      room={room}
    />
  );
}
