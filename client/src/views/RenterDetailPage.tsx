import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import axios from "axios";
import { baseUrl } from "@/constants/baseUrl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  orderId: string;
  amount: number;
  paymentStatus: boolean;
  dueDate: string;
  paidAt: string | null;
  isOverdue: boolean;
  month: number;
  year: number;
}

interface Renter {
  id: number;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  ktpNumber: string;
  joinDate: string;
  leaveDate: string;
  hasLeaved: boolean;
  depositAmount: number;
  property: {
    id: number;
    propertyName: string;
  };
  room: {
    id: number;
    typeName: string;
    price: number;
    Area: number;
  };
  individualRoom: {
    id: number;
    roomNumber: string;
  };
  RenterTransaction: Transaction[];
}

export default function RenterDetailPage() {
  const { id } = useParams();
  const [renter, setRenter] = useState<Renter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRenter, setEditedRenter] = useState<Partial<Renter>>({});
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchRenter = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/renters/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        });
        setRenter(data);
        setEditedRenter(data);
      } catch (error) {
        console.error("Error fetching renter:", error);
      }
    };

    fetchRenter();
  }, [id]);

  const handleSave = async () => {
    try {
      const { data } = await axios.put(
        `${baseUrl}/renters/${id}`,
        editedRenter,
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );
      setRenter(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating renter:", error);
    }
  };

  const handleCompletePayment = async (transaction: Transaction) => {
    try {
      await axios.put(
        `${baseUrl}/renters/${id}/complete-manual-payment`,
        {
          transactionId: transaction.id,
        },
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
      
      const { data } = await axios.get(`${baseUrl}/renters/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });
      setRenter(data);
      setIsPaymentDialogOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete payment",
        variant: "destructive",
      });
    }
  };

  if (!renter) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{isEditing ? "Edit Renter Details" : "Renter Details"}</span>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                {isEditing ? (
                  <Input
                    value={editedRenter.renterName}
                    onChange={(e) =>
                      setEditedRenter({
                        ...editedRenter,
                        renterName: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-gray-700">{renter.renterName}</p>
                )}
              </div>

              <div>
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    value={editedRenter.renterEmail}
                    onChange={(e) =>
                      setEditedRenter({
                        ...editedRenter,
                        renterEmail: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-gray-700">{renter.renterEmail}</p>
                )}
              </div>

              <div>
                <Label>Phone</Label>
                {isEditing ? (
                  <Input
                    value={editedRenter.renterPhone}
                    onChange={(e) =>
                      setEditedRenter({
                        ...editedRenter,
                        renterPhone: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-gray-700">{renter.renterPhone}</p>
                )}
              </div>

              <div>
                <Label>KTP Number</Label>
                {isEditing ? (
                  <Input
                    value={editedRenter.ktpNumber}
                    onChange={(e) =>
                      setEditedRenter({
                        ...editedRenter,
                        ktpNumber: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-gray-700">{renter.ktpNumber}</p>
                )}
              </div>
            </div>

            {/* Property Information */}
            <div className="space-y-4">
              <div>
                <Label>Property</Label>
                <p className="text-gray-700">{renter.property.propertyName}</p>
              </div>

              <div>
                <Label>Room Type</Label>
                <p className="text-gray-700">{renter.room.typeName}</p>
              </div>

              <div>
                <Label>Room Number</Label>
                <p className="text-gray-700">{renter.individualRoom.roomNumber}</p>
              </div>

              <div>
                <Label>Deposit Amount</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedRenter.depositAmount}
                    onChange={(e) =>
                      setEditedRenter({
                        ...editedRenter,
                        depositAmount: parseInt(e.target.value),
                      })
                    }
                  />
                ) : (
                  <p className="text-gray-700">
                    Rp {renter.depositAmount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Join Date</Label>
              <p className="text-gray-700">
                {format(new Date(renter.joinDate), "PP")}
              </p>
            </div>

            <div>
              <Label>Leave Date</Label>
              <p className="text-gray-700">
                {format(new Date(renter.leaveDate), "PP")}
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renter?.RenterTransaction.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.orderId}</TableCell>
                  <TableCell>
                    {format(new Date(transaction.year, transaction.month - 1), "MMMM yyyy")}
                  </TableCell>
                  <TableCell>Rp {transaction.amount.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(transaction.dueDate), "PP")}</TableCell>
                  <TableCell>
                    <Badge variant={
                      transaction.paymentStatus ? "default" : 
                      transaction.isOverdue ? "destructive" : 
                      "secondary"
                    }>
                      {transaction.paymentStatus ? "Paid" : 
                       transaction.isOverdue ? "Overdue" : 
                       "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.paidAt ? 
                      format(new Date(transaction.paidAt), "PP") : 
                      "-"}
                  </TableCell>
                  <TableCell>
                    {!transaction.paymentStatus && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(transaction);
                          setIsPaymentDialogOpen(true);
                        }}
                      >
                        Complete Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Payment Confirmation Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Manual Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this payment as completed?
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label>Period</Label>
                <p className="text-gray-700">
                  {format(new Date(selectedPayment.year, selectedPayment.month - 1), "MMMM yyyy")}
                </p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-gray-700">
                  Rp {selectedPayment.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Due Date</Label>
                <p className="text-gray-700">
                  {format(new Date(selectedPayment.dueDate), "PP")}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPaymentDialogOpen(false);
                    setSelectedPayment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedPayment && handleCompletePayment(selectedPayment)}
                >
                  Complete Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 