import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ExpenseFormData {
  isPrepaid: boolean;
  durationMonths: number | null;
  startDate: string;
  maintenanceType: string;
  maintenanceCategory: string;
  serviceDescription: string;
  servicePrice: number;
  serviceInvoice: File | null;
}

export default function ExpenseForm() {
  const [formData, setFormData] = useState<ExpenseFormData>({
    isPrepaid: false,
    durationMonths: null,
    startDate: '',
    maintenanceType: '',
    maintenanceCategory: '',
    serviceDescription: '',
    servicePrice: 0,
    serviceInvoice: null,
  });

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Payment Type</label>
        <Select onValueChange={(value) => handleChange('isPrepaid', value === 'true')}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Monthly Payment (Postpaid)</SelectItem>
            <SelectItem value="true">Prepaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.isPrepaid && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <Select onValueChange={(value) => handleChange('durationMonths', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Month</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Maintenance Type</label>
        <Select onValueChange={(value) => handleChange('maintenanceType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPERATIONAL">Operational</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select onValueChange={(value) => handleChange('maintenanceCategory', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Electricity">Electricity</SelectItem>
            <SelectItem value="Water">Water</SelectItem>
            <SelectItem value="Internet">Internet</SelectItem>
            <SelectItem value="Air Conditioning">Air Conditioning</SelectItem>
            <SelectItem value="Plumbing">Plumbing</SelectItem>
            <SelectItem value="Electrical">Electrical</SelectItem>
            <SelectItem value="Furniture">Furniture</SelectItem>
            <SelectItem value="Pest Control">Pest Control</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.serviceDescription}
          onChange={(e) => handleChange('serviceDescription', e.target.value)}
          placeholder="Enter service description"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Price</label>
        <Input
          type="number"
          value={formData.servicePrice}
          onChange={(e) => handleChange('servicePrice', parseInt(e.target.value))}
          placeholder="Enter service price"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Invoice</label>
        <Input
          type="file"
          onChange={(e) => handleChange('serviceInvoice', e.target.files?.[0] || null)}
          accept="image/*,.pdf"
        />
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
} 