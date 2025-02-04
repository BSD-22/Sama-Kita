import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchRenters } from "@/store/renters";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

type RenterExpenses = {
  id: number;
  renterId: number;
  serviceDate: string;
  serviceDescription: string;
  servicePrice: number;
  serviceInvoice: string;
  videoService: string;
  lastPaymentDate: Date;
  maintenanceType: string;
};

type Renter = {
  id: number;
  depositAmount: number;
  ktpNumber: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  joinDate: Date;
  hasLeaved: boolean;
  room: Room;
  RenterExpenses: RenterExpenses[];
  property: Property;
};

type Property = {
  id: number;
  propertyName: string;
  userId: number;
};

type Room = {
  id: number;
  price: number;
  propertyId: number;
  totalRooms: number;
  Area: number;
  typeName: string;
};

export default function MaintenancePage() {
  // const [renters, setRenters] = useState<Renter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const renters: Renter[] = useAppSelector((state) => state.renters.renters);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchRenters());
  }, []);

  // Open the modal with the invoice link
  const handleInvoiceClick = (url: string) => {
    setInvoiceUrl(url);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Page>
      <Button
        onClick={() => navigate("/expenses/add")}
        className="mx-auto flex justify-start mb-5">
        Add New Expenses
      </Button>
      <Table className="w-full px-4 py-6">
        <TableHeader>
          <TableRow>
            <TableHead>Property Name</TableHead>
            <TableHead>Service Date</TableHead>
            <TableHead>Renter Name</TableHead>
            <TableHead>Room Type</TableHead>
            <TableHead>Maintenance Type</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Last Payment Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renters.map((renter) =>
            renter.RenterExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{renter.property.propertyName}</TableCell>
                <TableCell>{new Date(expense.serviceDate).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>{renter.renterName}</TableCell>
                <TableCell>{renter.room.typeName}</TableCell>
                <TableCell>{expense.maintenanceType}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleInvoiceClick(expense.serviceInvoice)}
                    className="text-blue-500">
                    View Invoice
                  </button>
                </TableCell>
                <TableCell>
                  {expense.servicePrice.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </TableCell>
                <TableCell>{new Date(expense.lastPaymentDate).toLocaleDateString("id-ID")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal to display the invoice image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-md max-w-3xl max-h-3xl overflow-auto">
            <img
              src={invoiceUrl}
              alt="Invoice"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={closeModal}
              className="mt-2 text-red-500">
              Close
            </button>
          </div>
        </div>
      )}
    </Page>
  );
}
