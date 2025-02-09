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
};

export default function AddRenterExpenses() {
  const navigate = useNavigate();
  // const [renters, setRenters] = useState<Renter[]>([]);
  const [formData, setFormData] = useState<{
    propertyId: number;
    renterId: number;
    serviceDate: string;
    maintenanceType: string;
    servicePrice: number;
    lastPaymentDate: string;
    invoice: File | null;
  }>({
    propertyId: 0,
    renterId: 0,
    serviceDate: "",
    maintenanceType: "",
    servicePrice: 0,
    lastPaymentDate: "",
    invoice: null,
  });

  const renters: Renter[] = useAppSelector((state) => state.renters.renters);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchRenters());
  }, []);

  const handleInputChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    } else if (fieldName === "propertyId" || fieldName === "renterId" || fieldName === "servicePrice") {
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
      submissionData.append("propertyId", formData.propertyId.toString());
      submissionData.append("renterId", formData.renterId.toString());
      submissionData.append("serviceDate", formData.serviceDate);
      submissionData.append("maintenanceType", formData.maintenanceType);
      submissionData.append("servicePrice", formData.servicePrice.toString());
      submissionData.append("lastPaymentDate", formData.lastPaymentDate);

      if (formData.invoice) {
        submissionData.append("invoice", formData.invoice); // Append the file
      }

      await axios.post(baseUrl + "/renters", submissionData, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/expenses/maintenance");
    } catch (error) {
      console.log(error);
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
          <label className="block text-gray-700 font-medium mb-2">Last Payment Date`</label>
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
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
          />
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

        <Button
          type="submit"
          className="w-full text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring">
          Submit
        </Button>
      </form>
    </div>
  );
}
