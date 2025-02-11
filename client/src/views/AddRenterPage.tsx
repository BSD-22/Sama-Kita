import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { baseUrl } from "@/constants/baseUrl";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router";

const formSchema = z.object({
  renterName: z.string().min(2, "Name must be at least 2 characters"),
  renterEmail: z.string().email("Invalid email address"),
  renterPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  ktpNumber: z.string().min(16, "KTP number must be 16 digits"),
  joinDate: z.date(),
  leaveDate: z.date(),
  roomId: z.string(),
  individualRoomId: z.string(),
  propertyId: z.string(),
  depositAmount: z.coerce.number(),
});

interface Property {
  id: number;
  propertyName: string;
}

interface Room {
  id: number;
  typeName: string;
  price: number;
}

interface IndividualRoom {
  id: number;
  roomNumber: string;
}

interface SelectionHistory {
  property?: Property;
  room?: Room;
  individualRoom?: IndividualRoom;
}

export default function AddRenterPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [individualRooms, setIndividualRooms] = useState<IndividualRoom[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectionHistory, setSelectionHistory] = useState<SelectionHistory>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      renterName: "",
      renterEmail: "",
      renterPhone: "",
      ktpNumber: "",
      depositAmount: 0,
    },
  });

  const canProceedToStep2 = form.watch("propertyId");
  const canProceedToStep3 = form.watch("roomId");

  const fetchProperties = async () => {
    try {
      const response = await axios.get(baseUrl + "/properties", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });
      setProperties(response.data);
    } catch (error) {
      console.log(error, "add renters error fetching properties");

      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    }
  };

  const fetchRooms = async (propertyId: string) => {
    try {
      const response = await axios.get(baseUrl + `/rooms/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });
      if (Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        setRooms([]);
        toast({
          title: "Warning",
          description: "No rooms data available",
          variant: "default",
        });
      }
    } catch (error) {
      console.log(error, "add renters error");
      setRooms([]);
      toast({
        title: "Error",
        description: "Failed to fetch rooms",
        variant: "destructive",
      });
    }
  };

  const fetchIndividualRooms = async (roomId: string) => {
    try {
      const response = await axios.get(baseUrl + `/rooms/${roomId}/individual-rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });
      setIndividualRooms(response.data);
    } catch (error) {
      console.log(error, "add renters error");

      toast({
        title: "Error",
        description: "Failed to fetch individual rooms",
        variant: "destructive",
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await axios.post(baseUrl + "/renters/add", values, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });
      toast({
        title: "Success",
        description: "Renter added successfully",
      });
      form.reset();

      navigate("/renters");
    } catch (error) {
      console.log(error, "add renters error");

      toast({
        title: "Error",
        description: "Failed to add renter",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  const renderSelectionSummary = () => (
    <div className="mt-4 p-4 bg-muted rounded-lg">
      <h3 className="font-medium mb-2">Selection Summary:</h3>
      {selectionHistory.property && <p className="text-sm">Property: {selectionHistory.property.propertyName}</p>}
      {selectionHistory.room && (
        <p className="text-sm">
          Room Type: {selectionHistory.room.typeName} - Rp{selectionHistory.room.price.toLocaleString()}
        </p>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="propertyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                const selectedProperty = properties.find((p) => p.id.toString() === value);
                setSelectionHistory((prev) => ({ ...prev, property: selectedProperty }));
                fetchRooms(value);
                form.setValue("roomId", "");
                form.setValue("individualRoomId", "");
                setCurrentStep(2);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.propertyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {renderSelectionSummary()}
      <FormField
        control={form.control}
        name="roomId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Room Type</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                const selectedRoom = rooms.find((r) => r.id.toString() === value);
                setSelectionHistory((prev) => ({ ...prev, room: selectedRoom }));
                fetchIndividualRooms(value);
                form.setValue("individualRoomId", "");
                setCurrentStep(3);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.typeName} - Rp{room.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
        Back
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {renderSelectionSummary()}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="individualRoomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room number" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {individualRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="renterName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renter Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renterEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renterPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+62xxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ktpNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KTP Number</FormLabel>
              <FormControl>
                <Input placeholder="16-digit KTP number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="joinDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Join Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leaveDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < form.getValues("joinDate") || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="depositAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deposit Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Renter"}
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Add New Renter - Step {currentStep} of 3</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && canProceedToStep2 && renderStep2()}
              {currentStep === 3 && canProceedToStep3 && renderStep3()}
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
