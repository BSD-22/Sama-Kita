import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchRenters } from "@/store/renters";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { baseUrl } from "@/constants/baseUrl";

type RenterExpenses = {
  id: number;
  renterId: number;
  serviceDate: string;
  serviceDescription: string;
  servicePrice: number;
  serviceInvoice: string;
  lastPaymentDate: Date;
  maintenanceType: string;
  maintenanceCategory: string;
  isPrepaid: boolean;
  durationMonths: number | null;
  startDate: Date | null;
  endDate: Date | null;
  dueDate?: Date;
  isOverdue: boolean;
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

const operationalCategories = ['Electricity', 'Water', 'Internet'];

export default function MaintenancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | undefined>(undefined);
  const [activeView, setActiveView] = useState<'owner' | 'renter'>('renter');
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [operationalSettings, setOperationalSettings] = useState<any>(null);
  const navigate = useNavigate();

  const location = useLocation();
  const isOperational = location.pathname.includes('/operational');

  const renters: Renter[] = useAppSelector((state) => state.renters.renters);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchRenters());
    if (isOperational) {
      fetchOperationalSettings();
    }
  }, []);

  const fetchOperationalSettings = async () => {
    try {
      const response = await fetch(baseUrl + '/properties/1/operational-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.access_token}`
        }
      });
      const data = await response.json();
      setOperationalSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const getExpenseStatus = (expense: RenterExpenses) => {
    if (expense.isOverdue) {
      return {
        label: 'Overdue',
        className: 'bg-red-100 text-red-800'
      };
    }
    
    const today = new Date();
    const dueDate = new Date(expense.dueDate!);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 3) {
      return {
        label: 'Due Soon',
        className: 'bg-yellow-100 text-yellow-800'
      };
    }
    
    return {
      label: 'Upcoming',
      className: 'bg-green-100 text-green-800'
    };
  };

  // Filter expenses based on type and payment method
  const filterExpenses = (expenses: RenterExpenses[]) => {
    return expenses.filter(expense => {
      const isOperationalCategory = operationalCategories.includes(expense.maintenanceCategory);
      const matchesPaymentType = activeView === 'owner' ? expense.isPrepaid : !expense.isPrepaid;
      
      if (location.pathname.includes('/operational')) {
        return isOperationalCategory && matchesPaymentType;
      } else {
        return !isOperationalCategory;
      }
    });
  };

  // Add helper to determine if expense is prepaid
  const getPaymentStatus = (expense: RenterExpenses) => {
    if (expense.isPrepaid) {
      return `Prepaid (${expense.durationMonths} months)`;
    }
    return 'Monthly Payment';
  };

  // Open the modal with the invoice link
  const handleInvoiceClick = (url: string) => {
    setInvoiceUrl(url);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Format date helper function
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not set';
    const d = new Date(date);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Format currency helper function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const handleCompletePayment = async (expense: RenterExpenses) => {
    try {
      setProcessingPayment(expense.id);
      const nextMonth = new Date(expense.lastPaymentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const response = await fetch(baseUrl + `/renterexpenses/${expense.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.access_token}`
        },
        body: JSON.stringify({
          lastPaymentDate: nextMonth.toISOString(),
          dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), expense.dueDate?.getDate() || 1).toISOString()
        })
      });

      if (response.ok) {
        dispatch(fetchRenters()); // Refresh the data
      }
    } catch (error) {
      console.error('Error completing payment:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isOperational ? 'Operational Expenses' : 'Non-Operational Expenses'}
        </h2>
        {isOperational && (
          <div className="mb-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveView('renter')}
                className={activeView === 'renter' ? 'bg-primary text-white' : ''}
              >
                Renter Payments
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('owner')}
                className={activeView === 'owner' ? 'bg-primary text-white' : ''}
              >
                Owner Payments
              </Button>
            </div>
          </div>
        )}
        <div className="space-x-4">
          {isOperational && (
            <Button
              onClick={() => navigate('/operational-settings')}
              variant="outline"
            >
              Manage Settings
            </Button>
          )}
          <Button
            onClick={() => navigate("/expenses/add")}
            className="w-full sm:w-auto"
          >
            Add New Maintenance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeView === 'owner' && operationalSettings && (
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Current Settings</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Electricity</h4>
                  <p className="text-sm">Cost: {formatCurrency(operationalSettings.electricityCost || 0)}</p>
                  <p className="text-sm">Due Day: {operationalSettings.electricityDueDay}</p>
                  <p className="text-sm">Type: {operationalSettings.electricityType === 'PREPAID' ? 'Owner Pays' : 'Renter Pays'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Water</h4>
                  <p className="text-sm">Cost: {formatCurrency(operationalSettings.waterCost || 0)}</p>
                  <p className="text-sm">Due Day: {operationalSettings.waterDueDay}</p>
                  <p className="text-sm">Type: {operationalSettings.waterType === 'PREPAID' ? 'Owner Pays' : 'Renter Pays'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Internet</h4>
                  <p className="text-sm">Cost: {formatCurrency(operationalSettings.internetCost || 0)}</p>
                  <p className="text-sm">Due Day: {operationalSettings.internetDueDay}</p>
                  <p className="text-sm">Type: {operationalSettings.internetType === 'PREPAID' ? 'Owner Pays' : 'Renter Pays'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {renters.map((renter) =>
          filterExpenses(renter.RenterExpenses).map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{renter.property.propertyName}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    expense.isPrepaid ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {expense.isPrepaid ? 'Owner Pays' : 'Renter Pays'}
                  </span>
                  {expense.dueDate && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getExpenseStatus(expense).className}`}>
                      {getExpenseStatus(expense).label}
                    </span>
                  )}
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
                    <span className="font-medium">Category:</span> {expense.maintenanceCategory}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Description:</span> {expense.serviceDescription}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Price:</span> {formatCurrency(expense.servicePrice)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Last Payment:</span> {formatDate(expense.lastPaymentDate)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment Type:</span> {getPaymentStatus(expense)}
                  </p>
                  {expense.isPrepaid && (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">Coverage Start:</span> {formatDate(expense.startDate)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Coverage End:</span> {formatDate(expense.endDate)}
                      </p>
                    </>
                  )}
                  {expense.dueDate && (
                    <p className="text-sm">
                      <span className="font-medium">Due Date:</span> {formatDate(expense.dueDate)}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleInvoiceClick(expense.serviceInvoice)}
                  className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium">
                  View Invoice
                </button>

                {activeView === 'owner' && (
                  <div className="mt-4">
                    <Button
                      onClick={() => handleCompletePayment(expense)}
                      disabled={processingPayment === expense.id}
                      className="w-full"
                      variant="secondary"
                    >
                      {processingPayment === expense.id ? (
                        "Processing..."
                      ) : (
                        <>
                          Complete Payment
                          <span className="ml-2 text-xs">
                            (Next: {formatDate(new Date(new Date(expense.lastPaymentDate).setMonth(new Date(expense.lastPaymentDate).getMonth() + 1)))})
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
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
