import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchProperties } from "@/store/properties";
import axios from "axios";
import { baseUrl } from "@/constants/baseUrl";
import { useToast } from "@/hooks/use-toast";
import { fetchRenters } from "@/store/renters";

type Room = {
  id: number;
  typeName: string;
  price: number;
  status: string;
  propertyId: number;
};

type Renter = {
  id: number;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  roomId: number;
  hasLeaved: boolean;
  propertyId: number;
};

type Property = {
  id: number;
  propertyName: string;
  Room: Room[];
};

export default function FrontDeskPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);
  const [isAddRenterOpen, setIsAddRenterOpen] = useState(false);
  const [isEndContractOpen, setIsEndContractOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const properties = useAppSelector((state) => state.properties.properties) as Property[];
  const renters = useAppSelector((state) => state.renters.renters) as Renter[];

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchRenters());
  }, [dispatch]);

  const [newRenter, setNewRenter] = useState({
    renterName: "",
    renterEmail: "",
    renterPhone: "",
    depositAmount: 0,
  });

  const [endContractStep, setEndContractStep] = useState(1);
  const [endContractDate, setEndContractDate] = useState("");
  const [returnKey, setReturnKey] = useState(false);
  const [cancelUnpaidBills, setCancelUnpaidBills] = useState(false);
  const [endContractNotes, setEndContractNotes] = useState("");

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find((p) => p.id === parseInt(propertyId));
    setSelectedProperty(property || null);
    setSelectedRenter(null); // Reset selected renter when property changes
  };

  const handleAddRenter = async () => {
    try {
      if (!selectedRoom) return;

      await axios.post(
        `${baseUrl}/renters`,
        {
          ...newRenter,
          roomId: selectedRoom.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Renter added successfully",
      });

      setIsAddRenterOpen(false);
      dispatch(fetchRenters());
      dispatch(fetchProperties());
    } catch (error) {
      console.log(error, "frontdesk page");

      toast({
        title: "Error",
        description: "Failed to add renter",
        variant: "destructive",
      });
    }
  };

  const handleEndContract = async () => {
    try {
      if (!selectedRenter) return;

      await axios.put(
        `${baseUrl}/renters/${selectedRenter.id}/end-contract`,
        {
          endDate: endContractDate,
          returnKey,
          cancelUnpaidBills,
          notes: endContractNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Contract ended successfully",
      });

      setIsEndContractOpen(false);
      setEndContractStep(1);
      setEndContractDate("");
      setReturnKey(false);
      setCancelUnpaidBills(false);
      setEndContractNotes("");
      setSelectedProperty(null);
      setSelectedRenter(null);

      dispatch(fetchRenters());
      dispatch(fetchProperties());
    } catch (error) {
      console.log(error, "frontdesk page");

      toast({
        title: "Error",
        description: "Failed to end contract",
        variant: "destructive",
      });
    }
  };

  const handleCompletePayment = async () => {
    try {
      if (!selectedRenter) return;

      await axios.put(
        `${baseUrl}/renters/${selectedRenter.id}/complete-payment`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Payment completed successfully",
      });

      setIsPaymentOpen(false);
      dispatch(fetchRenters());
      dispatch(fetchProperties());
    } catch (error) {
      console.log(error, "frontdesk page");

      toast({
        title: "Error",
        description: "Failed to complete payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Front Desk</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add New Renter */}
        <Dialog
          open={isAddRenterOpen}
          onOpenChange={(open) => {
            setIsAddRenterOpen(open);
            if (!open) {
              setNewRenter({
                renterName: "",
                renterEmail: "",
                renterPhone: "",
                depositAmount: 0,
              });
              setSelectedProperty(null);
              setSelectedRoom(null);
            }
          }}>
          <DialogTrigger asChild>
            <Button
              className="w-full h-32"
              type="button">
              <div className="text-center">
                <h3 className="font-semibold">Tambahkan Penyewa Baru</h3>
                <p className="text-sm text-gray-500">Masukkan Detail Penyewa Baru</p>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Renter</DialogTitle>
              <DialogDescription>Fill in the details to add a new renter to a property.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Property</Label>
                <Select onValueChange={handlePropertyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem
                        key={property.id}
                        value={property.id.toString()}>
                        {property.propertyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProperty && (
                <div>
                  <Label>Select Room</Label>
                  <Select onValueChange={(value) => setSelectedRoom(JSON.parse(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty.Room.filter((room) => room.status === "Available").map((room) => (
                        <SelectItem
                          key={room.id}
                          value={JSON.stringify(room)}>
                          {room.typeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Renter Name</Label>
                <Input
                  value={newRenter.renterName}
                  onChange={(e) => setNewRenter({ ...newRenter, renterName: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newRenter.renterEmail}
                  onChange={(e) => setNewRenter({ ...newRenter, renterEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newRenter.renterPhone}
                  onChange={(e) => setNewRenter({ ...newRenter, renterPhone: e.target.value })}
                />
              </div>
              <div>
                <Label>Deposit Amount</Label>
                <Input
                  type="number"
                  value={newRenter.depositAmount}
                  onChange={(e) => setNewRenter({ ...newRenter, depositAmount: parseInt(e.target.value) })}
                />
              </div>
              <Button
                onClick={handleAddRenter}
                type="button">
                Add Renter
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* End Contract */}
        <Dialog
          open={isEndContractOpen}
          onOpenChange={(open) => {
            setIsEndContractOpen(open);
            if (!open) {
              setEndContractStep(1);
              setEndContractDate("");
              setReturnKey(false);
              setCancelUnpaidBills(false);
              setEndContractNotes("");
              setSelectedProperty(null);
              setSelectedRenter(null);
            }
          }}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-32"
              type="button">
              <div className="text-center">
                <h3 className="font-semibold">Akhiri Perjanjian Penyewa</h3>
                <p className="text-sm text-gray-500">Proses Keluar/Check-Out Penyewa Active</p>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>End Renter Contract - Step {endContractStep} of 3</DialogTitle>
              <DialogDescription>
                {endContractStep === 1 && "Select a property"}
                {endContractStep === 2 && "Select a renter"}
                {endContractStep === 3 && "Complete contract termination details"}
              </DialogDescription>
            </DialogHeader>

            {endContractStep === 1 && (
              <div className="space-y-4">
                <Label>Select Property</Label>
                <Select
                  onValueChange={(value) => {
                    handlePropertyChange(value);
                    setEndContractStep(2);
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem
                        key={property.id}
                        value={property.id.toString()}>
                        {property.propertyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {endContractStep === 2 && selectedProperty && (
              <div className="space-y-4">
                <Label>Select Renter</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedRenter(JSON.parse(value));
                    setEndContractStep(3);
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a renter" />
                  </SelectTrigger>
                  <SelectContent>
                    {renters
                      .filter((renter) => !renter.hasLeaved && renter.propertyId === selectedProperty.id)
                      .map((renter) => (
                        <SelectItem
                          key={renter.id}
                          value={JSON.stringify(renter)}>
                          {renter.renterName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setEndContractStep(1)}
                  type="button">
                  Back
                </Button>
              </div>
            )}

            {endContractStep === 3 && selectedRenter && (
              <div className="space-y-4">
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endContractDate}
                    onChange={(e) => setEndContractDate(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="returnKey"
                    checked={returnKey}
                    onChange={(e) => setReturnKey(e.target.checked)}
                  />
                  <Label htmlFor="returnKey">Key returned</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cancelBills"
                    checked={cancelUnpaidBills}
                    onChange={(e) => setCancelUnpaidBills(e.target.checked)}
                  />
                  <Label htmlFor="cancelBills">Cancel unpaid bills</Label>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Input
                    value={endContractNotes}
                    onChange={(e) => setEndContractNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEndContractStep(2)}
                    type="button">
                    Back
                  </Button>
                  <Button
                    onClick={handleEndContract}
                    disabled={!endContractDate}
                    type="button">
                    End Contract
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Complete Payment */}
        <Dialog
          open={isPaymentOpen}
          onOpenChange={(open) => {
            setIsPaymentOpen(open);
            if (!open) {
              setSelectedProperty(null);
              setSelectedRenter(null);
            }
          }}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-32"
              type="button">
              <div className="text-center">
                <h3 className="font-semibold">Selesaikan Pembayaran</h3>
                <p className="text-sm text-gray-500">Pembayaran Transfer Manual/Cash</p>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>Select a property and renter to complete their payment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {properties.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No properties available.</p>
                  <p className="text-sm text-gray-400">Please add a property first.</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Select Property</Label>
                    <Select onValueChange={handlePropertyChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem
                            key={property.id}
                            value={property.id.toString()}>
                            {property.propertyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProperty && (
                    <div>
                      <Label>Select Renter</Label>
                      {renters.filter((renter) => !renter.hasLeaved && renter.propertyId === selectedProperty.id).length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No active renters in this property.</p>
                          <p className="text-sm text-gray-400">Add a renter first or select another property.</p>
                        </div>
                      ) : (
                        <Select onValueChange={(value) => setSelectedRenter(JSON.parse(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a renter" />
                          </SelectTrigger>
                          <SelectContent>
                            {renters
                              .filter((renter) => !renter.hasLeaved && renter.propertyId === selectedProperty.id)
                              .map((renter) => (
                                <SelectItem
                                  key={renter.id}
                                  value={JSON.stringify(renter)}>
                                  {renter.renterName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                  <Button
                    onClick={handleCompletePayment}
                    disabled={!selectedRenter}
                    type="button">
                    Complete Payment
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
