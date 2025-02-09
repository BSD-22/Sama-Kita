import axios from "axios";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { baseUrl } from "@/constants/baseUrl";

type RenterExpense = {
  id: number;
  renterId: number;
  serviceDate: string;
  serviceDescription: string;
  servicePrice: number;
  serviceInvoice: string;
  videoService: string;
  lastPaymentDate: string;
};

type Room = {
  id: number;
  typeName: string;
  price: number;
  Area: number;
  propertyId: number;
};

type Property = {
  id: number;
  dueDate: string;
  propertyName: string;
  userId: number;
};

type RenterTransaction = {
  id: number;
  renterId: number;
  orderId: number;
  paymentStatus: boolean;
};

type Renters = {
  id: number;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  depositAmount: number;
  joinDate: Date;
  leaveDate: Date;
  property: Property;
  room: Room;
  dueDate: string;
  paymentStatus: boolean;
  RenterTransaction: RenterTransaction[];
  RenterExpenses: RenterExpense[];
};

export default function RentersDetail() {
  const [renters, setRenters] = useState<Renters[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | undefined>(undefined);

  const getRentersByProperty = async () => {
    try {
      const { data } = await axios.get(baseUrl + `/renters`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setRenters(data);

      // Automatically check payment status for each renter
      data.forEach((renter: Renters) => {
        renter.RenterTransaction.forEach((transaction) => {
          checkPaymentStatus(transaction.orderId, transaction.renterId);
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendInvoice = async (renterId: number) => {
    try {
      const { data } = await axios.post(
        baseUrl + "/midtrans-getaway-payment",
        { renterId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      window.open(`${data.redirect_url}`, "_blank");
    } catch (error) {
      console.log(error);
    }
  };

  const checkPaymentStatus = async (orderId: number, renterId: number) => {
    try {
      const { data } = await axios.get(baseUrl + `/check-payment-status/${orderId}/renter/${renterId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setRenters((prevRenters) =>
        prevRenters.map((renter) =>
          renter.id === renterId
            ? {
                ...renter,
                paymentStatus: data.status_code === "200" && data.transaction_status === "capture" ? true : false, // Update payment status
              }
            : renter
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (renterId: number) => {
    try {
      await axios.delete(baseUrl + `/renter/${renterId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      getRentersByProperty();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRentersByProperty();
  }, []);

  const handleInvoiceClick = (url: string) => {
    setInvoiceUrl(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Table
        className="w-full"
        style={{ tableLayout: "fixed" }}>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Periode Sewa</TableHead>
            <TableHead className="text-center">Tanggal Jatuh Tempo</TableHead>
            <TableHead className="text-center">Harga Pembayaran</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Bukti Pembayaran</TableHead>
            <TableHead className="text-center">Send Invoice</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renters.map((renter) =>
            renter.RenterExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-center">{renter.renterName}</TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  {new Date(renter.joinDate).toLocaleDateString("id-ID")} - {new Date(renter.leaveDate).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="text-center">{new Date(renter.property.dueDate).toLocaleDateString("id-ID")}</TableCell>
                <TableCell className="text-center">Rp. {renter.room.price.toLocaleString()}</TableCell>
                <TableCell className="text-center p-0 w-max">
                  <span>{renter.paymentStatus ? "Paid" : "Unpaid"}</span>
                </TableCell>
                <TableCell className="text-center">
                  {expense.serviceInvoice ? (
                    <button
                      onClick={() => handleInvoiceClick(expense.serviceInvoice)}
                      className="text-blue-500 underline">
                      View Invoice
                    </button>
                  ) : (
                    "No Invoice"
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Button onClick={() => handleSendInvoice(renter.id)}>Send Invoice</Button>
                </TableCell>
                <TableCell className="text-center flex items-center justify-center relative top-1">
                  <button className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200">
                    <X
                      size={20}
                      onClick={() => handleDelete(renter.id)}
                    />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal for displaying the invoice */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-md max-w-3xl max-h-3xl overflow-auto">
            {invoiceUrl ? (
              <img
                src={invoiceUrl}
                alt="Invoice"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p>No Invoice Available</p>
            )}
            <button
              onClick={closeModal}
              className="mt-2 text-red-500">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
