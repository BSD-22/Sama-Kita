import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { baseUrl } from "@/constants/baseUrl";

interface ErrorResponse {
  message: string;
}

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [dueDate, setDueDate] = useState<number | null>(null);
  const [propertyImage, setPropertyImage] = useState<File | null>(null);

  console.log(dueDate, "dueDate");
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPropertyImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!propertyName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Property name is required",
      });
      setLoading(false);
      return;
    }

    if (dueDate === null) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Due date is required",
      });
      setLoading(false);
      return;
    }

    if (!propertyImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Property image is required",
      });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("propertyName", propertyName.trim());
      formData.append("dueDate", dueDate.toString());
      formData.append("propertyImage", propertyImage);

      await axios.post(baseUrl + "/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      toast({
        title: "Success",
        description: "Property created successfully!",
      });

      navigate("/properties");
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as AxiosError<ErrorResponse>).response?.data?.message || "Failed to create property. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">Add New Property</CardTitle>
          <CardDescription className="text-sm md:text-base">Create a new property listing</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="propertyName"
                className="text-sm md:text-base">
                Property Name
              </Label>
              <Input
                id="propertyName"
                placeholder="Enter property name"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="dueDate"
                className="text-sm md:text-base">
                Due Date (in days)
              </Label>
              <Input
                id="dueDate"
                type="number"
                min="1"
                placeholder="Enter number of days"
                value={dueDate || ''}
                onChange={(e) => setDueDate(parseInt(e.target.value) || null)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="propertyImage"
                className="text-sm md:text-base">
                Property Image
              </Label>
              <Input
                id="propertyImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={loading}>
              {loading ? "Creating..." : "Create Property"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
