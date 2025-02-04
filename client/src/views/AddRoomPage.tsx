import axios from "axios";
import { useNavigate } from "react-router";
import RoomsForm from "@/components/ui/RoomsForm";
import { useParams } from "react-router";
import { baseUrl } from "@/constants/baseUrl";

type FormData = {
  typeName: string;
  price: number;
  Area: number;
  totalRooms: number;
  roomImage: File | null;
  propertyId: number;
};

export default function AddRoomPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();

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
      await axios.post(baseUrl + `/property/${propertyId}/add`, formDataToSubmit, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
      });

      navigate(`/property/${propertyId}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <RoomsForm
      handleSubmit={handleSubmit}
      room={null}
    />
  );
}
