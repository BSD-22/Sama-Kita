import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchRenters } from "@/store/renters";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";

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
  maintenanceCategory: string;
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
  area: number;
  typeName: string;
};

export default function MaintenancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const location = useLocation();
  const maintenanceCategory = location.pathname.includes('/operational') ? 'operational' : 'non-operational';

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

  // Add this helper function at the beginning of the component
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-end">
        <Button
          onClick={() => navigate("/expenses/add")}
          className="w-full sm:w-auto">
          Add New Maintenance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renters.map((renter) =>
          renter.RenterExpenses
            .filter(expense => expense.maintenanceCategory?.toLowerCase() === maintenanceCategory)
            .map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{renter.property.propertyName}</h3>
                    <span className="text-sm text-gray-500">{formatDate(expense.serviceDate)}</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Renter:</span> {renter.renterName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Room Type:</span> {renter.room.typeName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Maintenance Type:</span> {expense.maintenanceType}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Price:</span>{" "}
                      {expense.servicePrice.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Last Payment:</span> {formatDate(expense.lastPaymentDate)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleInvoiceClick(expense.serviceInvoice)}
                    className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium">
                    View Invoice
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

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
    </div>
  );
}
