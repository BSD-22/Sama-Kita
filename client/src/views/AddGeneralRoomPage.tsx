import axios from "axios";
import { useNavigate } from "react-router";
import GeneralRoomsForm from "@/components/ui/GeneralRoomsForm";
import { baseUrl } from "@/constants/baseUrl";
import { useEffect, useState } from "react";

type Property = {
  id: number;
  propertyName: string;
};

type FormData = {
  typeName: string;
  price: number;
  Area: number;
  totalRooms: number;
  roomImage: File | null;
  propertyId: number;
};

export default function AddGeneralRoomPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(baseUrl + '/rooms/properties/list', {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        });
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, formData: FormData) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("typeName", formData.typeName);
    formDataToSubmit.append("totalRooms", formData.totalRooms.toString());
    formDataToSubmit.append("price", formData.price.toString());
    formDataToSubmit.append("Area", formData.Area.toString());
    formDataToSubmit.append("propertyId", formData.propertyId.toString());

    if (formData.roomImage) {
      formDataToSubmit.append("roomImage", formData.roomImage);
    }

    try {
      await axios.post(baseUrl + `/rooms`, formDataToSubmit, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/rooms`);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <div>Loading properties...</div>;
  }

  return (
    <GeneralRoomsForm
      handleSubmit={handleSubmit}
      properties={properties}
    />
  );
} 