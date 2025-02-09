import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
  const [dueDate, setDueDate] = useState("");
  const [propertyImage, setPropertyImage] = useState<File | null>(null);
  const [date, setDate] = useState<Date>();

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

    if (!dueDate) {
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
      formData.append("dueDate", dueDate);
      formData.append("propertyImage", propertyImage);

      await axios.post(baseUrl + "/property", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      toast({
        title: "Success",
        description: "Property created successfully!",
      });

      navigate("/property");
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
    <div className="container mx-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Property</CardTitle>
          <CardDescription>Create a new property listing</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Property Name</Label>
              <Input
                id="propertyName"
                placeholder="Enter property name"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      if (newDate) {
                        setDueDate(format(newDate, "yyyy-MM-dd"));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyImage">Property Image</Label>
              <Input
                id="propertyImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}>
              {loading ? "Creating..." : "Create Property"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
