import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchRenters } from "@/store/renters";
import { baseUrl } from "@/constants/baseUrl";

type Renter = {
  id: number;
  renterName: string;
  property: {
    id: number;
  };
};

export default function AddRenterExpenses() {
  const navigate = useNavigate();
  // const [renters, setRenters] = useState<Renter[]>([]);
  const [formData, setFormData] = useState<{
    propertyId: number;
    renterId: number;
    serviceDate: string;
    maintenanceType: string;
    maintenanceCategory: string;
    servicePrice: number;
    lastPaymentDate: string;
    invoice: File | null;
    serviceDescription: string;
  }>({
    propertyId: 0,
    renterId: 0,
    serviceDate: "",
    maintenanceType: "",
    maintenanceCategory: "",
    servicePrice: 0,
    lastPaymentDate: "",
    invoice: null,
    serviceDescription: "",
  });

  const renters: Renter[] = useAppSelector((state) => state.renters.renters);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchRenters());
  }, []);

  const handleInputChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (fieldName === "invoice") {
      const target = e.target as HTMLInputElement; // Explicitly cast to HTMLInputElement
      if (target.files) {
        const file = target.files[0];
        setFormData((prev) => ({
          ...prev,
          invoice: file, // Store the File object directly
        }));
      }
    } else if (fieldName === "renterId") {
      const selectedRenter = renters.find(r => r.id === +value);
      setFormData((prev) => ({
        ...prev,
        renterId: +value,
        propertyId: selectedRenter?.property?.id || 0,
      }));
    } else if (fieldName === "propertyId" || fieldName === "servicePrice") {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: +value, // Convert to a number
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData = new FormData();
      
      // Make sure propertyId is set from the selected renter
      const selectedRenter = renters.find(r => r.id === formData.renterId);
      const propertyId = selectedRenter?.property?.id || 0;
      
      // Add the file first
      if (formData.invoice) {
        submissionData.append("serviceInvoice", formData.invoice);
      }

      // Add other form data
      submissionData.append("renterId", formData.renterId.toString());
      submissionData.append("serviceDate", formData.serviceDate);
      submissionData.append("maintenanceType", formData.maintenanceType);
      submissionData.append("maintenanceCategory", formData.maintenanceCategory);
      submissionData.append("servicePrice", formData.servicePrice.toString());
      submissionData.append("lastPaymentDate", formData.lastPaymentDate);
      submissionData.append("serviceDescription", formData.serviceDescription);

      // Log the data being sent
      console.log("Submitting data:", {
        propertyId,
        renterId: formData.renterId,
        serviceDate: formData.serviceDate,
        maintenanceType: formData.maintenanceType,
        maintenanceCategory: formData.maintenanceCategory,
        servicePrice: formData.servicePrice,
        lastPaymentDate: formData.lastPaymentDate,
        serviceDescription: formData.serviceDescription,
        hasInvoice: !!formData.invoice
      });

      const response = await axios.post(baseUrl + `/renters/expenses/${propertyId}`, submissionData, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server response:", response.data);

      if (formData.maintenanceCategory === "operational") {
        navigate("/expenses/maintenance/operational");
      } else {
        navigate("/expenses/maintenance/non-operational");
      }
    } catch (error: any) {
      console.error("Error details:", error);
      if (error.response) {
        console.error("Server error response:", error.response.data);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Add Renter Expenses</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Renter Name:</label>
          <select
            name="renterId"
            value={formData.renterId}
            onChange={(e) => handleInputChange("renterId", e)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500">
            <option value="">Select Renter</option>
            {renters.map((renter) => (
              <option
                key={renter.id}
                value={renter.id}>
                {renter.renterName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Price:</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name="servicePrice"
            value={formData.servicePrice}
            onChange={(e) => handleInputChange("servicePrice", e)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Service Date:</label>
          <input
            type="date"
            name="serviceDate"
            value={formData.serviceDate}
            onChange={(e) => handleInputChange("serviceDate", e)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Last Payment Date:</label>
          <input
            type="date"
            name="lastPaymentDate"
            value={formData.lastPaymentDate}
            onChange={(e) => handleInputChange("lastPaymentDate", e)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Maintenance Type:</label>
          <input
            type="text"
            name="maintenanceType"
            value={formData.maintenanceType}
            onChange={(e) => handleInputChange("maintenanceType", e)}
            required
            placeholder="e.g., repair, service, replacement"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Maintenance Category:</label>
          <select
            name="maintenanceCategory"
            value={formData.maintenanceCategory}
            onChange={(e) => handleInputChange("maintenanceCategory", e)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500">
            <option value="">Select Category</option>
            <option value="operational">Operational</option>
            <option value="non-operational">Non Operational</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Invoice:</label>
          <input
            type="file"
            name="invoice"
            accept="image/*"
            onChange={(e) => {
              handleInputChange("invoice", e);
            }}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Service Description:</label>
          <textarea
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={(e) => handleInputChange("serviceDescription", e)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
            rows={4}
          />
        </div>

        <Button
          type="submit"
          className="w-full text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring">
          Submit
        </Button>
      </form>
    </div>
  );
}
