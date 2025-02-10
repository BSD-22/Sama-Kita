import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Square, Bed, DollarSign, ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type HandleSubmit = (e: React.FormEvent<HTMLFormElement>, formData: FormData) => Promise<void>;

interface GeneralRoomsFormProps {
  handleSubmit: HandleSubmit;
  properties: Property[];
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
};

export default function GeneralRoomsForm({ handleSubmit, properties }: GeneralRoomsFormProps) {
  const [formData, setFormData] = useState<FormData>({
    typeName: "",
    price: 0,
    Area: 0,
    totalRooms: 0,
    roomImage: null,
    propertyId: 0,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({
        ...prev,
        roomImage: file,
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="max-w-2xl mx-auto p-6"
    >
      <Card className="p-6">
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
            Add New Room
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details to create a new room
          </p>
        </motion.div>

        <form onSubmit={(e) => handleSubmit(e, formData)} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Property
            </Label>
            <Select
              value={formData.propertyId.toString()}
              onValueChange={(value) => handleChange("propertyId", Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.propertyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bed className="w-4 h-4" />
              Room Type Name
            </Label>
            <Input
              type="text"
              name="typeName"
              value={formData.typeName}
              onChange={(e) => handleChange("typeName", e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price
            </Label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={(e) => handleChange("price", Number(e.target.value))}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="flex items-center gap-2">
              <Square className="w-4 h-4" />
              Area (sqm)
            </Label>
            <Input
              type="number"
              name="Area"
              value={formData.Area}
              onChange={(e) => handleChange("Area", Number(e.target.value))}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bed className="w-4 h-4" />
              Total Rooms
            </Label>
            <Input
              type="number"
              name="totalRooms"
              value={formData.totalRooms}
              onChange={(e) => handleChange("totalRooms", Number(e.target.value))}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Room Image
            </Label>
            <div className="flex flex-col items-center gap-4">
              <Input
                type="file"
                name="roomImage"
                onChange={handleImageChange}
                accept="image/*"
                className="cursor-pointer"
              />
              {previewImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden"
                >
                  <img
                    src={previewImage}
                    alt="Room preview"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="pt-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Add Room
            </Button>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  );
} 